# Stitch Urban Mobility Coordination Platform (UMCP) — UI Functionality Audit

## 1. Scope & Audit Methodology

This functionality audit validates every interactive element from the 25 Stitch UI screens. For each functional component, the audit details:
- **Source Screen & Element Selector**
- **Action Type & Event Trigger**
- **Target Route / Dynamic Modal**
- **Input Validation Requirements**
- **Backend API & Database Persistence Operations**
- **Role Authorization Level**
- **Success & Failure States**

---

## 2. Granular Screen Audits

### 2.1 Public Portal Homepage (`/`)
- **"Report an Issue" Hero CTA (`#hero-report-btn`)**:
  - *Action*: Navigates to `/citizen/report` if logged in as Citizen; if unauthenticated, routes to `/login?redirect=/citizen/report` with a modal prompt.
  - *Auth Requirement*: Public / Citizen.
  - *Behavior*: Pre-fills current location coordinates if browser geolocation permission is granted.
- **"Explore Live Mobility Map" CTA (`#hero-map-btn`)**:
  - *Action*: Navigates to `/map`.
  - *Auth Requirement*: Public.
  - *Behavior*: Loads all verified incidents, roadworks, and parking bays.
- **Live Stats Strip (Submitted, Resolved, Bus Feed, Active Alerts)**:
  - *API Dependency*: `GET /api/v1/analytics/public-summary`
  - *Behavior*: Fetches aggregated counts from MongoDB; updates dynamically every 30s.
- **Ward Quick Search (`#ward-search-input`)**:
  - *Action*: Filters nearby incidents and MBMT bus routes for the selected ward.
- **Emergency Quick Callout (`#emergency-hotline-btn`)**:
  - *Action*: Opens dialer / copy popup for 112 & 1800-22-3450.

---

### 2.2 Registration Page (`/register`)
- **Full Legal Name (`#fullName`)**:
  - *Validation*: Required string, min 3 chars, max 100 chars, regex `^[a-zA-Z\s\.]+$`.
- **Email Address (`#emailAddress`)**:
  - *Validation*: Valid RFC 5322 email string; checked for uniqueness on server.
- **Mobile Number (`#mobileNumber`)**:
  - *Validation*: Required, 10 digits prefixed by `+91`.
- **Residential Ward (`#wardSelection`)**:
  - *Validation*: Required enum selection (Wards 1 through 8).
- **Password & Confirm Password (`#passwordInput`, `#confirmPasswordInput`)**:
  - *Validation*: Min 8 characters, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character. Must match confirm password.
  - *Meter*: Visual strength bar updating on input (`Weak` < 60, `Moderate` 60-80, `Strong` > 80).
- **Terms Agreement (`#agreeTerms`)**:
  - *Validation*: Mandatory boolean check.
- **WhatsApp Notification Opt-in (`#urgentAlerts`)**:
  - *Validation*: Optional boolean flag stored in user preferences.
- **Submit CTA ("Create Account & Verify Mobile") (`#register-submit-btn`)**:
  - *API Dependency*: `POST /api/v1/auth/register`
  - *DB Effect*: Creates `User` document with hashed password (bcrypt 12 rounds), role `CITIZEN`.
  - *Success Behavior*: Dispatches simulation OTP modal (`"Verification code sent to +91..."`), sets JWT upon entry, and redirects to `/citizen/dashboard`.
  - *Error Behavior*: Highlights duplicate email or validation failures in inline alert.

---

### 2.3 Login Page (`/login`)
- **Role Tabs (`#role-citizen`, `#role-municipal`, `#role-traffic`, `#role-emergency`)**:
  - *Action*: Switches form context, adjusts input placeholder, updates role badge, and displays 2FA security notice for municipal/police/emergency personnel.
- **Identifier Input (`#login-email`)**:
  - *Validation*: Email or registered mobile number.
- **Password Input (`#login-password`) with Eye Toggle (`#eye-toggle`)**:
  - *Validation*: Required string; toggle flips `type="password"` to `type="text"`.
- **Remember Terminal Checkbox (`#remember-me`)**:
  - *Behavior*: Extends session token expiry (30 days vs 24 hours).
- **Submit CTA ("Sign In to Portal") (`#login-submit-btn`)**:
  - *API Dependency*: `POST /api/v1/auth/login`
  - *Success Behavior*: Saves JWT in memory and HTTP-only cookie, saves user profile in Auth context, dispatches Socket.IO authentication handshake, redirects based on role:
    - `CITIZEN` -> `/citizen/dashboard`
    - `MUNICIPAL_AUTHORITY` -> `/authority/dashboard`
    - `TRAFFIC_AUTHORITY` -> `/traffic/dashboard`
    - `EMERGENCY_SERVICE` -> `/emergency/dashboard`
    - `ADMIN` -> `/admin/dashboard`
  - *Error Behavior*: Shows error badge "Invalid identifier or password".
- **"Browse Public Transit Portal" (`#guest-browse-btn`)**:
  - *Action*: Navigates directly to `/` or `/map` as unauthenticated guest.

---

### 2.4 Forgot Password (`/forgot-password`)
- **Recovery Email Input (`#recovery-email`)**:
  - *Validation*: Valid email address.
- **Role Radio Group (`#role-citizen-radio`, `#role-authority-radio`)**:
  - *Action*: Toggles verification path (direct magic link vs supervisor authorization).
- **Submit CTA ("Send Reset Link") (`#submitButton`)**:
  - *API Dependency*: `POST /api/v1/auth/forgot-password`
  - *DB Effect*: Generates expiring cryptographically random token saved on `User` record.
  - *Success Behavior*: Renders confirmation card with clearly labeled development simulation link.
  - *Error Behavior*: Clear error if email not registered.

---

### 2.5 Citizen Dashboard (`/citizen/dashboard`)
- **KPI Summary Cards (Total Submitted, Under Review, In Progress, Resolved)**:
  - *API Dependency*: `GET /api/v1/reports/citizen/stats`
  - *Behavior*: Clicking any card filters `/citizen/my-reports` by that status.
- **Quick Report Launchers (Pothole, Signal, Dumping, Waterlogging, Streetlight, More)**:
  - *Action*: Navigates to `/citizen/report?category=[type]`.
- **Recent Reports Table**:
  - *API Dependency*: `GET /api/v1/reports/citizen/recent`
  - *Behavior*: Lists 5 most recent submissions with status badge and SLA countdown.
- **"View Details" Row Button**:
  - *Action*: Navigates to `/citizen/reports/:id`.
- **"+ Report New Issue" CTA (`#dash-new-report-btn`)**:
  - *Action*: Navigates to `/citizen/report`.

---

### 2.6 Report an Issue Form (`/citizen/report`)
- **Category Tiles (6 Tiles)**:
  - *Action*: Single-selection toggle (`POTHOLE`, `TRAFFIC_SIGNAL`, `GARBAGE`, `WATERLOGGING`, `STREETLIGHT`, `ROAD_HAZARD`).
- **Street Address (`#street-address`)**:
  - *Validation*: Min 5 chars, auto-populated by reverse geocoding on pin drop.
- **Ward Selector (`#ward-selector`)**:
  - *Validation*: Required dropdown (Wards 1-8).
- **GPS Detect Trigger (`#detect-gps-btn`)**:
  - *Action*: Queries `navigator.geolocation.getCurrentPosition`; centers Leaflet map and updates marker.
- **Interactive Map Pin Drop**:
  - *Action*: Draggable Leaflet marker updating coordinates (`lat`, `lng`).
- **Description Textarea (`#issue-description`)**:
  - *Validation*: Min 10 chars, max 1000 chars; live counter (`128/1000`).
- **Hazard Severity Selector (3 pills)**:
  - *Options*: `LOW` (Routine), `NORMAL` (Standard SLA), `URGENT` (Critical hazard, priority dispatch).
- **Photo Upload Dropzone (`#photo-dropzone`)**:
  - *Validation*: Max 3 files, image/jpeg, image/png, image/webp, max 5MB per file.
  - *Behavior*: Generates local preview thumbnails with remove buttons and geotag metadata indicators.
- **SMS / WhatsApp Notification Toggle (`#sms-notify`)**:
  - *Behavior*: Stores notification dispatch flag with report document.
- **"Save as Draft" Button (`#save-draft-btn`)**:
  - *Behavior*: Stores form state in `localStorage` under `umcp_report_draft` for resumption.
- **"Submit Civic Report" CTA (`#submit-report-btn`)**:
  - *API Dependency*: `POST /api/v1/reports`
  - *DB Effect*: Persists `IncidentReport` in MongoDB with status `SUBMITTED`, creates initial `ReportStatusHistory` entry, writes `AuditLog`.
  - *Socket Event*: Emits `report:created` to all connected clients.
  - *Success Behavior*: Shows success modal with generated report reference (`REF-MUM-XXXX-X`), clears draft, navigates to `/citizen/my-reports`.

---

### 2.7 My Reports (`/citizen/my-reports`)
- **Status Filter Tabs (All, Under Review, In Progress, Resolved, Drafts)**:
  - *Action*: Refilters report list; updates query param `?status=...`.
- **Search Bar (`#report-search-input`)**:
  - *Action*: Debounced text search matching report title, reference ID, and address.
- **Ward Filter Dropdown (`#filter-ward`)**:
  - *Action*: Filters by municipal ward.
- **Sort Dropdown (`#sort-reports`)**:
  - *Options*: Newest First, Oldest First, Highest Severity.
- **"View Details" Row Action**:
  - *Action*: Navigates to `/citizen/reports/:id`.
- **"Download Summary" CTA (`#download-summary-btn`)**:
  - *Action*: Generates client-side CSV or printable summary of citizen's reports.

---

### 2.8 Report Details & Status Timeline (`/citizen/reports/:id`)
- **Back Link (`#back-to-reports-link`)**:
  - *Action*: Returns to `/citizen/my-reports` or authority issue management depending on role.
- **"Download Official Acknowledgement" (`#download-receipt-btn`)**:
  - *Action*: Opens structured print dialog / PDF view with official municipal seal and cryptographic report hash.
- **"Add Additional Note" (`#add-note-btn`)**:
  - *Action*: Opens modal for citizen or officer to append remark; calls `POST /api/v1/reports/:id/notes`.
- **Dual Photo Gallery**:
  - *Behavior*: Side-by-side comparison of citizen initial photo vs field officer resolution photo with EXIF timestamps.
- **5-Stage Interactive Lifecycle Timeline**:
  - *Stages*: `Submitted` -> `Under Review` -> `Verified` -> `Assigned (Work Order)` -> `Resolved`.
  - *Behavior*: Displays completed checkpoints with officer names, timestamps, and work log summaries.

---

### 2.9 Live Mobility Map (`/map`)
- **Leaflet Map Viewport**:
  - *Tiles*: OpenStreetMap standard tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
  - *Center*: Default Mumbai Metropolitan Region (19.2812° N, 72.8561° E), zoom level 13.
- **Marker Pin System**:
  - *Waterlogging*: Red marker with water icon; clicking opens popup with water depth and crew status.
  - *Roadwork*: Amber marker with cone/wrench icon; opens detour details and estimated completion.
  - *Smart Parking*: Blue marker with 'P'; displays available vs total bays.
  - *Traffic Signal*: Orange marker; shows signal status and override mode.
  - *Emergency Vehicle*: Red/White flashing pin; shows real-time simulated telemetry.
- **Layer Filters (All, Roadwork, Waterlogging, Transit Feeder, Parking)**:
  - *Action*: Toggles Leaflet layer groups without re-fetching all data.
- **Corridor Speed Index Sidebar**:
  - *Behavior*: Displays live arterial speeds (WEH, Ghodbunder Rd, Station Rd); updates every 15s.
- **Real-time Map Socket Ingestion**:
  - *Event*: Listens for `report:created`, `report:statusChanged`, `incident:verified`.
  - *Behavior*: Adds or updates marker dynamically without refreshing the page.

---

### 2.10 Parking Information (`/parking`)
- **4 Metric Cards (Total Bays, Live Available, EV Bays, FastTag enabled)**:
  - *API Dependency*: `GET /api/v1/parking/summary`
- **Ward Filter Tabs**:
  - *Action*: Filters facility cards by municipal ward.
- **Facility Search Input**:
  - *Action*: Filters by parking facility name or street.
- **Facility Cards**:
  - *Components*: Dynamic occupancy progress bar, total vs vacant bays, EV charging count, tariff table (hourly/daily).
  - *Actions*: "Get Directions" (opens Google Maps / OpenStreetMap directions in new tab), "Update Occupancy" (authorized parking operator modal).
- **"Sync Live Sensor Hub" CTA**:
  - *Action*: Re-queries `GET /api/v1/parking` with visual spinner.

---

### 2.11 Notifications & Advisories (`/notifications`)
- **Filter Pills (All, Report Updates, Ward Advisories, Transit Alerts)**:
  - *Action*: Filters notification list.
- **"Mark All as Read" CTA (`#mark-all-read-btn`)**:
  - *API Dependency*: `PATCH /api/v1/notifications/mark-all-read`
  - *DB Effect*: Sets `isRead: true` for all user's notifications.
- **Notification Row Card**:
  - *Action*: Clicking navigates to relevant deep link (e.g. `/citizen/reports/:id` or `/map`) and marks notification as read.

---

### 2.12 My Profile (`/profile`)
- **Avatar Upload**:
  - *Action*: File selector with image crop/preview; calls `POST /api/v1/users/avatar`.
- **DigiLocker / Aadhaar Verification Badges**:
  - *Behavior*: Illustrative civic trust indicators with explanatory tooltip.
- **Editable Fields (Email, Mobile, Residential Ward, Preferred Language)**:
  - *Validation*: Email format, 10-digit mobile, valid ward.
- **Save Changes CTA (`#save-profile-btn`)**:
  - *API Dependency*: `PATCH /api/v1/users/me`
  - *DB Effect*: Updates `User` document in MongoDB.
  - *Feedback*: Success toast "Profile updated successfully".

---

### 2.13 Appearance & Privacy Settings (`/settings/appearance`, `/settings/notifications`)
- **Theme Cards (Light Mode, Dark Mode, System Sync)**:
  - *Action*: Instantly toggles `.dark` class on `<html>` element and persists choice to `localStorage` (`umcp_theme`).
- **High Contrast Mode**:
  - *Action*: Toggles `.high-contrast` class for enhanced border and text contrast.
- **Multi-Channel Notification Matrix**:
  - *Action*: Checkbox grid (SMS, WhatsApp, Email, In-App) for status updates; calls `PATCH /api/v1/users/preferences`.

---

### 2.14 Municipal Authority Consoles (`/authority/dashboard`, `/authority/issues`, `/authority/tasks/:id`)
- **Triage Queue & Work Orders**:
  - *Action*: Filter by ward, urgency, or department (Public Works, Drainage, Electrical).
- **"Create Work Order" CTA**:
  - *Action*: Opens work order creation modal, assigns squad and supervisor.
- **Task Detail Lifecycle**:
  - *Action*: Status change dropdown (`ASSIGNED` -> `IN_PROGRESS` -> `RESOLVED`).
  - *Material Logger*: Adds asphalt/materials used with inventory count.
  - *Evidence Upload*: Uploads post-repair verification photos.
  - *API Dependency*: `PATCH /api/v1/tasks/:id/status`, `POST /api/v1/tasks/:id/materials`.

---

### 2.15 Traffic Coordination Consoles (`/traffic/dashboard`, `/traffic/verify`)
- **Spatial Triangulation Card**:
  - *Behavior*: Displays clusters of citizen reports filed within 150m of each other.
- **Speed Drop Telemetry**:
  - *Behavior*: Displays synthetic transit speed metrics (-82% drop indicator).
- **CCTV Feed Simulator**:
  - *Behavior*: Video/canvas player with simulated optical feed and timestamp overlay.
- **Incident Actions**:
  - *"Verify & Dispatch Traffic Marshal"*: Updates report to `VERIFIED`, dispatches unit.
  - *"Broadcast Traffic Advisory"*: Creates active detour route visible on `/map`.
  - *"Dismiss as False Report"*: Updates report to `REJECTED` with logged reason.

---

### 2.16 Emergency Services Dashboard (`/emergency/dashboard`)
- **Priority Clearance Directive**:
  - *Action*: Opens corridor clearance modal; selecting an arterial road triggers simulated signal green wave.
- **Emergency Vehicle Tracker**:
  - *Behavior*: Displays live simulated GPS coordinates for ambulances and fire units.
- **Corridor Clearance Status**:
  - *Behavior*: Real-time status badge (`CLEAR`, `CONGESTED`, `TRANSIT_IN_PROGRESS`).

---

### 2.17 Civic Analytics (`/analytics`)
- **Time Range (7/30/90 Days) & Ward Selectors**:
  - *Action*: Updates Recharts components for SLA compliance, hazard density, and department response times.
- **Export CTA (CSV/PDF)**:
  - *Action*: Generates structured CSV of filtered incident statistics.

---

### 2.18 Administration & User RBAC (`/admin/dashboard`, `/admin/users`)
- **System Health Monitor**:
  - *API Dependency*: `GET /api/v1/admin/health`
  - *Metrics*: Database connection status, Socket.IO clients count, memory usage, API uptime.
- **User Directory Table**:
  - *Actions*: Search users, filter by role (`CITIZEN`, `MUNICIPAL_AUTHORITY`, `TRAFFIC_AUTHORITY`, `EMERGENCY_SERVICE`, `ADMIN`), toggle active/suspended status, reassign ward jurisdiction.
- **"Add New User" Modal CTA**:
  - *API Dependency*: `POST /api/v1/admin/users`
  - *Validation*: Allows admin to provision staff accounts with assigned roles and wards.

---

### 2.19 Support Desk (`/support`)
- **Grievance / Inquiry Form**:
  - *Fields*: Name, Email, Ward, Category, Priority, Message, Attachment.
  - *Action*: Calls `POST /api/v1/support/inquiries`; displays ticket acknowledgement number.
- **Ward Officer Contact List**:
  - *Behavior*: Interactive phone numbers and email links for municipal ward nodal officers.
- **FAQ Accordion**:
  - *Action*: Toggles expandable answer drawers for frequent municipal questions.

---

### 2.20 Access Denied (`/403`)
- **Security Diagnostic Panel**:
  - *Displays*: Current user identity, current role, attempted endpoint, required permission tier.
- **Navigation Controls**:
  - *"Return to Citizen Dashboard"*: Navigates to `/citizen/dashboard`.
  - *"Explore Public Mobility Map"*: Navigates to `/map`.
  - *"Sign Out & Switch Account"*: Clears session tokens and redirects to `/login`.
