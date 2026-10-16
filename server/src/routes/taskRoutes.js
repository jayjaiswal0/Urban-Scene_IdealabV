import express from 'express';
import { MaintenanceTask } from '../models/MaintenanceTask.js';
import { IncidentReport } from '../models/IncidentReport.js';
import { ReportStatusHistory } from '../models/ReportStatusHistory.js';
import { Evidence } from '../models/Evidence.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { broadcastReportStatusChanged } from '../sockets/socketHandler.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

const generateWorkOrderNumber = () => {
  const year = new Date().getFullYear();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `TSK-${year}-${randNum}`;
};

// List Maintenance Tasks
router.get('/', authenticateToken, requireRole('MUNICIPAL_AUTHORITY', 'ADMIN'), async (req, res, next) => {
  try {
    const { status, priority, department } = req.query;
    const filter = {};

    if (status && status !== 'ALL') filter.status = status;
    if (priority && priority !== 'ALL') filter.priority = priority;
    if (department && department !== 'ALL') filter.department = department;

    const tasks = await MaintenanceTask.find(filter)
      .populate('report', 'referenceId title category severity location address ward')
      .populate('supervisor', 'fullName email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
});

// Create Maintenance Task / Work Order
router.post('/', authenticateToken, requireRole('MUNICIPAL_AUTHORITY', 'ADMIN'), async (req, res, next) => {
  try {
    const { reportId, department, assignedSquad, supervisorId, priority, slaHours = 24 } = req.body;

    const report = await IncidentReport.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Target incident report not found' },
      });
    }

    const workOrderNumber = generateWorkOrderNumber();
    const slaDeadline = new Date(Date.now() + Number(slaHours) * 60 * 60 * 1000);

    const task = await MaintenanceTask.create({
      workOrderNumber,
      report: report._id,
      department: department || report.assignedDepartment || 'PUBLIC_WORKS',
      assignedSquad: assignedSquad || 'MBMC Works Unit B-4 (Cold Mix Asphalt Squad)',
      supervisor: supervisorId || req.user._id,
      priority: priority || (report.severity === 'URGENT' ? 'HIGH' : 'MEDIUM'),
      slaDeadline,
      status: 'ASSIGNED',
    });

    // Update report
    report.status = 'ASSIGNED';
    report.activeTask = task._id;
    if (department) report.assignedDepartment = department;
    await report.save();

    // Status history
    const historyEntry = await ReportStatusHistory.create({
      report: report._id,
      fromStatus: report.status,
      toStatus: 'ASSIGNED',
      changedBy: req.user._id,
      remarks: `Work order #${workOrderNumber} created and dispatched to ${task.assignedSquad}`,
    });

    // Notify citizen
    await Notification.create({
      recipient: report.reporter,
      title: 'Maintenance Crew Assigned',
      message: `Work Order #${workOrderNumber} has been assigned to repair your reported hazard. Squad: ${task.assignedSquad}`,
      type: 'TASK_ASSIGNED',
      relatedReport: report._id,
      actionUrl: `/citizen/reports/${report._id}`,
    });

    // Audit log
    await AuditLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'TASK_CREATED',
      targetEntity: 'MaintenanceTask',
      targetId: task._id.toString(),
      ipAddress: req.ip,
    });

    // Socket broadcast
    broadcastReportStatusChanged(report._id, 'ASSIGNED', historyEntry);

    res.status(201).json({
      success: true,
      message: 'Work order dispatched successfully',
      data: task,
    });
  } catch (err) {
    next(err);
  }
});

// Get Single Task Details
router.get('/:id', authenticateToken, requireRole('MUNICIPAL_AUTHORITY', 'ADMIN'), async (req, res, next) => {
  try {
    const task = await MaintenanceTask.findById(req.params.id)
      .populate({
        path: 'report',
        populate: [{ path: 'reporter', select: 'fullName email phone' }, { path: 'evidence' }],
      })
      .populate('supervisor', 'fullName email phone')
      .populate('evidenceBefore')
      .populate('evidenceAfter');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' },
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (err) {
    next(err);
  }
});

// Log Material Usage
router.post(
  '/:id/materials',
  authenticateToken,
  requireRole('MUNICIPAL_AUTHORITY', 'ADMIN'),
  async (req, res, next) => {
    try {
      const { materialName, quantity, unit } = req.body;
      if (!materialName || !quantity || !unit) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'Material name, quantity, and unit are required' },
        });
      }

      const task = await MaintenanceTask.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
      }

      task.materialsUsed.push({
        materialName,
        quantity: Number(quantity),
        unit,
        loggedAt: new Date(),
      });
      await task.save();

      res.status(201).json({
        success: true,
        message: 'Material usage logged successfully',
        data: task.materialsUsed,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Upload Post-Repair Inspection Evidence
router.post(
  '/:id/evidence',
  authenticateToken,
  requireRole('MUNICIPAL_AUTHORITY', 'ADMIN'),
  upload.array('photos', 3),
  async (req, res, next) => {
    try {
      const task = await MaintenanceTask.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
      }

      if (req.files && req.files.length > 0) {
        const evidenceDocs = await Promise.all(
          req.files.map((file) =>
            Evidence.create({
              task: task._id,
              report: task.report,
              uploadedBy: req.user._id,
              evidenceType: 'COMPLETION_VERIFICATION',
              fileUrl: `/uploads/${file.filename}`,
              fileName: file.originalname,
              fileSize: file.size,
              mimeType: file.mimetype,
            })
          )
        );

        task.evidenceAfter.push(...evidenceDocs.map((e) => e._id));
        await task.save();
      }

      res.status(201).json({
        success: true,
        message: 'Inspection evidence uploaded successfully',
        data: task.evidenceAfter,
      });
    } catch (err) {
      next(err);
    }
  }
);

// Complete Task & Mark Report Resolved
router.patch(
  '/:id/complete',
  authenticateToken,
  requireRole('MUNICIPAL_AUTHORITY', 'ADMIN'),
  async (req, res, next) => {
    try {
      const { completionNotes } = req.body;
      const task = await MaintenanceTask.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Task not found' },
        });
      }

      task.status = 'COMPLETED';
      task.completedAt = new Date();
      if (completionNotes) task.completionNotes = completionNotes;
      await task.save();

      // Update associated report
      const report = await IncidentReport.findById(task.report);
      if (report) {
        report.status = 'RESOLVED';
        await report.save();

        const historyEntry = await ReportStatusHistory.create({
          report: report._id,
          fromStatus: 'IN_PROGRESS',
          toStatus: 'RESOLVED',
          changedBy: req.user._id,
          remarks: `Maintenance work completed under Work Order #${task.workOrderNumber}. Notes: ${completionNotes || 'Site restored'}`,
        });

        // Notify citizen
        await Notification.create({
          recipient: report.reporter,
          title: 'Civic Issue Resolved',
          message: `Your report #${report.referenceId} has been resolved by Municipal Works Unit. Please view completion photos and rate the resolution.`,
          type: 'REPORT_UPDATE',
          severity: 'INFO',
          relatedReport: report._id,
          actionUrl: `/citizen/reports/${report._id}`,
        });

        // Broadcast socket event
        broadcastReportStatusChanged(report._id, 'RESOLVED', historyEntry);
      }

      res.json({
        success: true,
        message: 'Task completed and incident marked resolved',
        data: task,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
