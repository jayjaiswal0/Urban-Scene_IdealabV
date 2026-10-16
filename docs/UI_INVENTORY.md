# Stitch Urban Mobility Coordination Platform (UMCP) — UI Inventory

## 1. Directory Structure and Asset Source

The original Stitch design payload contains 50 directories located under:
`stitch_urban_mobility_coordination_platform/stitch_urban_mobility_coordination_platform/`

These files are preserved as an immutable reference archive. No original files in this directory are modified or deleted.

### Structural Breakdown:
- **Design Systems (2 directories):**
  - `civic_mobility_platform/DESIGN.md`: Light Mode Civic Minimalism (`#f8f9ff` canvas, `#ffffff` cards, `#2563eb` primary blue, `#0b1c30` text).
  - `urban_mobility_coordination_platform/DESIGN.md`: Dark Mode Technical Glassmorphism (`#0b1326` obsidian canvas, `#171f33` panels, `#3b82f6` electric civic blue, `#dae2fd` high-contrast text).
- **Paired Screens (23 pairs = 46 directories):** Full Light and Dark mode variations of each screen.
- **Standalone Auxiliary Screens (2 directories):**
  - `notifications`: Light mode notifications & civic advisories.
  - `report_details_and_status_timeline`: Light mode multi-stage ticket timeline & field verification audit.
- **Total Unique Functional Screens:** **25 Unique Screens**.

---

## 2. Complete Screen Inventory Table

| # | Screen Name | Light Directory | Dark Directory | Target Route | Canonical Role(s) | UI Layout Hierarchy & Key Components |
|---|---|---|---|---|---|---|
| **1** | Public Portal Homepage | `public_portal_homepage` | `public_portal_homepage_dark_mode` | `/` | Public / Guest | Hero banner, quick issue report CTA, live mobility stats strip, transit feed carousel, ward selector, emergency quick dial, footer navigation. |
| **2** | Registration Page | `registration_page` | `registration_page_dark_mode` | `/register` | Citizen | Split layout (branding left, form right), full name, email, mobile with +91 prefix, ward dropdown, password + confirm with strength meter, WhatsApp alerts checkbox, terms checkbox, submit CTA. |
| **3** | Login Page | `login_page` | `login_page_dark_mode` | `/login` | All Roles | Role switcher tabs (Citizen, Municipal, Traffic, Emergency), dynamic 2FA notice, identifier input, password with eye toggle, remember me, forgot password link, sign in CTA, guest access CTA. |
| **4** | Forgot Password | `forgot_password` | `forgot_password_dark_mode` | `/forgot-password` | All Roles | Card centered layout, role selector radio, registered email input, send reset link button, helpline contact, back to login link. |
| **5** | Citizen Dashboard | `citizen_dashboard` | `citizen_dashboard_dark_mode` | `/citizen/dashboard` | `CITIZEN` | Persistent sidebar, ward badge, 4 KPI cards (Submitted, Under Review, In Progress, Resolved), quick report category tiles, recent reports table, "+ Report Issue" CTA. |
| **6** | Report an Issue | `report_an_issue` | `report_an_issue_dark_mode` | `/citizen/report` | `CITIZEN` | 6 category tiles, street address input, ward selector, GPS detect button, coordinate badge, interactive Leaflet map pin, description textarea with character counter, 3 severity pills, photo dropzone, WhatsApp toggle, submit CTA. |
| **7** | My Reports | `my_reports` | `my_reports_dark_mode` | `/citizen/my-reports` | `CITIZEN` | 4 summary metric cards, search bar, ward filter, sort dropdown, status filter tabs (All, Under Review, In Progress, Resolved, Drafts), report table with SLA status, view details row action, download summary button. |
| **8** | Report Details & Timeline | `report_details_and_status_timeline` | *(Dark mode derived)* | `/citizen/reports/:id` | `CITIZEN`, Authorities | Back navigation link, reference ID badge, download acknowledgment receipt, add note button, overview grid, dual photo gallery (citizen vs field engineer), 5-stage vertical timeline. |
| **9** | Live Mobility Map | `mobility_map` | `mobility_map_dark_mode` | `/map` | All Roles | Full-bleed interactive Leaflet map, 5 pin types (Waterlogging, Roadwork, Transit, Smart Parking, Signal), hover tooltips, category layer filter, GPS locate button, zoom controls, corridor speed index sidebar, nearby reports drawer. |
| **10** | Parking Information | `parking_information` | `parking_information_dark_mode` | `/parking` | All Roles | 4 metric summary cards (Total Bays, Available, EV Bays, FastTag), ward filter tabs, facility search, facility cards with live vacancy meters, tariff tables, get directions CTA. |
| **11** | Notifications & Advisories | `notifications` | *(Dark mode derived)* | `/notifications` | All Roles | Filter pills (All, Report Updates, Ward Advisories, Transit Alerts), mark all as read button, notification cards with icons, urgency badges, relative timestamps, and deep-link actions. |
| **12** | My Profile | `my_profile` | `my_profile_dark_mode` | `/profile` | `CITIZEN`, Authorities | Avatar upload button, DigiLocker/Aadhaar verification badges, Civic Trust Score gauge (785/1000), civic badges, legal name (readonly), email, phone, ward select, preferred language (English, Marathi, Hindi), save changes button. |
| **13** | Appearance Settings | `appearance_settings` | `appearance_settings_dark_mode` | `/settings/appearance` | All Roles | Sub-navigation tabs (Appearance, Notifications, Security, Language), 3 theme cards (Light, Dark, System), high contrast switch, UI scale buttons, accent color selector, save preferences button. |
| **14** | Notifications & Privacy | `notifications_and_privacy_settings` | `notifications_and_privacy_settings_dark_mode` | `/settings/notifications` | All Roles | Multi-channel matrix (In-App, SMS, WhatsApp, Email) across report stages, emergency broadcast toggle, data sharing consent, data export button, save button. |
| **15** | Municipal Authority Dashboard | `municipal_authority_dashboard` | `municipal_authority_dashboard_dark_mode` | `/authority/dashboard` | `MUNICIPAL_AUTHORITY` | Operational dispatch banner, 4 KPI cards (Pending Triage, Under Inspection, In Progress, Resolved), ward filter, export roster button, create work order button, triage queue grid, squad dispatch buttons. |
| **16** | Municipal Issue Management | `municipal_issue_management` | `municipal_issue_management_dark_mode` | `/authority/issues` | `MUNICIPAL_AUTHORITY` | Multi-level filter toolbar, search bar, issue table with SLA timers, department assignment dropdown (Public Works, Drainage, Electrical, Solid Waste), squad assign modal trigger, bulk actions. |
| **17** | Municipal Task Details | `municipal_maintenance_task_details` | `municipal_maintenance_task_details_dark_mode` | `/authority/tasks/:id` | `MUNICIPAL_AUTHORITY` | Task header with SLA countdown badge, reassign squad button, material usage logger modal, status update dropdown, pre/post repair photo uploader, mark completed sign-off button. |
| **18** | Traffic Coordination Dashboard | `traffic_coordination_dashboard` | `traffic_coordination_dashboard_dark_mode` | `/traffic/dashboard` | `TRAFFIC_AUTHORITY` | Dispatch status pill, broadcast advisory modal CTA, sync button, 4 KPI cards (Active Incidents, Pending Verification, Corridor Flow, Active Detours), arterial corridor speed meters, CCTV camera tiles, congestion queue. |
| **19** | Traffic Incident Verification | `traffic_incident_verification` | `traffic_incident_verification_dark_mode` | `/traffic/verify` | `TRAFFIC_AUTHORITY` | Geo-clusters triangulation card, transit fleet speed telemetry drop (-82%), live CCTV feed simulator, corroboration inputs, verify & dispatch button, route advisory button, dismiss button. |
| **20** | Emergency Services Dashboard | `emergency_services_dashboard` | `emergency_services_dashboard_dark_mode` | `/emergency/dashboard` | `EMERGENCY_SERVICE` | Priority Alert Level II badge, issue corridor clearance directive CTA, 4 KPI cards, active emergency corridor tracker, hospital route synchronizer, emergency vehicle GPS tracker, inter-agency dispatch log. |
| **21** | Civic Analytics | `civic_analytics` | `civic_analytics_dark_mode` | `/analytics` | `ADMIN`, Authorities | Date range picker (7/30/90 days), ward selector, incident type filter, export dropdown (CSV, PDF), hazard density heatmaps, SLA compliance charts, departmental turnaround benchmarks. |
| **22** | Administration Dashboard | `administration_dashboard` | `administration_dashboard_dark_mode` | `/admin/dashboard` | `ADMIN` | System governance header, cluster diagnostics button, 4 macro KPIs, system health grid (API gateway, GIS engine, SMS gateway, Auth service), recent audit log trail, maintenance banner toggle. |
| **23** | User and Role Management | `user_and_role_management` | `user_and_role_management_dark_mode` | `/admin/users` | `ADMIN` | RBAC status ledger, search bar (⌘K), role filter dropdown, status filter dropdown, user directory table with role badges, add user modal CTA, edit permissions drawer, reset password button. |
| **24** | Contact & Support Desk | `contact_and_support_desk` | `contact_and_support_desk_dark_mode` | `/support` | All Roles | Support inquiry form (Name, Email, Category, Priority, Description, File), submit button, ward liaison officer directory with phone numbers, FAQ accordion, emergency helpline banner. |
| **25** | Unauthorized Access Denied | `unauthorized_access_denied` | `unauthorized_access_denied_dark_mode` | `/403` | All Roles | HTTP 403 Security notice, diagnostic panel (current identity vs required role tier), return to citizen dashboard CTA, explore public map CTA, sign out & switch account button. |
