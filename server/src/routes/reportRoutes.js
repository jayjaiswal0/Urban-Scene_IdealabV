import express from 'express';
import mongoose from 'mongoose';
import { IncidentReport } from '../models/IncidentReport.js';
import { ReportStatusHistory } from '../models/ReportStatusHistory.js';
import { Evidence } from '../models/Evidence.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { authenticateToken, requireRole, optionalAuth } from '../middleware/auth.js';
import { broadcastReportCreated, broadcastReportStatusChanged } from '../sockets/socketHandler.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Generate unique reference ID
const generateReferenceId = () => {
  const year = new Date().getFullYear();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `REF-MUM-${year}-${randNum}-${letter}`;
};

// Public Map Markers (Sanitized, no citizen PII)
router.get('/map', optionalAuth, async (req, res, next) => {
  try {
    const { category, severity, status, ward } = req.query;
    const filter = {};

    if (category && category !== 'ALL') filter.category = category;
    if (severity && severity !== 'ALL') filter.severity = severity;
    if (status && status !== 'ALL') {
      filter.status = status;
    } else {
      // By default show active reports (not rejected)
      filter.status = { $ne: 'REJECTED' };
    }
    if (ward) filter.ward = Number(ward);

    const reports = await IncidentReport.find(filter)
      .select('referenceId title category severity status location address ward createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const sanitizedMarkers = reports.map((r) => ({
      id: r._id.toString(),
      _id: r._id.toString(),
      referenceId: r.referenceId,
      title: r.title,
      category: r.category,
      severity: r.severity,
      status: r.status,
      coordinates: [r.location.coordinates[1], r.location.coordinates[0]], // [lat, lng] for Leaflet
      address: r.address,
      ward: r.ward,
      createdAt: r.createdAt,
    }));

    res.json({
      success: true,
      data: sanitizedMarkers,
    });
  } catch (err) {
    next(err);
  }
});

// Citizen Dashboard Stats
router.get('/citizen/stats', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [total, underReview, inProgress, resolved] = await Promise.all([
      IncidentReport.countDocuments({ reporter: userId }),
      IncidentReport.countDocuments({ reporter: userId, status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] } }),
      IncidentReport.countDocuments({ reporter: userId, status: { $in: ['VERIFIED', 'ASSIGNED', 'IN_PROGRESS'] } }),
      IncidentReport.countDocuments({ reporter: userId, status: 'RESOLVED' }),
    ]);

    res.json({
      success: true,
      data: { total, underReview, inProgress, resolved },
    });
  } catch (err) {
    next(err);
  }
});

// Citizen Recent Reports
router.get('/citizen/recent', authenticateToken, async (req, res, next) => {
  try {
    const reports = await IncidentReport.find({ reporter: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
});

// List Reports (Paginated & Filtered)
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { status, category, ward, search, page = 1, limit = 20, sort = 'newest' } = req.query;
    const filter = {};

    // Citizens only see their own reports; authorities see all or ward-filtered
    if (req.user.role === 'CITIZEN') {
      filter.reporter = req.user._id;
    } else if (req.user.role === 'MUNICIPAL_AUTHORITY' && req.user.ward && !ward) {
      // default municipal officer to their ward jurisdiction if not overridden
      filter.ward = req.user.ward;
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (category && category !== 'ALL') {
      filter.category = category;
    }
    if (ward && ward !== 'ALL') {
      filter.ward = Number(ward);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const skip = (Number(page) - 1) * Number(limit);

    const [reports, total] = await Promise.all([
      IncidentReport.find(filter)
        .populate('reporter', 'fullName email phone')
        .populate('evidence')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      IncidentReport.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items: reports,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// Create Civic Report
router.post('/', authenticateToken, upload.array('photos', 3), async (req, res, next) => {
  try {
    const { category, title, description, ward, address, latitude, longitude, severity } = req.body;

    if (!category || !description || !ward || !address) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Category, description, ward, and address are required' },
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_COORDINATES', message: 'Valid geographical coordinates are required' },
      });
    }

    const referenceId = generateReferenceId();

    const report = new IncidentReport({
      referenceId,
      reporter: req.user._id,
      category,
      title: title || `${category.replace('_', ' ')} on ${address.split(',')[0]}`,
      description,
      severity: severity || 'NORMAL',
      status: 'SUBMITTED',
      location: {
        type: 'Point',
        coordinates: [lng, lat], // GeoJSON order: [lng, lat]
      },
      address,
      ward: Number(ward),
    });

    // Handle evidence file uploads if present
    if (req.files && req.files.length > 0) {
      const evidenceDocs = await Promise.all(
        req.files.map((file) =>
          Evidence.create({
            report: report._id,
            uploadedBy: req.user._id,
            evidenceType: 'CITIZEN_PHOTO',
            fileUrl: `/uploads/${file.filename}`,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            geotag: { latitude: lat, longitude: lng },
          })
        )
      );
      report.evidence = evidenceDocs.map((e) => e._id);
    }

    await report.save();

    // Create initial status history entry
    await ReportStatusHistory.create({
      report: report._id,
      fromStatus: 'NONE',
      toStatus: 'SUBMITTED',
      changedBy: req.user._id,
      remarks: 'Initial civic report submitted by resident',
    });

    // Write audit log
    await AuditLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'REPORT_CREATED',
      targetEntity: 'IncidentReport',
      targetId: report._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Broadcast in real-time via Socket.IO
    const populatedReport = await IncidentReport.findById(report._id)
      .populate('reporter', 'fullName email phone')
      .populate('evidence');

    broadcastReportCreated(populatedReport);

    res.status(201).json({
      success: true,
      message: 'Report filed successfully and dispatched to municipal operations queue',
      data: populatedReport,
    });
  } catch (err) {
    next(err);
  }
});

// Get Single Report Details with Timeline
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { referenceId: req.params.id };

    const report = await IncidentReport.findOne(query)
      .populate('reporter', 'fullName email phone ward avatarUrl')
      .populate('evidence')
      .populate('activeTask')
      .populate('notes.author', 'fullName role department');

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Report not found' },
      });
    }

    // Role check: citizens can only view their own reports unless public or authorized
    const reporterId = report.reporter?._id ? report.reporter._id.toString() : report.reporter?.toString();
    if (req.user.role === 'CITIZEN' && reporterId && reporterId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to view this report' },
      });
    }

    const reportObj = report.toObject();
    // If requesting user is a citizen, hide internal notes
    if (req.user.role === 'CITIZEN' && Array.isArray(reportObj.notes)) {
      reportObj.notes = reportObj.notes.filter((n) => !n.isInternal);
    }

    const history = await ReportStatusHistory.find({ report: report._id })
      .populate('changedBy', 'fullName role department')
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      data: {
        report: reportObj,
        history,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Update Report Status (Authority action)
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole('MUNICIPAL_AUTHORITY', 'TRAFFIC_AUTHORITY', 'ADMIN'),
  async (req, res, next) => {
    try {
      const { status, remarks, internalNotes, department, resolutionNotes } = req.body;
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
      const query = isObjectId ? { _id: req.params.id } : { referenceId: req.params.id };
      const report = await IncidentReport.findOne(query);

      if (!report) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Report not found' },
        });
      }

      const validTransitions = {
        SUBMITTED: ['UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
        UNDER_REVIEW: ['VERIFIED', 'ASSIGNED', 'REQUESTED_INFORMATION', 'REJECTED'],
        VERIFIED: ['ASSIGNED', 'IN_PROGRESS', 'REJECTED'],
        ASSIGNED: ['IN_PROGRESS', 'RESOLVED'],
        IN_PROGRESS: ['RESOLVED', 'UNDER_REVIEW'],
        REQUESTED_INFORMATION: ['UNDER_REVIEW', 'SUBMITTED', 'REJECTED'],
        RESOLVED: ['IN_PROGRESS'], // Re-open if necessary
        REJECTED: [],
      };

      const allowedNextStates = validTransitions[report.status] || [];
      if (!allowedNextStates.includes(status) && req.user.role !== 'ADMIN') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TRANSITION',
            message: `Cannot transition status from ${report.status} to ${status}. Allowed next states: ${allowedNextStates.join(', ')}`,
          },
        });
      }

      const fromStatus = report.status;
      report.status = status;
      if (department) {
        report.assignedDepartment = department;
      }
      if (remarks) {
        report.citizenRemarks = remarks;
      }
      if (status === 'RESOLVED') {
        report.resolutionNotes = resolutionNotes || remarks || 'Work completed and verified by municipal authority.';
        report.resolutionDate = new Date();
      }
      if (internalNotes && internalNotes.trim()) {
        report.notes.push({
          author: req.user._id,
          note: internalNotes.trim(),
          isInternal: true,
          createdAt: new Date(),
        });
      }
      await report.save();

      // Create status history entry
      const historyEntry = await ReportStatusHistory.create({
        report: report._id,
        fromStatus,
        toStatus: status,
        changedBy: req.user._id,
        remarks: remarks || internalNotes || `Status transitioned to ${status}`,
      });

      // Notify citizen
      if (report.reporter) {
        await Notification.create({
          recipient: report.reporter,
          title: `Report Status Updated: ${status.replace('_', ' ')}`,
          message: `Your report #${report.referenceId} has been updated to ${status}. ${remarks ? `Note: ${remarks}` : ''}`,
          type: 'REPORT_UPDATE',
          relatedReport: report._id,
          actionUrl: `/citizen/reports/${report._id}`,
        });
      }

      // Write audit log
      await AuditLog.create({
        actor: req.user._id,
        actorRole: req.user.role,
        action: 'REPORT_STATUS_CHANGED',
        targetEntity: 'IncidentReport',
        targetId: report._id.toString(),
        changes: { fromStatus, toStatus: status, remarks, department, internalNotes },
        ipAddress: req.ip,
      });

      // Broadcast Socket.IO event
      broadcastReportStatusChanged(report._id, status, historyEntry);

      res.json({
        success: true,
        message: `Report status updated to ${status}`,
        data: { report, historyEntry },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Append Note
router.post('/:id/notes', authenticateToken, async (req, res, next) => {
  try {
    const { note, isInternal } = req.body;
    if (!note || note.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NOTE_EMPTY', message: 'Note text cannot be empty' },
      });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { referenceId: req.params.id };
    const report = await IncidentReport.findOne(query);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Report not found' },
      });
    }

    // Role check: citizens can only add notes to their own reports
    const reporterId = report.reporter?._id ? report.reporter._id.toString() : report.reporter?.toString();
    if (req.user.role === 'CITIZEN' && reporterId && reporterId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to append notes to this report' },
      });
    }

    const flagInternal = req.user.role !== 'CITIZEN' && Boolean(isInternal);

    report.notes.push({
      author: req.user._id,
      note: note.trim(),
      isInternal: flagInternal,
      createdAt: new Date(),
    });
    await report.save();

    res.status(201).json({
      success: true,
      message: 'Note appended successfully',
      data: report.notes,
    });
  } catch (err) {
    next(err);
  }
});

// Citizen Feedback
router.post('/:id/feedback', authenticateToken, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { referenceId: req.params.id };
    const report = await IncidentReport.findOne(query);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Report not found' },
      });
    }

    const reporterId = report.reporter?._id ? report.reporter._id.toString() : report.reporter?.toString();
    if (reporterId && reporterId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the reporter can provide feedback' },
      });
    }

    report.citizenFeedback = {
      rating: Number(rating) || 5,
      comment,
      submittedAt: new Date(),
    };
    await report.save();

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      data: report.citizenFeedback,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
