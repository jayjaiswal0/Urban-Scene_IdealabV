# Stitch Urban Mobility Coordination Platform (UMCP) — Database Schema Specification

## 1. Overview & MongoDB Architecture

The platform uses MongoDB as the authoritative source of truth. All models feature strict Mongoose schemas, field-level validation, compound indexes for geo-spatial and filtered queries, timestamps (`createdAt`, `updatedAt`), and referential integrity rules.

---

## 2. Models & Schema Definitions

### 2.1 User Model (`User`)
Stores authenticated accounts across citizens, municipal engineers, traffic enforcement, emergency dispatchers, and system administrators.

```javascript
{
  _id: ObjectId,
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false }, // bcrypt hash (12 rounds)
  phone: { type: String, required: true, trim: true },
  role: { 
    type: String, 
    enum: ['CITIZEN', 'MUNICIPAL_AUTHORITY', 'TRAFFIC_AUTHORITY', 'EMERGENCY_SERVICE', 'ADMIN'], 
    default: 'CITIZEN', 
    index: true 
  },
  ward: { type: Number, required: true, min: 1, max: 24, default: 14 },
  employeeId: { type: String, trim: true, sparse: true },
  department: { type: String, enum: ['PUBLIC_WORKS', 'TRAFFIC_POLICE', 'DRAINAGE', 'ELECTRICAL', 'SOLID_WASTE', 'EMERGENCY_OPS', 'NONE'], default: 'NONE' },
  avatarUrl: { type: String, default: null },
  trustScore: { type: Number, min: 0, max: 1000, default: 750 },
  badges: [{ type: String }], // e.g. ['Civic Champion', 'Ward 14 Guardian']
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, enum: ['en', 'mr', 'hi'], default: 'en' },
    notifications: {
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    }
  },
  isActive: { type: Boolean, default: true },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  lastLogin: { type: Date, default: null },
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes**:
- `{ email: 1 }` (unique)
- `{ role: 1, ward: 1 }`
- `{ resetPasswordToken: 1 }`

---

### 2.2 IncidentReport Model (`IncidentReport`)
Stores citizen-submitted hazards and municipal issues.

```javascript
{
  _id: ObjectId,
  referenceId: { type: String, required: true, unique: true, index: true }, // e.g. REF-MUM-2024-8841
  reporter: { type: ObjectId, ref: 'User', required: true, index: true },
  category: { 
    type: String, 
    enum: ['POTHOLE', 'TRAFFIC_SIGNAL', 'GARBAGE', 'WATERLOGGING', 'STREETLIGHT', 'ROAD_HAZARD', 'OTHER'], 
    required: true, 
    index: true 
  },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
  severity: { type: String, enum: ['LOW', 'NORMAL', 'URGENT'], default: 'NORMAL', index: true },
  status: { 
    type: String, 
    enum: ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'REQUESTED_INFORMATION'], 
    default: 'SUBMITTED', 
    index: true 
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  address: { type: String, required: true, trim: true },
  ward: { type: Number, required: true, min: 1, max: 24, index: true },
  evidence: [{ type: ObjectId, ref: 'Evidence' }],
  assignedDepartment: { type: String, enum: ['PUBLIC_WORKS', 'TRAFFIC_POLICE', 'DRAINAGE', 'ELECTRICAL', 'SOLID_WASTE', 'UNASSIGNED'], default: 'UNASSIGNED' },
  activeTask: { type: ObjectId, ref: 'MaintenanceTask', default: null },
  citizenFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date
  },
  notes: [{
    author: { type: ObjectId, ref: 'User' },
    note: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: Date,
  updatedAt: Date
}
```
**Indexes**:
- `{ referenceId: 1 }` (unique)
- `{ location: '2dsphere' }` (geospatial query support)
- `{ status: 1, ward: 1, severity: 1 }`
- `{ reporter: 1, createdAt: -1 }`

---

### 2.3 ReportStatusHistory Model (`ReportStatusHistory`)
Maintains an immutable audit log of status progressions for each report.

```javascript
{
  _id: ObjectId,
  report: { type: ObjectId, ref: 'IncidentReport', required: true, index: true },
  fromStatus: { type: String, required: true },
  toStatus: { type: String, required: true },
  changedBy: { type: ObjectId, ref: 'User', required: true },
  remarks: { type: String, trim: true },
  evidence: [{ type: ObjectId, ref: 'Evidence' }],
  createdAt: { type: Date, default: Date.now, index: true }
}
```

---

### 2.4 Evidence Model (`Evidence`)
Tracks photographic and documentary attachments.

```javascript
{
  _id: ObjectId,
  report: { type: ObjectId, ref: 'IncidentReport', index: true },
  task: { type: ObjectId, ref: 'MaintenanceTask', index: true },
  uploadedBy: { type: ObjectId, ref: 'User', required: true },
  evidenceType: { type: String, enum: ['CITIZEN_PHOTO', 'OFFICER_INSPECTION', 'COMPLETION_VERIFICATION', 'DOCUMENT'], required: true },
  fileUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  geotag: {
    latitude: Number,
    longitude: Number,
    capturedAt: Date
  },
  createdAt: { type: Date, default: Date.now }
}
```

---

### 2.5 MaintenanceTask Model (`MaintenanceTask`)
Represents work orders dispatched to municipal road and repair squads.

```javascript
{
  _id: ObjectId,
  workOrderNumber: { type: String, required: true, unique: true, index: true }, // e.g. TSK-2024-0418
  report: { type: ObjectId, ref: 'IncidentReport', required: true, index: true },
  department: { type: String, required: true },
  assignedSquad: { type: String, required: true }, // e.g. 'MBMC Works Unit B-4'
  supervisor: { type: ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['ASSIGNED', 'IN_PROGRESS', 'PENDING_INSPECTION', 'COMPLETED', 'CANCELLED'], default: 'ASSIGNED', index: true },
  priority: { type: String, enum: ['ROUTINE', 'MEDIUM', 'HIGH', 'EMERGENCY'], default: 'MEDIUM' },
  slaDeadline: { type: Date, required: true },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  materialsUsed: [{
    materialName: { type: String, required: true }, // e.g. 'Cold Mix Asphalt'
    quantity: { type: Number, required: true },
    unit: { type: String, required: true } // e.g. 'kg', 'bags', 'liters'
  }],
  completionNotes: { type: String },
  evidenceBefore: [{ type: ObjectId, ref: 'Evidence' }],
  evidenceAfter: [{ type: ObjectId, ref: 'Evidence' }],
  createdAt: Date,
  updatedAt: Date
}
```

---

### 2.6 TrafficObservation Model (`TrafficObservation`)
Stores speed drops, traffic corridor congestion readings, and advisory detours.

```javascript
{
  _id: ObjectId,
  corridorName: { type: String, required: true, index: true }, // e.g. 'Western Express Highway - Kashimira'
  speedIndexKmH: { type: Number, required: true },
  baselineSpeedKmH: { type: Number, required: true, default: 45 },
  congestionLevel: { type: String, enum: ['FREE_FLOW', 'MODERATE', 'HEAVY', 'STANDSTILL'], required: true },
  isSimulated: { type: Boolean, default: true },
  activeAdvisory: {
    title: String,
    description: String,
    detourRoute: [{ latitude: Number, longitude: Number }],
    issuedBy: { type: ObjectId, ref: 'User' },
    issuedAt: Date,
    expiresAt: Date
  },
  relatedReports: [{ type: ObjectId, ref: 'IncidentReport' }],
  cctvStreamUrl: { type: String },
  updatedAt: { type: Date, default: Date.now }
}
```

---

### 2.7 EmergencyRequest Model (`EmergencyRequest`)
Stores hospital green corridor directives and high-priority dispatch requests.

```javascript
{
  _id: ObjectId,
  requestNumber: { type: String, required: true, unique: true },
  dispatcher: { type: ObjectId, ref: 'User', required: true },
  vehicle: { type: ObjectId, ref: 'EmergencyVehicle' },
  originHospital: { type: String, required: true },
  destinationHospital: { type: String, required: true },
  corridorRoute: [{ latitude: Number, longitude: Number }],
  status: { type: String, enum: ['REQUESTED', 'ACTIVE', 'COMPLETED', 'TERMINATED'], default: 'ACTIVE' },
  signalPriorityLevel: { type: String, enum: ['LEVEL_I', 'LEVEL_II', 'LEVEL_III'], default: 'LEVEL_II' },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 2.8 EmergencyVehicle Model (`EmergencyVehicle`)
Stores emergency ambulances and fire tenders with telemetry.

```javascript
{
  _id: ObjectId,
  vehicleCallSign: { type: String, required: true, unique: true }, // e.g. 'EMS-AMB-104'
  vehicleType: { type: String, enum: ['AMBULANCE', 'FIRE_TENDER', 'DISASTER_RESCUE'], required: true },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  status: { type: String, enum: ['IDLE', 'EN_ROUTE', 'ON_SCENE', 'TRANSPORTING'], default: 'IDLE' },
  assignedCorridor: { type: ObjectId, ref: 'EmergencyRequest' },
  updatedAt: { type: Date, default: Date.now }
}
```

---

### 2.9 ParkingFacility Model (`ParkingFacility`)
Stores municipal multi-level and on-street smart parking facilities.

```javascript
{
  _id: ObjectId,
  facilityName: { type: String, required: true, trim: true }, // e.g. 'Station West Multi-Level Car Park'
  ward: { type: Number, required: true, min: 1, max: 24, index: true },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  totalBays: { type: Number, required: true },
  occupiedBays: { type: Number, required: true, default: 0 },
  evChargingBays: { type: Number, default: 0 },
  hasFastTag: { type: Boolean, default: true },
  tariffs: {
    hourlyRate: { type: Number, required: true },
    dailyRate: { type: Number, required: true },
    twoWheelerHourlyRate: { type: Number, required: true }
  },
  isSensorHubConnected: { type: Boolean, default: true },
  lastSensorHeartbeat: { type: Date, default: Date.now },
  createdAt: Date,
  updatedAt: Date
}
```

---

### 2.10 Notification Model (`Notification`)
Stores user-targeted civic notices, status updates, and advisories.

```javascript
{
  _id: ObjectId,
  recipient: { type: ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['REPORT_UPDATE', 'TASK_ASSIGNED', 'TRAFFIC_ADVISORY', 'EMERGENCY_ALERT', 'SYSTEM'], default: 'REPORT_UPDATE' },
  severity: { type: String, enum: ['INFO', 'WARNING', 'CRITICAL'], default: 'INFO' },
  relatedReport: { type: ObjectId, ref: 'IncidentReport' },
  actionUrl: { type: String },
  isRead: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
}
```

---

### 2.11 AuditLog Model (`AuditLog`)
Tracks administrative actions, role modifications, status changes, and sensitive access.

```javascript
{
  _id: ObjectId,
  actor: { type: ObjectId, ref: 'User', required: true, index: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true }, // e.g. 'USER_ROLE_UPDATED', 'REPORT_STATUS_CHANGED'
  targetEntity: { type: String, required: true }, // e.g. 'IncidentReport', 'User'
  targetId: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  changes: { type: Object }, // Before and after delta
  createdAt: { type: Date, default: Date.now, index: true }
}
```
