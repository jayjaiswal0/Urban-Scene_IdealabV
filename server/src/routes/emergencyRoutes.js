import express from 'express';
import { EmergencyRequest } from '../models/EmergencyRequest.js';
import { EmergencyVehicle } from '../models/EmergencyVehicle.js';
import { IncidentReport } from '../models/IncidentReport.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { broadcastEmergencyCorridor } from '../sockets/socketHandler.js';

const router = express.Router();

// Emergency Operations Overview
router.get('/overview', authenticateToken, requireRole('EMERGENCY_SERVICE', 'ADMIN'), async (req, res, next) => {
  try {
    const [criticalHazards, activeCorridors, vehicles] = await Promise.all([
      IncidentReport.find({ severity: 'URGENT', status: { $ne: 'RESOLVED' } })
        .limit(10)
        .lean(),
      EmergencyRequest.find({ status: 'ACTIVE' })
        .populate('vehicle')
        .populate('dispatcher', 'fullName email')
        .lean(),
      EmergencyVehicle.find().lean(),
    ]);

    res.json({
      success: true,
      data: {
        criticalHazardsCount: criticalHazards.length,
        criticalHazards,
        activeCorridorsCount: activeCorridors.length,
        activeCorridors,
        vehicles,
        averageClearanceMinutes: 8.5,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Issue Corridor Clearance Directive
router.post('/corridors', authenticateToken, requireRole('EMERGENCY_SERVICE', 'ADMIN'), async (req, res, next) => {
  try {
    const { originHospital, destinationHospital, signalPriorityLevel = 'LEVEL_II', vehicleId } = req.body;

    const requestNumber = `EMS-CORR-${Date.now().toString().slice(-6)}`;
    const corridorRoute = [
      { latitude: 19.281, longitude: 72.856 },
      { latitude: 19.289, longitude: 72.862 },
      { latitude: 19.297, longitude: 72.871 },
    ];

    const corridor = await EmergencyRequest.create({
      requestNumber,
      dispatcher: req.user._id,
      vehicle: vehicleId || null,
      originHospital: originHospital || 'Bhayandar West Municipal Hospital',
      destinationHospital: destinationHospital || 'MMR Tertiary Trauma Care Center (WEH)',
      corridorRoute,
      signalPriorityLevel,
      status: 'ACTIVE',
    });

    broadcastEmergencyCorridor(corridor);

    res.status(201).json({
      success: true,
      message: 'Green Corridor directive activated with automated signal pre-emption',
      data: corridor,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
