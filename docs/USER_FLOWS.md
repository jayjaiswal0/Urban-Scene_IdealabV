# Stitch Urban Mobility Coordination Platform (UMCP) — User Flows & Journeys

## 1. Overview & Role Model

The UMCP platform coordinates actions across five canonical roles:
1. `CITIZEN`: Public resident submitting hazards, reviewing status, exploring parking and transit.
2. `MUNICIPAL_AUTHORITY`: Municipal engineers and maintenance supervisors triaging reports, dispatching repair squads, and completing work orders.
3. `TRAFFIC_AUTHORITY`: Traffic police coordinating incident verification, CCTV review, and public route advisories.
4. `EMERGENCY_SERVICE`: Dispatchers managing green corridor directives and emergency hospital routes.
5. `ADMIN`: System administrators governing user provisioning, system health, and audit logs.

---

## 2. Master Navigation & Route Flowchart

```mermaid
graph TD
  PublicHome["/ (Public Portal)"] -->|Login CTA| Login["/login"]
  PublicHome -->|Register CTA| Register["/register"]
  PublicHome -->|Explore Map| Map["/map"]
  PublicHome -->|Report Issue| ReportIssue["/citizen/report"]
  PublicHome -->|Parking Dir| Parking["/parking"]
  PublicHome -->|Helpdesk| Support["/support"]

  Login -->|Role: Citizen| CitizenDash["/citizen/dashboard"]
  Login -->|Role: Municipal| MunicipalDash["/authority/dashboard"]
  Login -->|Role: Traffic| TrafficDash["/traffic/dashboard"]
  Login -->|Role: Emergency| EmergencyDash["/emergency/dashboard"]
  Login -->|Role: Admin| AdminDash["/admin/dashboard"]
  Login -->|Forgot Password| ForgotPass["/forgot-password"]
  Login -->|Create Account| Register
  Login -->|Browse as Guest| PublicHome

  Register -->|Submit & Verify OTP| CitizenDash
  Register -->|Sign In Link| Login
  ForgotPass -->|Return to Sign In| Login

  CitizenDash -->|+ Report Issue| ReportIssue
  CitizenDash -->|View All Reports| MyReports["/citizen/my-reports"]
  CitizenDash -->|View Map| Map
  CitizenDash -->|Report Row Click| ReportDetail["/citizen/reports/:id"]
  CitizenDash -->|Sidebar: Profile| Profile["/profile"]
  CitizenDash -->|Sidebar: Settings| SettingsApp["/settings/appearance"]
  CitizenDash -->|Notifications Bell| Notifications["/notifications"]

  ReportIssue -->|Submit Report| MyReports
  ReportIssue -->|Save Draft| MyReports
  ReportIssue -->|Back / Cancel| CitizenDash

  MyReports -->|+ New Report| ReportIssue
  MyReports -->|View Details Button| ReportDetail

  MunicipalDash -->|Issue Management| MuniIssues["/authority/issues"]
  MunicipalDash -->|Task Detail| MuniTask["/authority/tasks/:id"]
  MunicipalDash -->|Incident Verification| TrafficVerify["/traffic/verify"]

  MuniIssues -->|Inspect Task| MuniTask
  TrafficDash -->|Verify Incident| TrafficVerify
  TrafficVerify -->|Issue Detour| Map

  AdminDash -->|User Directory| AdminUsers["/admin/users"]
  AdminDash -->|Analytics| Analytics["/analytics"]

  SettingsApp -->|Tab: Notifications| SettingsNotif["/settings/notifications"]
  SettingsNotif -->|Tab: Appearance| SettingsApp

  AnyRole -->|Insufficient Role Tier| Forbidden["/403"]
  Forbidden -->|Sign Out & Switch| Login
  Forbidden -->|Return to Citizen Portal| CitizenDash
```

---

## 3. End-to-End User Journeys

### 3.1 Citizen Registration, Authentication & Profile Management
```mermaid
sequenceDiagram
    actor Citizen
    participant Client as React Client
    participant Server as Express Server
    participant DB as MongoDB

    Citizen->>Client: Open /register
    Citizen->>Client: Enter Name, Email, Phone, Ward, Password
    Client->>Server: POST /api/v1/auth/register
    Server->>DB: Check email uniqueness
    Server->>DB: Save User with bcrypt hash (Role: CITIZEN)
    Server-->>Client: 201 Created (User record)
    Client->>Citizen: Display simulated OTP modal
    Citizen->>Client: Enter 6-digit OTP
    Client->>Server: POST /api/v1/auth/verify-otp
    Server-->>Client: 200 OK + JWT Token + User Profile
    Client->>Client: Store session in Auth context
    Client->>Citizen: Redirect to /citizen/dashboard
    Citizen->>Client: Navigate to /profile
    Citizen->>Client: Update Ward & Preferred Language
    Client->>Server: PATCH /api/v1/users/me
    Server->>DB: Update User preferences
    Server-->>Client: 200 OK + Updated Profile
    Client->>Citizen: Show success notification
```

---

### 3.2 Citizen Hazard Reporting, Map Synchronization & Real-time Tracking
```mermaid
sequenceDiagram
    actor Citizen
    actor OtherUsers as Connected Users
    participant Client as Citizen Client
    participant Server as Express Server
    participant Socket as Socket.IO Hub
    participant DB as MongoDB

    Citizen->>Client: Open /citizen/report
    Citizen->>Client: Select Category ("WATERLOGGING")
    Citizen->>Client: Click "Detect Location" (GPS)
    Client->>Citizen: Reverse geocode to street address
    Citizen->>Client: Adjust Leaflet pin coordinates
    Citizen->>Client: Upload photo evidence & select "URGENT"
    Citizen->>Client: Click "Submit Civic Report"
    Client->>Server: POST /api/v1/reports (Multipart form)
    Server->>DB: Validate inputs & coordinates
    Server->>DB: Insert IncidentReport (Status: SUBMITTED)
    Server->>DB: Insert ReportStatusHistory entry
    Server->>DB: Insert AuditLog
    Server->>Socket: Broadcast 'report:created' payload
    Server-->>Client: 201 Created (Report ID, Reference REF-MUM-XXXX)
    Client->>Citizen: Redirect to /citizen/my-reports
    Socket->>OtherUsers: Emit 'report:created' event
    OtherUsers->>OtherUsers: Dynamically render Leaflet marker on /map without reload
    OtherUsers->>OtherUsers: Increment triage count on Authority Dashboard
```

---

### 3.3 Municipal Authority Triage & Maintenance Sign-off
```mermaid
sequenceDiagram
    actor Officer as Municipal Engineer
    actor Citizen
    participant Client as Authority Client
    participant Server as Express Server
    participant Socket as Socket.IO Hub
    participant DB as MongoDB

    Officer->>Client: Login as Municipal Authority
    Client->>Server: POST /api/v1/auth/login
    Server-->>Client: Auth JWT (Role: MUNICIPAL_AUTHORITY)
    Client->>Officer: Show /authority/dashboard (Pending Triage: 1)
    Officer->>Client: Open /authority/issues
    Officer->>Client: Select Report -> Click "Create Work Order"
    Client->>Server: POST /api/v1/tasks (Squad B-4, SLA: 24h)
    Server->>DB: Insert MaintenanceTask
    Server->>DB: Update IncidentReport status -> "ASSIGNED"
    Server->>DB: Append ReportStatusHistory
    Server->>Socket: Broadcast 'report:statusChanged'
    Server-->>Client: 201 Task Created
    Socket->>Citizen: Push notification "Work squad assigned to your report"
    Officer->>Client: Navigate to /authority/tasks/:id
    Officer->>Client: Log Material (450kg Cold Mix Asphalt)
    Client->>Server: POST /api/v1/tasks/:id/materials
    Server->>DB: Append materials to MaintenanceTask
    Officer->>Client: Upload completion photo & click "Mark Completed"
    Client->>Server: PATCH /api/v1/tasks/:id/complete
    Server->>DB: Update MaintenanceTask status -> "COMPLETED"
    Server->>DB: Update IncidentReport status -> "RESOLVED"
    Server->>DB: Append ReportStatusHistory
    Server->>Socket: Broadcast 'report:resolved'
    Server-->>Client: 200 OK
    Socket->>Citizen: Push notification "Report marked RESOLVED. Please provide feedback."
```

---

### 3.4 Traffic Incident Verification & Route Advisory Broadcast
```mermaid
sequenceDiagram
    actor TrafficOfficer as Traffic Police
    actor Drivers as Commuters / Map Viewers
    participant Client as Traffic Client
    participant Server as Express Server
    participant Socket as Socket.IO Hub
    participant DB as MongoDB

    TrafficOfficer->>Client: Open /traffic/dashboard
    Client->>TrafficOfficer: Alert: Speed drop -82% on WEH Kashimira
    TrafficOfficer->>Client: Open /traffic/verify
    Client->>TrafficOfficer: Display 3 corroborating citizen reports & CCTV simulator
    TrafficOfficer->>Client: Click "Verify & Dispatch Marshal"
    Client->>Server: PATCH /api/v1/traffic/verify/:id
    Server->>DB: Update IncidentReport status -> "VERIFIED"
    Server->>DB: Append ReportStatusHistory
    Server->>Socket: Broadcast 'incident:verified'
    TrafficOfficer->>Client: Click "Broadcast Traffic Advisory"
    Client->>Server: POST /api/v1/traffic/advisories (Detour via Feeder Road)
    Server->>DB: Insert TrafficObservation with detour path
    Server->>Socket: Broadcast 'advisory:broadcast'
    Socket->>Drivers: Draw amber detour route on /map with traffic advisory toast
```

---

### 3.5 Emergency Services Green Corridor Directive
```mermaid
sequenceDiagram
    actor Dispatcher as EMS Dispatcher
    participant Client as Emergency Client
    participant Server as Express Server
    participant Socket as Socket.IO Hub
    participant DB as MongoDB

    Dispatcher->>Client: Open /emergency/dashboard
    Dispatcher->>Client: Alert Level II: Critical Ambulance Transit
    Dispatcher->>Client: Click "Issue Corridor Clearance Directive"
    Dispatcher->>Client: Select Route: Bhayandar West to Tertiary Hospital WEH
    Client->>Server: POST /api/v1/emergency/corridors
    Server->>DB: Insert EmergencyRequest & activate corridor
    Server->>Socket: Broadcast 'corridor:activated'
    Server-->>Client: 201 Created
    Socket->>Client: Display animated green pulse corridor on emergency map
```

---

### 3.6 Platform Administrator User & Role Governance
```mermaid
sequenceDiagram
    actor Admin
    participant Client as Admin Client
    participant Server as Express Server
    participant DB as MongoDB

    Admin->>Client: Open /admin/users
    Admin->>Client: Click "Add New User"
    Admin->>Client: Enter Employee Name, Email, Role: MUNICIPAL_AUTHORITY, Ward: 14
    Client->>Server: POST /api/v1/admin/users
    Server->>DB: Validate Admin permission
    Server->>DB: Insert User with specified role and ward jurisdiction
    Server->>DB: Insert AuditLog
    Server-->>Client: 201 User Created
    Client->>Admin: Show user in table with "Authority" badge
```

---

### 3.7 Public Discovery & Smart Parking Exploration
```mermaid
sequenceDiagram
    actor Guest as Unauthenticated Resident
    participant Client as React Client
    participant Server as Express Server
    participant DB as MongoDB

    Guest->>Client: Visit / (Public Portal)
    Client->>Server: GET /api/v1/analytics/public-summary
    Server->>DB: Read public telemetry
    Server-->>Client: Summary KPIs (Resolved reports, live transit buses)
    Guest->>Client: Click "Explore Live Mobility Map"
    Client->>Server: GET /api/v1/reports/map
    Server->>DB: Return public sanitized reports (no private reporter PII)
    Client->>Guest: Render Leaflet markers with status and severity
    Guest->>Client: Navigate to /parking
    Client->>Server: GET /api/v1/parking
    Server->>DB: Return parking facilities with bay occupancy
    Client->>Guest: Render real-time occupancy bars, tariff tables, and directions CTA
```
