import express from 'express';
import { ParkingFacility } from '../models/ParkingFacility.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { broadcastParkingOccupancy } from '../sockets/socketHandler.js';

const router = express.Router();

// List Parking Facilities
router.get('/', async (req, res, next) => {
  try {
    const { ward, search } = req.query;
    const filter = {};

    if (ward && ward !== 'ALL') filter.ward = Number(ward);
    if (search) {
      filter.$or = [
        { facilityName: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const facilities = await ParkingFacility.find(filter).lean();

    const withVacancy = facilities.map((f) => ({
      ...f,
      vacantBays: Math.max(0, f.totalBays - f.occupiedBays),
      occupancyPercentage: Math.round((f.occupiedBays / f.totalBays) * 100),
    }));

    res.json({
      success: true,
      data: withVacancy,
    });
  } catch (err) {
    next(err);
  }
});

// Summary Metrics
router.get('/summary', async (req, res, next) => {
  try {
    const facilities = await ParkingFacility.find().lean();
    const totalBays = facilities.reduce((sum, f) => sum + f.totalBays, 0);
    const occupiedBays = facilities.reduce((sum, f) => sum + f.occupiedBays, 0);
    const evBays = facilities.reduce((sum, f) => sum + (f.evChargingBays || 0), 0);
    const fastTagCount = facilities.filter((f) => f.hasFastTag).length;

    res.json({
      success: true,
      data: {
        totalBays,
        liveAvailable: Math.max(0, totalBays - occupiedBays),
        evBays,
        fastTagCompliance: facilities.length > 0 ? Math.round((fastTagCount / facilities.length) * 100) : 100,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Update Bay Occupancy
router.patch(
  '/:id/occupancy',
  authenticateToken,
  requireRole('MUNICIPAL_AUTHORITY', 'ADMIN'),
  async (req, res, next) => {
    try {
      const { occupiedBays } = req.body;
      const facility = await ParkingFacility.findById(req.params.id);

      if (!facility) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Parking facility not found' },
        });
      }

      const count = Number(occupiedBays);
      if (isNaN(count) || count < 0 || count > facility.totalBays) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_COUNT', message: `Occupied bays must be between 0 and ${facility.totalBays}` },
        });
      }

      facility.occupiedBays = count;
      facility.lastSensorHeartbeat = new Date();
      await facility.save();

      broadcastParkingOccupancy(facility);

      res.json({
        success: true,
        message: 'Parking occupancy updated successfully',
        data: {
          facilityId: facility.facilityId,
          totalBays: facility.totalBays,
          occupiedBays: facility.occupiedBays,
          vacantBays: Math.max(0, facility.totalBays - facility.occupiedBays),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
