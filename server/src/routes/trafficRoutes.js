import express from 'express';
import { TrafficObservation } from '../models/TrafficObservation.js';
import { IncidentReport } from '../models/IncidentReport.js';
import { ReportStatusHistory } from '../models/ReportStatusHistory.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { broadcastIncidentVerified, broadcastTrafficAdvisory } from '../sockets/socketHandler.js';

const router = express.Router();

// Get Corridor Telemetry
router.get('/corridors', async (req, res, next) => {
  try {
    let corridors = await TrafficObservation.find().lean();

    // If no corridors exist yet, return active defaults
    if (!corridors || corridors.length === 0) {
      corridors = [
        {
          corridorId: 'CORR-WEH-01',
          corridorName: 'Western Express Highway (Kashimira - Dahisar)',
          speedIndexKmH: 14,
          baselineSpeedKmH: 50,
          congestionLevel: 'HEAVY',
          isSimulated: true,
          cctvStreamUrl: '/demo/cctv_weh.mp4',
        },
        {
          corridorId: 'CORR-GHOD-02',
          corridorName: 'Ghodbunder Link Road',
          speedIndexKmH: 32,
          baselineSpeedKmH: 45,
          congestionLevel: 'MODERATE',
          isSimulated: true,
          cctvStreamUrl: '/demo/cctv_ghod.mp4',
        },
        {
          corridorId: 'CORR-STAT-03',
          corridorName: 'Station Road Feeder Arterial',
          speedIndexKmH: 18,
          baselineSpeedKmH: 30,
          congestionLevel: 'MODERATE',
          isSimulated: true,
        },
      ];
    }

    res.json({
      success: true,
      data: corridors,
    });
  } catch (err) {
    next(err);
  }
});

// Triangulate Incident Clusters (Corroborating reports within radius)
router.get('/incidents/triangulate', authenticateToken, requireRole('TRAFFIC_AUTHORITY', 'ADMIN'), async (req, res, next) => {
  try {
    const { lat = 19.2812, lng = 72.8561, radiusMeters = 200 } = req.query;

    const nearbyReports = await IncidentReport.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(radiusMeters),
        },
      },
      status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED'] },
    })
      .populate('reporter', 'fullName phone')
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        clusterSize: nearbyReports.length,
        reports: nearbyReports,
        corroborationConfidence: Math.min(100, nearbyReports.length * 35),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Verify Incident & Dispatch Marshal
router.patch('/verify/:id', authenticateToken, requireRole('TRAFFIC_AUTHORITY', 'ADMIN'), async (req, res, next) => {
  try {
    const { action, remarks, dispatchMarshal } = req.body;
    const report = await IncidentReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Report not found' },
      });
    }

    const newStatus = action === 'DISMISS' ? 'REJECTED' : 'VERIFIED';
    const oldStatus = report.status;
    report.status = newStatus;
    await report.save();

    const historyEntry = await ReportStatusHistory.create({
      report: report._id,
      fromStatus: oldStatus,
      toStatus: newStatus,
      changedBy: req.user._id,
      remarks: remarks || (action === 'DISMISS' ? 'Dismissed as false alert by Traffic Police' : 'Verified hazard; Traffic Marshal dispatched'),
    });

    if (newStatus === 'VERIFIED') {
      broadcastIncidentVerified({
        id: report._id,
        referenceId: report.referenceId,
        location: report.location.coordinates,
        severity: report.severity,
        dispatchMarshal: Boolean(dispatchMarshal),
      });
    }

    res.json({
      success: true,
      message: `Incident ${action === 'DISMISS' ? 'dismissed' : 'verified and marshals alerted'}`,
      data: { report, historyEntry },
    });
  } catch (err) {
    next(err);
  }
});

// Broadcast Route Advisory & Detour
router.post('/advisories', authenticateToken, requireRole('TRAFFIC_AUTHORITY', 'ADMIN'), async (req, res, next) => {
  try {
    const { title, description, corridorId = 'CORR-WEH-01', detourRoute } = req.body;

    const advisory = {
      title: title || 'Western Express Highway Congestion Detour',
      description: description || 'Severe congestion near Kashimira Flyover. Traffic diverted via Feeder Arterial.',
      detourRoute: detourRoute || [
        { latitude: 19.284, longitude: 72.854 },
        { latitude: 19.288, longitude: 72.858 },
        { latitude: 19.292, longitude: 72.862 },
      ],
      issuedBy: req.user._id,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
    };

    let observation = await TrafficObservation.findOne({ corridorId });
    if (!observation) {
      observation = new TrafficObservation({
        corridorId,
        corridorName: 'Western Express Highway - Kashimira',
        speedIndexKmH: 12,
        congestionLevel: 'HEAVY',
      });
    }

    observation.activeAdvisory = advisory;
    await observation.save();

    broadcastTrafficAdvisory(advisory);

    res.status(201).json({
      success: true,
      message: 'Traffic advisory broadcasted across platform',
      data: advisory,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
