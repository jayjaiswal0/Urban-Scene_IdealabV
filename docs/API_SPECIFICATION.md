# Stitch Urban Mobility Coordination Platform (UMCP) — REST API Specification (`/api/v1`)

## 1. Global Conventions

- **Base URL**: `/api/v1`
- **Standard Envelope**:
```json
{
  "success": true,
  "data": {},
  "message": "Optional human-readable feedback"
}
```
- **Error Envelope**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | INTERNAL_ERROR",
    "message": "Detailed error message",
    "details": []
  }
}
```
- **Authentication**: Bearer JWT in `Authorization` header (`Bearer <token>`) or `umcp_token` HTTP-only cookie.
- **Pagination Format**: `?page=1&limit=20` returns `{ items: [], pagination: { total, page, limit, pages } }`.

---

## 2. API Endpoints Catalog

### 2.1 Authentication & Profile (`/api/v1/auth`, `/api/v1/users`)

#### `POST /api/v1/auth/register`
- **Role**: Public
- **Body**: `{ fullName, email, phone, ward, password, confirmPassword, agreeTerms, urgentAlerts }`
- **Response**: `201 Created` -> `{ user: { id, fullName, email, role: 'CITIZEN', ward } }`

#### `POST /api/v1/auth/login`
- **Role**: Public
- **Body**: `{ email, password, rememberMe }`
- **Response**: `200 OK` -> `{ token, user: { id, fullName, email, role, ward, avatarUrl } }`

#### `POST /api/v1/auth/forgot-password`
- **Role**: Public
- **Body**: `{ email, role }`
- **Response**: `200 OK` -> `{ message: "Reset instructions dispatched", simulationUrl: "/reset-password?token=..." }`

#### `GET /api/v1/users/me`
- **Role**: Authenticated (Any)
- **Response**: `200 OK` -> Full `User` profile with trustScore, badges, preferences.

#### `PATCH /api/v1/users/me`
- **Role**: Authenticated (Any)
- **Body**: `{ phone, ward, preferences, language }`
- **Response**: `200 OK` -> Updated `User` profile.

#### `POST /api/v1/auth/logout`
- **Role**: Authenticated (Any)
- **Response**: `200 OK` -> Clears cookie session.

---

### 2.2 Reports & Hazard Lifecycle (`/api/v1/reports`)

#### `GET /api/v1/reports`
- **Role**: Authenticated
  - `CITIZEN`: Returns only reports filed by the logged-in user.
  - `MUNICIPAL_AUTHORITY` / `TRAFFIC_AUTHORITY` / `ADMIN`: Returns all reports with filters.
- **Query Params**: `?status=...&ward=...&category=...&search=...&page=1&limit=20`
- **Response**: `200 OK` -> `{ items: [ IncidentReport ], pagination: { ... } }`

#### `POST /api/v1/reports`
- **Role**: `CITIZEN`
- **Body**: Form data `{ category, title, description, ward, address, coordinates: [lng, lat], severity, photoUrls: [] }`
- **Socket Emission**: Emits `report:created` to all clients.
- **Response**: `201 Created` -> `{ report: IncidentReport }`

#### `GET /api/v1/reports/map`
- **Role**: Public / All
- **Query Params**: `?layer=...&bbox=...`
- **Response**: `200 OK` -> Sanitized markers `[ { id, referenceId, category, severity, status, coordinates, address, createdAt } ]` (No citizen PII).

#### `GET /api/v1/reports/:id`
- **Role**: Authenticated
- **Response**: `200 OK` -> Detailed report with populated `reporter`, `evidence`, `notes`, and full `statusHistory` array.

#### `PATCH /api/v1/reports/:id/status`
- **Role**: `MUNICIPAL_AUTHORITY`, `TRAFFIC_AUTHORITY`, `ADMIN`
- **Body**: `{ status: 'UNDER_REVIEW' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED', remarks: String }`
- **Validation**: Enforces state machine rules (e.g. Cannot transition from `SUBMITTED` directly to `RESOLVED`).
- **Socket Emission**: Emits `report:statusChanged`.
- **Response**: `200 OK` -> Updated `IncidentReport` and new `ReportStatusHistory` record.

#### `POST /api/v1/reports/:id/notes`
- **Role**: Authenticated
- **Body**: `{ note: String }`
- **Response**: `201 Created` -> Appends note to report.

---

### 2.3 Maintenance Tasks & Work Orders (`/api/v1/tasks`)

#### `GET /api/v1/tasks`
- **Role**: `MUNICIPAL_AUTHORITY`, `ADMIN`
- **Query Params**: `?status=...&squad=...&priority=...`
- **Response**: `200 OK` -> List of `MaintenanceTask` documents.

#### `POST /api/v1/tasks`
- **Role**: `MUNICIPAL_AUTHORITY`, `ADMIN`
- **Body**: `{ reportId, department, assignedSquad, supervisorId, priority, slaHours }`
- **DB Effect**: Creates `MaintenanceTask`, updates `IncidentReport` status to `ASSIGNED`.
- **Response**: `201 Created` -> Created `MaintenanceTask`.

#### `GET /api/v1/tasks/:id`
- **Role**: `MUNICIPAL_AUTHORITY`, `ADMIN`
- **Response**: `200 OK` -> Task details, incident context, material log.

#### `POST /api/v1/tasks/:id/materials`
- **Role**: `MUNICIPAL_AUTHORITY`
- **Body**: `{ materialName, quantity, unit }`
- **Response**: `201 Created` -> Appends material log to task.

#### `PATCH /api/v1/tasks/:id/complete`
- **Role**: `MUNICIPAL_AUTHORITY`, `ADMIN`
- **Body**: `{ completionNotes, evidenceAfterUrls }`
- **DB Effect**: Updates task status to `COMPLETED`, updates report to `RESOLVED`, creates status history, creates citizen notification.
- **Socket Emission**: Emits `report:resolved`.
- **Response**: `200 OK` -> Completed task.

---

### 2.4 Traffic Coordination & Verification (`/api/v1/traffic`)

#### `GET /api/v1/traffic/corridors`
- **Role**: All
- **Response**: `200 OK` -> Active corridor speeds (WEH, Ghodbunder Rd, Station Rd).

#### `GET /api/v1/traffic/incidents/triangulate`
- **Role**: `TRAFFIC_AUTHORITY`, `ADMIN`
- **Query Params**: `?lat=...&lng=...&radiusMeters=150`
- **Response**: `200 OK` -> Clustered citizen reports indicating severe traffic congestion.

#### `PATCH /api/v1/traffic/verify/:id`
- **Role**: `TRAFFIC_AUTHORITY`
- **Body**: `{ action: 'VERIFY' | 'DISMISS', dispatchMarshal: Boolean, remarks }`
- **DB Effect**: Updates report status to `VERIFIED` or `REJECTED`.
- **Socket Emission**: Emits `incident:verified`.
- **Response**: `200 OK`.

#### `POST /api/v1/traffic/advisories`
- **Role**: `TRAFFIC_AUTHORITY`
- **Body**: `{ title, description, detourRoute: [{ latitude, longitude }] }`
- **DB Effect**: Stores `TrafficObservation` detour.
- **Socket Emission**: Emits `advisory:broadcast`.
- **Response**: `201 Created`.

---

### 2.5 Emergency Services & Green Corridors (`/api/v1/emergency`)

#### `GET /api/v1/emergency/overview`
- **Role**: `EMERGENCY_SERVICE`, `ADMIN`
- **Response**: `200 OK` -> Active critical hazards, active green corridors, dispatched units.

#### `POST /api/v1/emergency/corridors`
- **Role**: `EMERGENCY_SERVICE`
- **Body**: `{ originHospital, destinationHospital, corridorRoute, signalPriorityLevel }`
- **DB Effect**: Creates `EmergencyRequest` document.
- **Socket Emission**: Emits `corridor:activated`.
- **Response**: `201 Created`.

---

### 2.6 Smart Parking (`/api/v1/parking`)

#### `GET /api/v1/parking`
- **Role**: All
- **Query Params**: `?ward=...&hasEv=...`
- **Response**: `200 OK` -> List of `ParkingFacility` objects with live bay counts.

#### `PATCH /api/v1/parking/:id/occupancy`
- **Role**: `MUNICIPAL_AUTHORITY`, `ADMIN`
- **Body**: `{ occupiedBays: Number }`
- **DB Effect**: Updates `ParkingFacility`, emits `parking:occupancyUpdated`.
- **Response**: `200 OK`.

---

### 2.7 Analytics, Notifications & Administration (`/api/v1/analytics`, `/api/v1/notifications`, `/api/v1/admin`)

#### `GET /api/v1/analytics/overview`
- **Role**: Authorities, `ADMIN`
- **Query Params**: `?days=30&ward=...`
- **Response**: `200 OK` -> SLA compliance rate, category breakdown, turnaround times.

#### `GET /api/v1/notifications`
- **Role**: Authenticated
- **Response**: `200 OK` -> User's notifications ordered by `createdAt` desc.

#### `PATCH /api/v1/notifications/mark-all-read`
- **Role**: Authenticated
- **Response**: `200 OK` -> Updates all to `isRead: true`.

#### `GET /api/v1/admin/users`
- **Role**: `ADMIN`
- **Query Params**: `?role=...&ward=...&search=...`
- **Response**: `200 OK` -> User directory.

#### `POST /api/v1/admin/users`
- **Role**: `ADMIN`
- **Body**: `{ fullName, email, phone, role, ward, employeeId, department, password }`
- **Response**: `201 Created` -> New staff account.

#### `PATCH /api/v1/admin/users/:id/role`
- **Role**: `ADMIN`
- **Body**: `{ role }`
- **DB Effect**: Updates `role` on `User`, writes `AuditLog`.
- **Response**: `200 OK`.
