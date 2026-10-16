import { Server } from 'socket.io';

let ioInstance = null;

export const initSocket = (httpServer, corsOrigin) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: corsOrigin || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join room based on role or ward if provided
    socket.on('join', ({ role, ward, userId }) => {
      if (role) {
        socket.join(`role:${role}`);
      }
      if (ward) {
        socket.join(`ward:${ward}`);
      }
      if (userId) {
        socket.join(`user:${userId}`);
      }
      console.log(`[Socket.IO] Client ${socket.id} joined rooms for role=${role}, ward=${ward}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

export const broadcastReportCreated = (report) => {
  if (!ioInstance) return;

  // Sanitized report for public map clients (strictly NO citizen PII: no phone, email, or private details)
  const sanitizedReport = {
    _id: report._id,
    referenceId: report.referenceId,
    title: report.title,
    category: report.category,
    severity: report.severity,
    status: report.status,
    location: report.location,
    address: report.address,
    ward: report.ward,
    createdAt: report.createdAt,
    coordinates: report.location?.coordinates
      ? [report.location.coordinates[1], report.location.coordinates[0]]
      : undefined,
  };

  // Public broadcast (sanitized)
  ioInstance.emit('report:created', { report: sanitizedReport });

  // Authority rooms get the full dossier with evidence and reporter profile
  ioInstance
    .to('role:MUNICIPAL_AUTHORITY')
    .to('role:TRAFFIC_AUTHORITY')
    .to('role:ADMIN')
    .emit('authority:report:created', { report });

  // Dedicated broadcast to reporter's personal room
  const reporterId = report.reporter?._id ? report.reporter._id.toString() : report.reporter?.toString();
  if (reporterId) {
    ioInstance.to(`user:${reporterId}`).emit('citizen:report:created', { report });
  }

  console.log(`[Socket.IO] Broadcasted sanitized 'report:created' for ${report.referenceId} (PII protected).`);
};

export const broadcastReportStatusChanged = (reportId, status, historyEntry) => {
  if (!ioInstance) return;
  ioInstance.emit('report:statusChanged', { reportId, status, historyEntry });
  console.log(`[Socket.IO] Broadcasted 'report:statusChanged' for ${reportId} -> ${status}`);
};

export const broadcastIncidentVerified = (incident) => {
  if (!ioInstance) return;
  ioInstance.emit('incident:verified', { incident });
};

export const broadcastTrafficAdvisory = (advisory) => {
  if (!ioInstance) return;
  ioInstance.emit('advisory:broadcast', { advisory });
};

export const broadcastEmergencyCorridor = (corridor) => {
  if (!ioInstance) return;
  ioInstance.emit('corridor:activated', { corridor });
};

export const broadcastParkingOccupancy = (facility) => {
  if (!ioInstance) return;
  ioInstance.emit('parking:occupancyUpdated', {
    facilityId: facility.facilityId,
    occupiedBays: facility.occupiedBays,
    totalBays: facility.totalBays,
    vacantBays: Math.max(0, facility.totalBays - facility.occupiedBays),
  });
};
