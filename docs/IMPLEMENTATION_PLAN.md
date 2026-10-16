# Stitch Urban Mobility Coordination Platform (UMCP) — Implementation Plan

## 1. Execution Principles

1. **Stitch UI Preservation**: The original HTML, CSS, and layout structures are honored and systematically mapped into reusable components with high-density municipal telemetry styling.
2. **Database-Backed Reality**: All operations persist to MongoDB. Client-side state is strictly synchronized with server responses.
3. **Real-Time Synchronization**: Report creations, status updates, traffic detours, and emergency corridors propagate over Socket.IO without page reloads.
4. **Role Enforcement**: Strict backend middleware ensures that citizen accounts cannot execute municipal, traffic, emergency, or admin endpoints.
5. **Transparency**: Features are clearly distinguished across Real, Provider-dependent, and Simulated.

---

## 2. Dependency-Ordered Implementation Roadmap

### Phase 1: Reconcile UI Analysis & Architecture Documentation (COMPLETED)
- [x] Full inspection of 50 Stitch directories and 25 functional screens.
- [x] Reconcile Light (`civic_mobility_platform`) and Dark (`urban_mobility_coordination_platform`) design tokens.
- [x] Create comprehensive documentation:
  - `docs/UI_INVENTORY.md`
  - `docs/DESIGN_SYSTEM.md`
  - `docs/UI_FUNCTIONALITY_AUDIT.md`
  - `docs/BUTTON_ACTION_MAP.md`
  - `docs/USER_FLOWS.md`
  - `docs/ARCHITECTURE.md`
  - `docs/DATABASE_SCHEMA.md`
  - `docs/API_SPECIFICATION.md`
  - `docs/IMPLEMENTATION_PLAN.md`
  - `docs/IMPLEMENTATION_STATUS.md`

### Phase 2: Backend Architecture, Database Models & Core API
- [ ] Initialize Node.js/Express backend (`server/`).
- [ ] Implement Mongoose schemas: `User`, `IncidentReport`, `ReportStatusHistory`, `Evidence`, `ParkingFacility`, `TrafficObservation`, `EmergencyRequest`, `EmergencyVehicle`, `MaintenanceTask`, `Notification`, `AuditLog`.
- [ ] Configure MongoDB connection with robust fallback/in-memory support for seamless local development and tests.
- [ ] Implement JWT Authentication & RBAC middleware.
- [ ] Implement Socket.IO server for real-time room and broadcast management.
- [ ] Implement database seeder (`server/src/utils/seed.js`) generating seed users for all 5 roles (`CITIZEN`, `MUNICIPAL_AUTHORITY`, `TRAFFIC_AUTHORITY`, `EMERGENCY_SERVICE`, `ADMIN`), initial parking facilities, traffic corridors, and test reports.
- [ ] Implement `/api/v1` routes: Auth, Reports, Tasks, Traffic, Emergency, Parking, Analytics, Notifications, Admin.

### Phase 3: Frontend Foundation & Design Token Integration
- [ ] Initialize React 18 + Vite client (`client/`).
- [ ] Configure Tailwind CSS with full token set from `docs/DESIGN_SYSTEM.md`.
- [ ] Setup Google Font `Plus Jakarta Sans` with tabular numbers.
- [ ] Build core UI library: Buttons, Badges, Inputs, Cards, Modals, Tabs, Dropdowns.
- [ ] Implement theme manager supporting Light, Dark, and System Sync.
- [ ] Implement AuthContext, SocketContext, and Axios API client with interceptors.
- [ ] Implement application layouts: Public Layout, Authenticated App Layout with persistent Sidebar, Header, Breadcrumbs, Ward Badges, and Mobile Drawer.
- [ ] Configure React Router with protected role-based guards.

### Phase 4: Authentication, Registration & Profile Views
- [ ] Implement `/login` with 4-tab role switcher and quick test-credential autofill.
- [ ] Implement `/register` with validation, password meter, and simulated OTP modal.
- [ ] Implement `/forgot-password` with expiring token simulation.
- [ ] Implement `/profile` with trust score gauge, editable info, and language selector.
- [ ] Implement `/403` Access Denied view with identity diagnostics.

### Phase 5: Citizen Reporting & Report History
- [ ] Implement `/citizen/report` with 6 category tiles, Leaflet coordinate locator, photo dropzone, severity pills, and instant submission.
- [ ] Implement `/citizen/my-reports` with status filter tabs, search, ward filter, and SLA indicators.
- [ ] Implement `/citizen/reports/:id` with 5-stage vertical timeline, dual photo gallery, and official acknowledgment receipt.
- [ ] Connect `/citizen/dashboard` with real-time KPI counts and quick report launchers.

### Phase 6: Interactive Mobility Map & Real-Time Sync
- [ ] Implement `/map` with full-bleed Leaflet container, custom SVG/CSS pins for Waterlogging, Roadwork, Transit, Parking, and Signals.
- [ ] Implement category layer filters, corridor speed sidebar, and nearby incidents drawer.
- [ ] Integrate Socket.IO listener: dynamically insert new report markers and status transitions without page reload.

### Phase 7: Municipal Authority, Traffic, Emergency & Parking Modules
- [ ] Implement `/authority/dashboard` and `/authority/issues` for report triage and work order assignment.
- [ ] Implement `/authority/tasks/:id` for maintenance execution, material logging, and sign-off.
- [ ] Implement `/traffic/dashboard` and `/traffic/verify` with spatial clustering, CCTV simulator, and advisory route broadcasting.
- [ ] Implement `/emergency/dashboard` with green corridor directive activation and vehicle GPS tracker.
- [ ] Implement `/parking` with facility cards, live vacancy meters, and operator update modal.

### Phase 8: Analytics, Notifications, Administration & Support
- [ ] Implement `/analytics` with Recharts charts (SLA compliance, density heatmaps).
- [ ] Implement `/notifications` with category filtering and mark-as-read.
- [ ] Implement `/admin/dashboard` and `/admin/users` with RBAC governance and audit logs.
- [ ] Implement `/support` with inquiry form and ward liaison directory.
- [ ] Implement `/settings/appearance` and `/settings/notifications`.

### Phase 9: Testing, Verification & End-to-End Walkthrough
- [ ] Execute automated verification scripts across the core citizen -> authority -> map synchronization journey.
- [ ] Verify multi-client real-time synchronization.
- [ ] Document final implementation status in `docs/IMPLEMENTATION_STATUS.md`.
