import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, closeDB } from '../config/db.js';
import {
  User,
  IncidentReport,
  ReportStatusHistory,
  ParkingFacility,
  TrafficObservation,
  EmergencyVehicle,
  Notification,
} from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Starting UMCP database seeding...');
    await connectDB();

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      IncidentReport.deleteMany({}),
      ReportStatusHistory.deleteMany({}),
      ParkingFacility.deleteMany({}),
      TrafficObservation.deleteMany({}),
      EmergencyVehicle.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('[Seeder] Cleared previous database records.');

    // 1. Seed Core Role Users
    const defaultPassword = 'Password@123';

    const citizen = await User.create({
      fullName: 'Aarav Sharma',
      email: 'citizen@mbmc.gov.in',
      phone: '+91 98201 12345',
      password: defaultPassword,
      role: 'CITIZEN',
      ward: 14,
      trustScore: 820,
      badges: ['Level 2 Champion', 'Ward 14 Guardian', 'Fast-Track Reporter'],
    });

    const municipalOfficer = await User.create({
      fullName: 'Er. Rajesh K. Shinde',
      email: 'officer.muni@mbmc.gov.in',
      phone: '+91 98202 23456',
      password: defaultPassword,
      role: 'MUNICIPAL_AUTHORITY',
      ward: 14,
      employeeId: 'MBMC-ENG-9402',
      department: 'PUBLIC_WORKS',
    });

    const trafficInspector = await User.create({
      fullName: 'Insp. Vikram Jadhav',
      email: 'inspector.traffic@mbmc.gov.in',
      phone: '+91 98203 34567',
      password: defaultPassword,
      role: 'TRAFFIC_AUTHORITY',
      ward: 14,
      employeeId: 'TP-INSP-408',
      department: 'TRAFFIC_POLICE',
    });

    const emergencyDispatcher = await User.create({
      fullName: 'Dr. Sunita Deshmukh',
      email: 'dispatcher.ems@mbmc.gov.in',
      phone: '+91 98204 45678',
      password: defaultPassword,
      role: 'EMERGENCY_SERVICE',
      ward: 14,
      employeeId: 'EMS-DISP-012',
      department: 'EMERGENCY_OPS',
    });

    const admin = await User.create({
      fullName: 'Pooja Kulkarni (Administrator)',
      email: 'admin@mbmc.gov.in',
      phone: '+91 98205 56789',
      password: defaultPassword,
      role: 'ADMIN',
      ward: 14,
      employeeId: 'MBMC-ADM-001',
    });

    console.log('[Seeder] Created 5 Canonical Users:');
    console.log(' - CITIZEN: citizen@mbmc.gov.in (Password@123)');
    console.log(' - MUNICIPAL: officer.muni@mbmc.gov.in (Password@123)');
    console.log(' - TRAFFIC: inspector.traffic@mbmc.gov.in (Password@123)');
    console.log(' - EMERGENCY: dispatcher.ems@mbmc.gov.in (Password@123)');
    console.log(' - ADMIN: admin@mbmc.gov.in (Password@123)');

    // 2. Seed Smart Parking Facilities
    const parkingFacilities = await ParkingFacility.insertMany([
      {
        facilityName: 'Station West Multi-Level Car Park',
        facilityId: 'PKG-MLCP-01',
        ward: 14,
        address: 'Station Road West, Mira Road, Ward 14',
        location: { type: 'Point', coordinates: [72.8552, 19.2815] },
        totalBays: 180,
        occupiedBays: 112,
        evChargingBays: 16,
        hasFastTag: true,
        tariffs: { hourlyRate: 30, dailyRate: 200, twoWheelerHourlyRate: 10 },
      },
      {
        facilityName: 'Kanakia Central Commercial Bays',
        facilityId: 'PKG-KAN-02',
        ward: 14,
        address: 'Kanakia Park Main Boulevard, Ward 14',
        location: { type: 'Point', coordinates: [72.8588, 19.2862] },
        totalBays: 120,
        occupiedBays: 84,
        evChargingBays: 8,
        hasFastTag: true,
        tariffs: { hourlyRate: 40, dailyRate: 250, twoWheelerHourlyRate: 15 },
      },
      {
        facilityName: 'Bhayandar East Commuter Lot',
        facilityId: 'PKG-BHAY-03',
        ward: 1,
        address: 'Navghar Road near Railway Platform 1, Ward 1',
        location: { type: 'Point', coordinates: [72.8519, 19.3012] },
        totalBays: 240,
        occupiedBays: 195,
        evChargingBays: 24,
        hasFastTag: true,
        tariffs: { hourlyRate: 25, dailyRate: 180, twoWheelerHourlyRate: 10 },
      },
      {
        facilityName: 'Penkarpada Municipal Transit Plaza',
        facilityId: 'PKG-PENK-04',
        ward: 9,
        address: 'WEH Junction, Penkarpada, Ward 9',
        location: { type: 'Point', coordinates: [72.8681, 19.2745] },
        totalBays: 90,
        occupiedBays: 35,
        evChargingBays: 6,
        hasFastTag: true,
        tariffs: { hourlyRate: 30, dailyRate: 220, twoWheelerHourlyRate: 10 },
      },
    ]);
    console.log(`[Seeder] Created ${parkingFacilities.length} Parking Facilities.`);

    // 3. Seed Traffic Corridors
    await TrafficObservation.insertMany([
      {
        corridorId: 'CORR-WEH-01',
        corridorName: 'Western Express Highway (Kashimira Flyover)',
        speedIndexKmH: 14,
        baselineSpeedKmH: 50,
        congestionLevel: 'HEAVY',
        isSimulated: true,
        cctvStreamUrl: '/demo/cctv_weh.mp4',
        activeAdvisory: {
          title: 'Arterial Congestion Detour',
          description: 'Spill and roadwork near Kashimira Flyover. Speeds dropped by 72%. Use Mira-Bhayandar feeder road.',
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        },
      },
      {
        corridorId: 'CORR-GHOD-02',
        corridorName: 'Ghodbunder Link Road',
        speedIndexKmH: 34,
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
    ]);
    console.log('[Seeder] Created Traffic Observation Corridors.');

    // 4. Seed Emergency Vehicles
    await EmergencyVehicle.insertMany([
      {
        vehicleCallSign: 'EMS-AMB-104',
        vehicleType: 'AMBULANCE',
        currentLocation: { type: 'Point', coordinates: [72.8561, 19.2812] },
        status: 'EN_ROUTE',
      },
      {
        vehicleCallSign: 'EMS-AMB-208',
        vehicleType: 'AMBULANCE',
        currentLocation: { type: 'Point', coordinates: [72.8624, 19.2891] },
        status: 'IDLE',
      },
      {
        vehicleCallSign: 'FIRE-TND-01',
        vehicleType: 'FIRE_TENDER',
        currentLocation: { type: 'Point', coordinates: [72.8519, 19.3012] },
        status: 'IDLE',
      },
    ]);
    console.log('[Seeder] Created Emergency Dispatch Vehicles.');

    // 5. Seed Initial Incident Reports
    const sampleReports = [
      {
        referenceId: 'REF-MUM-2024-8841-B',
        reporter: citizen._id,
        category: 'POTHOLE',
        title: 'Deep road crater expanding across northbound lane',
        description: 'Large crater near Kanakia junction causing severe motorcycle skid hazard and traffic bottleneck.',
        severity: 'URGENT',
        status: 'VERIFIED',
        location: { type: 'Point', coordinates: [72.8561, 19.2812] },
        address: 'Kanakia Road opposite Cinepolis, Ward 14',
        ward: 14,
        assignedDepartment: 'PUBLIC_WORKS',
      },
      {
        referenceId: 'REF-MUM-2024-5120-W',
        reporter: citizen._id,
        category: 'WATERLOGGING',
        title: 'Severe monsoon drainage choke and waterlogging',
        description: '14cm standing water overflowing from stormwater culvert, blocking pedestrian walkway and left lane.',
        severity: 'URGENT',
        status: 'UNDER_REVIEW',
        location: { type: 'Point', coordinates: [72.8595, 19.2842] },
        address: 'Shanti Park underpass, Ward 14',
        ward: 14,
        assignedDepartment: 'DRAINAGE',
      },
      {
        referenceId: 'REF-MUM-2024-3094-T',
        reporter: citizen._id,
        category: 'TRAFFIC_SIGNAL',
        title: 'Flashing amber failure on 4-way intersection signal',
        description: 'Traffic light controller stuck in flashing mode during peak school hours, manual marshal required.',
        severity: 'NORMAL',
        status: 'SUBMITTED',
        location: { type: 'Point', coordinates: [72.8531, 19.2798] },
        address: 'Station Road 4-Way Cross, Ward 14',
        ward: 14,
        assignedDepartment: 'TRAFFIC_POLICE',
      },
      {
        referenceId: 'REF-MUM-2024-1182-R',
        reporter: citizen._id,
        category: 'ROAD_HAZARD',
        title: 'Unbarricaded trench excavation across roadway',
        description: 'Utility cable digging trench left open without reflective signage or warning cones.',
        severity: 'NORMAL',
        status: 'RESOLVED',
        location: { type: 'Point', coordinates: [72.8645, 19.2905] },
        address: 'Beverly Park Ring Road, Ward 14',
        ward: 14,
        assignedDepartment: 'PUBLIC_WORKS',
      },
    ];

    for (const r of sampleReports) {
      const createdReport = await IncidentReport.create(r);
      await ReportStatusHistory.create({
        report: createdReport._id,
        fromStatus: 'NONE',
        toStatus: createdReport.status,
        changedBy: citizen._id,
        remarks: 'Initial report seeded for demonstration',
      });
    }

    console.log(`[Seeder] Created ${sampleReports.length} Initial Incident Reports.`);

    // 6. Seed Citizen Notification
    await Notification.create({
      recipient: citizen._id,
      title: 'Report Verified by Municipal Field Officer',
      message: 'Your report REF-MUM-2024-8841-B on Kanakia Road has been verified. Inspection squad B-4 scheduled.',
      type: 'REPORT_UPDATE',
      severity: 'INFO',
      actionUrl: '/citizen/my-reports',
    });

    console.log('[Seeder] Database successfully seeded with full demonstration dataset!');
  } catch (err) {
    console.error('[Seeder] Error during database seeding:', err);
    throw err;
  }
};

// If run directly from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(async () => {
      await closeDB();
      process.exit(0);
    })
    .catch(async () => {
      await closeDB();
      process.exit(1);
    });
}
