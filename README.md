# 🎨 StitchFlow Web Engine

The high-trust frontend projection layer for the StitchFlow workshop engine.

## 🏗️ Architecture: Pure Projection

Following the **API Consumption Doctrine**, this frontend performs zero business logic. It is a logic-less interface that projects the production reality defined by the Backend API.

### Features
- **Production Dashboard**: High-density view of workshop targets and deadline risks.
- **Workflow Orchestration**: Linear and parallel stage management with reactive status updates.
- **Material Ledger**: Immutable audit trail with photo evidence and delta-based stock tracking.
- **Measurement archives**: Version-controlled measurement logs with actor attribution.
- **Customer Portal**: A strictly read-only environment for client order tracking.

## 🛠️ Tech Stack
- **Framework**: React 19 (Vite)
- **Data Fetching**: TanStack Query (v5) - The core engine for cache invalidation and "Pure Refresh".
- **State Management**: Zustand (Minimal global state).
- **Styling**: Modular CSS System with centralized design tokens (`src/design-system`).
- **Networking**: Axios with robust interceptors for JWT rotation and silent refreshing.

## 📂 Directory Structure
- `src/app`: Routing and global configuration.
- `src/components`: UI primitives (Timeline, Stepper, RiskBadges).
- `src/features`: Domain-specific modules (Auth, Orders, Workflow, Materials, Measurements, Customer).
- `src/design-system`: Token-driven CSS architecture.

## 🚀 Commands
- `npm run dev`: Start Vite development server.
- `npm run build`: Production build.
- `npm run lint`: ESLint check.

---
© 2026 Bigeen Solutions — Pure Projection Architecture.
