# Stitch Urban Mobility Coordination Platform (UMCP) — Technical Architecture

## 1. System Overview

The Urban Mobility Coordination Platform (UMCP) is an enterprise-grade municipal coordination hub connecting citizens, municipal works departments, traffic enforcement, emergency services, and city administrators. The platform preserves the high-density aesthetic of the Stitch design export while delivering an authoritative full-stack architecture backed by Node.js, Express, MongoDB, and Socket.IO.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (SPA)                           │
│   React 18 + Vite + Tailwind CSS + React Router + Leaflet + Recharts   │
│   - Design System Tokens (Light & Dark Mode)                           │
│   - Role-Based View Engine & Dynamic Navigation                        │
│   - Interactive Map Engine & Real-Time Socket Listener                 │
└───────────────────▲────────────────────────────────────▲───────────────┘
                    │ HTTPS / REST                       │ WebSocket
                    │ (JSON / Cookies)                   │ (Events)
┌───────────────────▼────────────────────────────────────▼───────────────┐
│                     BACKEND APPLICATION SERVER                         │
│                    Node.js + Express + Socket.IO                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Middlewares: Auth (JWT), RBAC Guard, Rate Limiter, Error Handler │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────── Controllers & Routes ─────────────────────┐  │
│  │ /auth   /reports   /tasks   /traffic   /emergency   /parking ... │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────── Service Layer ──────────────────────────┐  │
│  │ ReportService, TaskService, NotificationService, GeoService      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────▲────────────────────────────────────▲───────────────┘
                    │ Mongoose ODM                       │ Cloud / Telemetry
┌───────────────────▼──────────────────────┐ ┌───────────▼───────────────┐
│            DATABASE LAYER                │ │   EXTERNAL INTEGRATIONS   │
│           MongoDB Database               │ │ - OSM Map Tiles           │
│  - Users & RBAC Claims                   │ │ - Nominatim Geocoding     │
│  - IncidentReports & StatusHistories     │ │ - OSRM Routing Engine     │
│  - MaintenanceTasks & Material Logs      │ │ - Cloudinary / Local Store│
│  - ParkingFacilities & Live Counts       │ │ - Gemini AI API (Optional)│
│  - Notifications & AuditLogs             │ │ - Synthetic Telemetry Sim │
└──────────────────────────────────────────┘ └───────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend
- **Runtime & Build**: React 18, Vite.
- **Styling**: Tailwind CSS with custom theme extensions mapped to Stitch design tokens (`DESIGN.md`).
- **Routing**: React Router v6 with authenticated route guards and role-based redirectors.
- **GIS / Mapping**: Leaflet & React Leaflet with custom SVG/CSS marker pins, pulse animations, and interactive tooltips.
- **Data Visualization**: Recharts for civic analytics, SLA compliance gauges, and departmental response time benchmarks.
- **Iconography**: Lucide React, aligned with Google Material Symbols Outlined used in the Stitch mockups.
- **Form State & Validation**: React Hook Form with Zod schemas for client-side validation.
- **Real-Time Client**: Socket.IO Client for instant event synchronization.

### 2.2 Backend
- **Runtime**: Node.js (LTS), Express.
- **Database**: MongoDB with Mongoose ODM (strict typing, schema validation, compound indexes).
- **Authentication**: JSON Web Tokens (JWT) with HTTP-only cookies and Authorization header support, passwords hashed with bcryptjs (12 salt rounds).
- **Authorization**: Role-Based Access Control (RBAC) middleware verifying canonical roles:
  - `CITIZEN`
  - `MUNICIPAL_AUTHORITY`
  - `TRAFFIC_AUTHORITY`
  - `EMERGENCY_SERVICE`
  - `ADMIN`
- **Real-Time Engine**: Socket.IO server integrated with Express HTTP server, broadcasting lifecycle events.
- **Evidence Handling**: Multer for multi-part file uploads with size and MIME validation; configurable cloud storage (Cloudinary) or local file storage fallback.
- **Centralized Error Handling**: Unified API response envelopes `{ success: boolean, data?: any, error?: { code, message, details } }`.

---

## 3. Real, Provider-Dependent, and Simulated Services

In accordance with academic and engineering integrity standards, the system clearly delineates data origins:

| Integration / Service | Classification | Implementation Details |
|---|---|---|
| **User Authentication & RBAC** | **REAL** | Genuine bcrypt hashing, JWT issuance, MongoDB user persistence, and route protection. |
| **Incident Reporting & History** | **REAL** | Authoritative database persistence, multi-stage state transitions, and audit logging. |
| **Maintenance Work Orders** | **REAL** | Task assignments, supervisor tracking, material logs, and sign-offs stored in MongoDB. |
| **Map Visualization & Pins** | **REAL** | Leaflet rendering coordinates persisted in MongoDB, dynamically updated via Socket.IO. |
| **Notification Engine** | **REAL** | In-app notification creation, read/unread status, and live socket dispatch. |
| **Map Base Tiles** | **PROVIDER-DEPENDENT** | OpenStreetMap standard tile servers (`tile.openstreetmap.org`). |
| **Reverse Geocoding** | **PROVIDER-DEPENDENT** | Nominatim OpenStreetMap API with fallback to local MMR ward coordinates. |
| **Routing / Detours** | **PROVIDER-DEPENDENT** | OSRM routing engine with fallback to calculated waypoint coordinates. |
| **Cloud Evidence Storage** | **PROVIDER-DEPENDENT** | Cloudinary API when credentials provided; local `/uploads` directory fallback. |
| **AI Incident Triangulation** | **PROVIDER-DEPENDENT** | Google Gemini API when key is configured; rule-based spatial cluster analyzer fallback. |
| **Traffic Speed Telemetry** | **SIMULATED** | Demonstrates arterial speed drops (-82% on WEH) using timed stochastic fluctuations; clearly labeled as synthetic demonstration data. |
| **CCTV Feeds** | **SIMULATED** | High-fidelity video simulation with timecode overlay for traffic corridor demonstration. |
| **Emergency Signal Priority** | **SIMULATED** | Demonstrates green corridor pre-emption logic and UI visualization without physical signal controllers. |

---

## 4. Directory Structure

```
stitch_urban_mobility_coordination_platform/
├── docs/                         # Comprehensive project documentation
│   ├── UI_INVENTORY.md
│   ├── DESIGN_SYSTEM.md
│   ├── UI_FUNCTIONALITY_AUDIT.md
│   ├── BUTTON_ACTION_MAP.md
│   ├── USER_FLOWS.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_SPECIFICATION.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── IMPLEMENTATION_STATUS.md
├── server/                       # Express + MongoDB + Socket.IO Backend
│   ├── src/
│   │   ├── config/               # DB, Socket, Environment config
│   │   ├── controllers/          # Route controllers
│   │   ├── middleware/           # Auth, RBAC, Validation, Error middlewares
│   │   ├── models/               # Mongoose schemas (11 models)
│   │   ├── routes/               # API route definitions (/api/v1/*)
│   │   ├── services/             # Business logic & external adapters
│   │   ├── sockets/              # Socket.IO event handlers
│   │   ├── utils/                # Seeders, helpers, validators
│   │   └── server.js             # Server entry point
│   ├── package.json
│   └── .env.example
├── client/                       # React 18 + Vite Frontend
│   ├── src/
│   │   ├── assets/               # Icons, images, logos
│   │   ├── components/           # Reusable UI components
│   │   │   ├── common/           # Buttons, Badges, Modals, Forms
│   │   │   ├── layout/           # Header, Sidebar, Footer, MobileNav
│   │   │   └── map/              # Leaflet Map, Custom Markers, Popups
│   │   ├── context/              # AuthContext, ThemeContext, SocketContext
│   │   ├── hooks/                # useAuth, useSocket, useReports, useMap
│   │   ├── pages/                # 25 functional screen views
│   │   ├── services/             # Axios API client & endpoints
│   │   ├── styles/               # Tailwind & theme variables
│   │   ├── App.jsx               # Route tree & providers
│   │   └── main.jsx              # React DOM bootstrap
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── stitch_urban_mobility_coordination_platform/ # Preserved original Stitch files (immutable archive)
```

---

## 5. Real-Time Socket.IO Protocol

The server and client communicate in real-time through the following event contracts:

| Event Name | Direction | Payload | Trigger / Purpose |
|---|---|---|---|
| `report:created` | Server -> Clients | `{ report: IncidentReport }` | Broadcast when a new citizen report is saved; adds marker on all maps and increments authority queue. |
| `report:statusChanged` | Server -> Clients | `{ reportId, status, historyEntry }` | Broadcast when an officer updates a report's lifecycle status. |
| `incident:verified` | Server -> Clients | `{ incidentId, location, severity }` | Emitted when traffic police verifies a hazard; triggers urgent alert. |
| `advisory:broadcast` | Server -> Clients | `{ advisoryId, title, detourCoordinates }` | Emitted when traffic authority issues a detour; renders route line on map. |
| `corridor:activated` | Server -> Clients | `{ corridorId, routePoints, vehicleType }` | Emitted when EMS activates green corridor; pulses corridor lanes on map. |
| `parking:occupancyUpdated`| Server -> Clients | `{ facilityId, occupiedSpots, vacantSpots }` | Emitted when parking operator or sensor hub syncs live bay counts. |
