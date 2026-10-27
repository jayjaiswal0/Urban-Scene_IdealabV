# Urban Scene — Know what’s moving.

> **Academic & Architectural Traceability Note**: Formerly developed as the **Urban Mobility Coordination Platform (UMCP)**. All underlying schemas, RBAC tiers, geospatial APIs, and Socket.IO events maintain 100% backward compatibility under the Urban Scene civic brand.

[![Brand](https://img.shields.io/badge/Brand-Urban%20Scene-0066FF.svg)](#)
[![Tagline](https://img.shields.io/badge/Tagline-Know%20what's%20moving-8A2BE2.svg)](#)
[![Node.js](https://img.shields.io/badge/Node.js-v18.0%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.3-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-v6.0-purple.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://mongoosejs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-black.svg)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC.svg)](https://tailwindcss.com/)

**Urban Scene** is an enterprise-grade civic mobility and municipal coordination platform built for the **Mira-Bhayandar Municipal Corporation (MBMC)** urban sector. Featuring custom light- and dark-mode brand assets, live telemetry maps, and real-time civic synchronization, Urban Scene bridges citizens, municipal triage squads, traffic police enforcement, and emergency green corridors.

---

## 1. Technology Stack

- **Frontend Client (`client/`)**:
  - React 18.3 & React DOM
  - Vite 6.0 (fast development server & optimized production bundling)
  - Tailwind CSS 3.4 with custom telemetry color tokens
  - Leaflet 1.9 & React-Leaflet 4.2 (OpenStreetMap GIS layer)
  - Recharts 2.15 (civic analytics & SLA visualization)
  - Lucide React (standardized municipal icon set)
  - Socket.IO Client 4.8 (real-time bi-directional event stream)
  - Axios 1.7 (JWT interceptor & REST client)
- **Backend Server (`server/`)**:
  - Node.js (ESM modules) & Express 4.21
  - Mongoose 8.9 (11 strict schemas with compound geospatial indexes)
  - Socket.IO 4.8 (role- and ward-scoped real-time event rooms)
  - Bcrypt.js 2.4 (12-round cryptographic salted password hashing)
  - JSON Web Tokens (JWT) with strict RBAC route middleware
  - In-Memory Fallback: `mongodb-memory-server` 10.1 (zero-dependency local development sandbox)
- **Reference Preservation (`stitch_urban_mobility_coordination_platform/`)**:
  - Pristine original HTML, CSS, and asset exports covering all 25 screens in light and dark modes.

---

## 2. Prerequisites

- **Node.js**: `v18.0.0` or higher (verified compatible through Node `v24`)
- **npm**: `v9.0.0` or higher
- **MongoDB** *(Optional)*: A local MongoDB instance listening on `mongodb://127.0.0.1:27017` or a connection URI via `MONGODB_URI`. If no external MongoDB daemon is detected, the server automatically starts an in-memory MongoDB fallback instance for seamless local testing.

---

## 3. Installation & Setup

### 3.1 Install Dependencies
```bash
# Install backend dependencies
npm --prefix server install

# Install frontend dependencies
npm --prefix client install
```

### 3.2 Environment Configuration
Copy the provided environment templates and configure local settings:

```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration (optional for custom deployment targets)
cp client/.env.example client/.env
```

Review `server/.env` to customize the `PORT`, `JWT_SECRET`, or `MONGODB_URI` if connecting to an external MongoDB service.

---

## 4. Running the Platform

### 4.1 Seed Demonstration Dataset
Populate the database with canonical accounts, parking bays, traffic corridors, emergency units, and initial incident reports:
```bash
npm run seed
```

### 4.2 Start Backend Server
Starts the Express REST API and Socket.IO engine on `http://localhost:5000`:
```bash
npm run server
```

### 4.3 Start Frontend Client
In a separate terminal, launch the Vite development server on `http://localhost:5173`:
```bash
npm run client
```

### 4.4 Build for Production
To validate production compilation of the frontend bundle:
```bash
npm run build:client
```

---

## 5. Verification & Testing

### 5.1 End-to-End Acceptance Test
Execute the comprehensive 13-stage automated verification flow (`server/src/utils/testFlow.js`):
```bash
npm run test:flow
```
This tests:
1. Citizen account registration and MongoDB document persistence.
2. Bcrypt 12-round cryptographic password hashing verification.
3. Credential comparison & JWT token issuance.
4. Geolocated incident submission with GeoJSON `2dsphere` coordinate indexing.
5. Lifecycle status history tracking (`NONE -> SUBMITTED`).
6. Query synchronization across citizen My Reports and Leaflet map markers.
7. Authorized municipal authority authentication & triage transition (`UNDER_REVIEW`).
8. Work order task dispatch, material usage logging, and completion (`RESOLVED`).
9. Citizen in-app notification dispatch.
10. Strict RBAC security boundary enforcement (blocking unauthorized operations with HTTP 403 Forbidden).

---

## 6. Pre-Configured Test Accounts

The platform is pre-seeded with test accounts across all 5 canonical roles:

| Role | Email | Password | Primary Console & Privileges |
|---|---|---|---|
| **`CITIZEN`** | `citizen@mbmc.gov.in` | `Password@123` | Public incident reporting, My Reports tracking, feedback rating. |
| **`MUNICIPAL_AUTHORITY`** | `officer.muni@mbmc.gov.in` | `Password@123` | Operational triage queue, work orders, squad dispatch, material logging. |
| **`TRAFFIC_AUTHORITY`** | `inspector.traffic@mbmc.gov.in` | `Password@123` | Speed indices, incident spatial triangulation, detour advisories. |
| **`EMERGENCY_SERVICE`** | `dispatcher.ems@mbmc.gov.in` | `Password@123` | Priority alert management, green corridor route activation. |
| **`ADMIN`** | `admin@mbmc.gov.in` | `Password@123` | Cluster health diagnostics, RBAC governance, audit trail ledger. |

---

## 7. Database Configuration & Fallback Transparency

- **Persistent Mode**: When `MONGODB_URI` points to a reachable MongoDB service, all documents persist permanently across restarts.
- **In-Memory Fallback**: If connection to the primary URI fails (e.g. `ECONNREFUSED 127.0.0.1:27017`), the server falls back to an ephemeral `mongodb-memory-server` instance.
- **Diagnostics**: The active database mode is exposed via `GET /api/v1/health` and displayed directly in the System Diagnostics card on the Administration Dashboard.

---

## 8. Academic Scope & Simulation Disclaimers

In accordance with academic project safety standards for the Mira-Bhayandar demonstration prototype:

- **Simulated Infrastructure**: FastTag RFID tariffs, SMS/WhatsApp delivery, CCTV video feeds, arterial speed indices, and emergency traffic signal pre-emption are high-fidelity models for demonstration purposes.
- **Safety Boundaries**: The system does not interface with, control, or impersonate physical traffic signal hardware, live emergency dispatchers, or municipal police radio frequencies.

---

## 9. Documentation Index

Detailed architectural and design specifications are cataloged in [`docs/`](./docs/):

- [UI Inventory](./docs/UI_INVENTORY.md) — Screen catalog of all 25 Stitch views (Light & Dark).
- [Design System](./docs/DESIGN_SYSTEM.md) — Reconciled color tokens, typography, and theme specs.
- [UI Functionality Audit](./docs/UI_FUNCTIONALITY_AUDIT.md) — Audit of interactive controls and validations.
- [Button Action Map](./docs/BUTTON_ACTION_MAP.md) — Button-to-API contract matrix and simulation statuses.
- [User Flows](./docs/USER_FLOWS.md) — Sequence diagrams across Citizen, Municipal, Traffic, EMS, and Admin journeys.
- [Architecture](./docs/ARCHITECTURE.md) — Full-stack system architecture, layers, and Socket.IO protocol.
- [Database Schema](./docs/DATABASE_SCHEMA.md) — 11 Mongoose schemas and compound indexes.
- [API Specification](./docs/API_SPECIFICATION.md) — REST endpoints under `/api/v1` and WebSocket events.
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md) — Development roadmap and execution phases.
- [Implementation Status](./docs/IMPLEMENTATION_STATUS.md) — Feature matrix (Implemented, Provider-dependent, Simulated).
