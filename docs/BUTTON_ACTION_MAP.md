# Stitch Urban Mobility Coordination Platform (UMCP) — Button Action Map

## 1. Scope & Schema

This document maps all interactive buttons, links, tabs, dropdowns, form submissions, and modals across the application to their exact execution contracts:

| Field | Description |
|---|---|
| **Source Screen** | Screen path and view identifier |
| **Element / ID** | CSS ID or selector name |
| **Intended Action** | What the user expects when clicking/interacting |
| **Target Route / Event** | Destination URL, state transition, or modal dialog |
| **Required Input** | Required form values or selections |
| **API Dependency** | Backend REST endpoint or Socket.IO event |
| **Database Effect** | Target MongoDB collection and mutation |
| **Auth Requirement** | Canonical RBAC role requirement |
| **Success Behavior** | UI feedback, route transition, or socket emission |
| **Error Behavior** | Form validation alert, error banner, or toast |

---

## 2. Exhaustive Button & Interaction Matrix

### 2.1 Public & Authentication Flows

| Source Screen | Element / ID | Intended Action | Target Route / Event | Required Input | API Dependency | Database Effect | Auth Requirement | Success Behavior | Error Behavior |
|---|---|---|---|---|---|---|---|---|---|
| Public Portal (`/`) | `#hero-report-btn` | Initiate civic hazard report | `/citizen/report` | None | None | None | Public (prompts auth if guest) | Navigates to report form | None |
| Public Portal (`/`) | `#hero-map-btn` | Explore live city map | `/map` | None | `GET /api/v1/reports/map` | Reads reports | Public | Navigates to full map | Offline notification |
| Public Portal (`/`) | `#nav-login-btn` | Sign in to portal | `/login` | None | None | None | Public | Navigates to login view | None |
| Public Portal (`/`) | `#nav-register-btn` | Create civic account | `/register` | None | None | None | Public | Navigates to register view | None |
| Public Portal (`/`) | `#ward-search-btn` | Filter public telemetry | Filter state | Ward ID | `GET /api/v1/analytics/ward-summary` | Aggregation read | Public | Updates stats strip | Clears to MMR defaults |
| Registration (`/register`) | `#register-submit-btn` | Submit registration | `/citizen/dashboard` | Name, Email, Phone, Ward, Passwords, Terms | `POST /api/v1/auth/register` | Creates `User` (role: CITIZEN, bcrypt pass) | Public | Opens OTP verification simulation -> logs in | Red validation alert |
| Registration (`/register`) | `#toggle-password-btn` | Toggle password visibility | Password input | None | None | None | Public | Flips input type text/password | None |
| Registration (`/register`) | `#signin-link` | Switch to sign in | `/login` | None | None | None | Public | Navigates to login | None |
| Login (`/login`) | `#role-citizen` | Switch to Citizen login | Tab switch | None | None | None | Public | Sets tab, clears notices | None |
| Login (`/login`) | `#role-municipal` | Switch to Municipal login | Tab switch | None | None | None | Public | Shows 2FA notice, officer placeholder | None |
| Login (`/login`) | `#role-traffic` | Switch to Traffic login | Tab switch | None | None | None | Public | Shows Traffic Division badge | None |
| Login (`/login`) | `#role-emergency` | Switch to Emergency login | Tab switch | None | None | None | Public | Shows Priority EMS notice | None |
| Login (`/login`) | `#login-submit-btn` | Sign in to platform | Role-specific dashboard | Identifier, Password | `POST /api/v1/auth/login` | Updates lastLogin on `User`, creates `AuditLog` | Public | Sets JWT, connects socket, redirects | "Invalid credentials" toast |
| Login (`/login`) | `#forgot-password-link` | Recover account password | `/forgot-password` | None | None | None | Public | Navigates to recovery | None |
| Login (`/login`) | `#guest-browse-btn` | Explore without login | `/` | None | None | None | Public | Navigates to home | None |
| Forgot Password (`/forgot-password`) | `#submitButton` | Request reset link | Confirmation view | Email address | `POST /api/v1/auth/forgot-password` | Writes resetToken & expiry on `User` | Public | Shows dev reset link modal | "Email not found" message |
| Forgot Password (`/forgot-password`) | `#back-login-link` | Return to login | `/login` | None | None | None | Public | Navigates to login | None |

---

### 2.2 Citizen Reporting & Report Lifecycle

| Source Screen | Element / ID | Intended Action | Target Route / Event | Required Input | API Dependency | Database Effect | Auth Requirement | Success Behavior | Error Behavior |
|---|---|---|---|---|---|---|---|---|---|
| Citizen Dash (`/citizen/dashboard`) | `#dash-new-report-btn` | Open report creator | `/citizen/report` | None | None | None | `CITIZEN` | Opens report form | None |
| Citizen Dash (`/citizen/dashboard`) | `#quick-tile-pothole` | Report pothole fast-track | `/citizen/report?cat=POTHOLE` | None | None | None | `CITIZEN` | Opens form with Pothole preselected | None |
| Citizen Dash (`/citizen/dashboard`) | `#quick-tile-signal` | Report broken signal | `/citizen/report?cat=TRAFFIC_SIGNAL` | None | None | None | `CITIZEN` | Opens form with Signal preselected | None |
| Citizen Dash (`/citizen/dashboard`) | `#quick-tile-waterlogging` | Report waterlogging | `/citizen/report?cat=WATERLOGGING` | None | None | None | `CITIZEN` | Opens form with Waterlogging preselected | None |
| Citizen Dash (`/citizen/dashboard`) | `#view-all-reports-btn` | Open report tracker | `/citizen/my-reports` | None | None | None | `CITIZEN` | Navigates to report ledger | None |
| Report Issue (`/citizen/report`) | `#category-tile-*` | Select issue category | Form state | Category click | None | None | `CITIZEN` | Highlights active category card | None |
| Report Issue (`/citizen/report`) | `#detect-gps-btn` | Use device coordinates | Leaflet map pin | Browser GPS permission | Reverse Geocoding API | Updates form lat/lng/address | `CITIZEN` | Centers map on user position | "GPS denied" fallback prompt |
| Report Issue (`/citizen/report`) | `#severity-pill-*` | Select hazard severity | Form state | Severity level | None | None | `CITIZEN` | Sets Low / Normal / Urgent | None |
| Report Issue (`/citizen/report`) | `#photo-dropzone` | Upload photo evidence | Thumbnail preview | Image files (<=3, <=5MB) | `POST /api/v1/evidence/upload` | Stores file / Cloudinary | `CITIZEN` | Shows image preview with geotag badge | "Invalid format/size" error |
| Report Issue (`/citizen/report`) | `#save-draft-btn` | Save draft locally | Form state | Partial form data | None | Writes `umcp_report_draft` | `CITIZEN` | Shows "Draft saved" toast | None |
| Report Issue (`/citizen/report`) | `#submit-report-btn` | Submit civic report | `/citizen/my-reports` | Category, Ward, Address, Lat/Lng, Description | `POST /api/v1/reports` | Creates `IncidentReport`, initial `ReportStatusHistory`, `AuditLog` | `CITIZEN` | Broadcasts `report:created` socket event, redirects | Highlights invalid fields |
| My Reports (`/citizen/my-reports`) | `#filter-tab-*` | Filter by status | Tab state | Status tab click | `GET /api/v1/reports` | Reads user's reports | `CITIZEN` | Updates list smoothly | Empty state card |
| My Reports (`/citizen/my-reports`) | `#report-search-input` | Filter reports by query | List filter | Search query | `GET /api/v1/reports?search=...` | Query reports | `CITIZEN` | Real-time filtered rows | "No matching reports" |
| My Reports (`/citizen/my-reports`) | `#view-details-btn-*` | Open report detail | `/citizen/reports/:id` | Report ID | `GET /api/v1/reports/:id` | Reads report & history | `CITIZEN` | Opens timeline page | 404 / 403 screen |
| My Reports (`/citizen/my-reports`) | `#download-summary-btn` | Export citizen reports | CSV file download | None | None | None | `CITIZEN` | Downloads structured CSV | Toast on failure |
| Report Details (`/citizen/reports/:id`) | `#download-receipt-btn` | Download acknowledgement | Print view / PDF | None | None | None | `CITIZEN`, Authority | Launches official receipt view | None |
| Report Details (`/citizen/reports/:id`) | `#add-note-btn` | Append note to report | Modal dialog | Citizen note string | `POST /api/v1/reports/:id/notes` | Updates `IncidentReport` notes | `CITIZEN`, Authority | Appends note to history trail | Validation error |

---

### 2.3 Interactive Map & Smart Parking

| Source Screen | Element / ID | Intended Action | Target Route / Event | Required Input | API Dependency | Database Effect | Auth Requirement | Success Behavior | Error Behavior |
|---|---|---|---|---|---|---|---|---|---|
| Map (`/map`) | `#map-layer-filter` | Toggle layer markers | Leaflet layer group | Selected layer | None | None | All | Toggles visibility of pin group | None |
| Map (`/map`) | `#locate-me-btn` | Center on user location | Leaflet map view | GPS permission | Geolocation API | None | All | Smooth pan to user coordinates | "Location unavailable" |
| Map (`/map`) | `#zoom-in-btn` / `#zoom-out-btn` | Adjust map zoom | Map zoom level | Click | None | None | All | Zooms Leaflet container | Min/Max limits |
| Map (`/map`) | `#marker-pin-*` | Inspect incident / bay | Leaflet popup card | Marker click | None | None | All | Opens detailed popup with CTAs | None |
| Map (`/map`) | `#popup-detail-link` | Navigate to report details | `/citizen/reports/:id` | Incident ID | None | None | All | Navigates to report | None |
| Parking (`/parking`) | `#parking-ward-tab-*` | Filter facilities by ward | Ward tab | Ward ID | `GET /api/v1/parking?ward=...` | Reads parking facilities | All | Filters facility cards | Empty state card |
| Parking (`/parking`) | `#sync-parking-btn` | Re-fetch live sensors | Facility list | None | `GET /api/v1/parking` | Reads parking facilities | All | Rotates spinner, updates numbers | "Sync failed" toast |
| Parking (`/parking`) | `#get-directions-btn-*` | Get driving directions | New browser tab | Facility coordinates | External Maps / OSRM | None | All | Opens Google Maps / OSM routing | None |
| Parking (`/parking`) | `#update-occupancy-btn-*` | Update bay counts | Occupancy modal | Occupied bays count | `PATCH /api/v1/parking/:id/occupancy` | Updates `ParkingFacility` occupancy | Authority, Admin | Updates live vacancy meter, emits socket | Validation error |

---

### 2.4 Authority Triage, Traffic & Emergency

| Source Screen | Element / ID | Intended Action | Target Route / Event | Required Input | API Dependency | Database Effect | Auth Requirement | Success Behavior | Error Behavior |
|---|---|---|---|---|---|---|---|---|---|
| Muni Dashboard (`/authority/dashboard`) | `#triage-item-btn-*` | Open issue triage drawer | Triage drawer | Report ID | `GET /api/v1/reports/:id` | Reads report | `MUNICIPAL_AUTHORITY` | Slides out triage drawer | Error banner |
| Muni Issues (`/authority/issues`) | `#assign-squad-btn-*` | Create maintenance order | Task modal | Squad ID, Supervisor, Priority, SLA | `POST /api/v1/tasks` | Creates `MaintenanceTask`, updates report to `ASSIGNED` | `MUNICIPAL_AUTHORITY` | Emits `task:assigned`, appends history | Form error alert |
| Muni Issues (`/authority/issues`) | `#status-select-*` | Fast status transition | Status dropdown | New valid status | `PATCH /api/v1/reports/:id/status` | Appends `ReportStatusHistory`, updates `IncidentReport` | `MUNICIPAL_AUTHORITY` | Broadcasts `report:statusChanged` | Transition not allowed alert |
| Muni Task Details (`/authority/tasks/:id`) | `#log-material-btn` | Log asphalt/supplies | Material modal | Material name, quantity, unit | `POST /api/v1/tasks/:id/materials` | Appends to materials on `MaintenanceTask` | `MUNICIPAL_AUTHORITY` | Updates material inventory table | Validation error |
| Muni Task Details (`/authority/tasks/:id`) | `#upload-postrepair-btn` | Upload completion photo | Photo preview | Verification photo | `POST /api/v1/tasks/:id/evidence` | Saves `Evidence` record | `MUNICIPAL_AUTHORITY` | Displays post-repair badge | File error |
| Muni Task Details (`/authority/tasks/:id`) | `#mark-completed-btn` | Final sign-off & resolve | `/authority/issues` | Resolution remarks | `PATCH /api/v1/tasks/:id/complete` | Sets task `COMPLETED`, updates report `RESOLVED`, notifies citizen | `MUNICIPAL_AUTHORITY` | Broadcasts `report:resolved`, redirects | Required field error |
| Traffic Dashboard (`/traffic/dashboard`) | `#verify-incident-btn-*` | Open verification view | `/traffic/verify` | Incident ID | `GET /api/v1/traffic/incidents/:id` | Reads incident & clusters | `TRAFFIC_AUTHORITY` | Navigates to verification desk | None |
| Traffic Verify (`/traffic/verify`) | `#verify-dispatch-btn` | Confirm hazard & dispatch | Verification modal | Unit ID, Detour flag | `PATCH /api/v1/traffic/verify/:id` | Updates report to `VERIFIED`, creates dispatch log | `TRAFFIC_AUTHORITY` | Emits `incident:verified`, alerts map | Server error |
| Traffic Verify (`/traffic/verify`) | `#broadcast-advisory-btn` | Issue corridor detour | Advisory modal | Title, description, route nodes | `POST /api/v1/traffic/advisories` | Creates `TrafficObservation` detour, notifies all users | `TRAFFIC_AUTHORITY` | Broadcasts `advisory:broadcast`, adds map detour | Validation alert |
| Traffic Verify (`/traffic/verify`) | `#dismiss-report-btn` | Dismiss false report | `/traffic/dashboard` | Dismissal reason | `PATCH /api/v1/reports/:id/status` (REJECTED) | Sets report to `REJECTED`, logs reason | `TRAFFIC_AUTHORITY` | Notifies reporter, redirects | Reason required |
| Emergency Dashboard (`/emergency/dashboard`) | `#clearance-directive-btn` | Issue green corridor | Directive modal | Hospital route, ambulance ID | `POST /api/v1/emergency/corridors` | Creates `EmergencyRequest`, activates corridor | `EMERGENCY_SERVICE` | Emits `corridor:activated`, triggers map pulse | Error modal |

---

### 2.5 Administration, Settings & Profiles

| Source Screen | Element / ID | Intended Action | Target Route / Event | Required Input | API Dependency | Database Effect | Auth Requirement | Success Behavior | Error Behavior |
|---|---|---|---|---|---|---|---|---|---|
| Admin Users (`/admin/users`) | `#add-user-modal-btn` | Open user creation modal | Add User Modal | None | None | None | `ADMIN` | Opens user creation form | None |
| Admin Users (`/admin/users`) | `#submit-add-user-btn` | Provision authority account | User table update | Name, Email, Password, Role, Ward | `POST /api/v1/admin/users` | Creates `User` with specified role | `ADMIN` | Adds row, emits audit log, shows toast | Validation error |
| Admin Users (`/admin/users`) | `#toggle-status-btn-*` | Suspend or activate user | Row state | User ID | `PATCH /api/v1/admin/users/:id/status` | Toggles `isActive` on `User` | `ADMIN` | Updates status pill | "Action failed" |
| Admin Users (`/admin/users`) | `#role-change-select-*` | Change user role | Select dropdown | New role | `PATCH /api/v1/admin/users/:id/role` | Updates `role` on `User` | `ADMIN` | Updates role badge, writes audit log | Permission error |
| My Profile (`/profile`) | `#save-profile-btn` | Update profile information | Profile view | Email, Phone, Ward, Language | `PATCH /api/v1/users/me` | Updates `User` contact & preferences | All (Authenticated) | Shows "Profile updated" toast | Form validation error |
| Appearance (`/settings/appearance`) | `#theme-dark-card` | Switch to Dark Mode | HTML class change | Click | None | Persists `umcp_theme: dark` | All | Adds `.dark` class to `<html>` | None |
| Appearance (`/settings/appearance`) | `#theme-light-card` | Switch to Light Mode | HTML class change | Click | None | Persists `umcp_theme: light` | All | Removes `.dark` class from `<html>` | None |
| Notifications (`/notifications`) | `#mark-all-read-btn` | Mark notifications read | Notification list | None | `PATCH /api/v1/notifications/mark-all-read` | Sets `isRead: true` for user | All (Authenticated) | Clears unread badge counter | Toast on failure |
| Global Header | `#user-logout-btn` | Log out from platform | `/login` | None | `POST /api/v1/auth/logout` | Clears refresh tokens, writes audit log | All (Authenticated) | Disconnects socket, redirects to `/login` | Forced client logout |
| 403 Forbidden (`/403`) | `#return-home-btn` | Return to user dashboard | `/citizen/dashboard` | None | None | None | All | Navigates to dashboard | None |
| 403 Forbidden (`/403`) | `#signout-switch-btn` | Sign out to switch role | `/login` | None | None | Clears session | All | Logs out and navigates to login | None |

---

## 3. Verified Execution Status & Simulation Classifications

### 3.1 Tested & Authenticated Interactive Flows
- **Citizen Registration (`#register-submit-btn`)**: Validated with password confirmation, terms acceptance, duplicate email check, and bcrypt 12-round hashing.
- **Role Login (`#login-submit-btn`)**: Validated across all 5 roles (`CITIZEN`, `MUNICIPAL_AUTHORITY`, `TRAFFIC_AUTHORITY`, `EMERGENCY_SERVICE`, `ADMIN`).
- **Incident Reporting (`#submit-report-btn`)**: Validated with Leaflet map coordinate picker, category selection, severity pills, MongoDB persistence, audit log creation, and real-time Socket.IO emission.
- **Municipal Squad Assignment & Triage (`#assign-squad-btn-*`, `#status-select-*`)**: Validated with work order creation, material usage logging, status transitions (`SUBMITTED -> UNDER_REVIEW -> ASSIGNED -> IN_PROGRESS -> RESOLVED`), and real-time citizen notification.
- **RBAC Enforcement**: Validated 403 FORBIDDEN rejection when unauthorized roles attempt municipal status mutations.

### 3.2 High-Fidelity Simulations (Academic Scope)
- **FastTag Tariff Simulation**: UI demonstration models for municipal parking facilities.
- **Emergency Green Corridors**: Map vector route highlighting; does not interact with physical city traffic lights.
- **CCTV Feeds**: Simulated video camera feeds for traffic monitoring demonstration.
- **SMS / WhatsApp Alerts**: Preference toggles persisted in database; notifications delivered through in-app notification center.

