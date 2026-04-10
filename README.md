# 🎨 StitchFlow Web Engine

The high-trust frontend projection layer for the StitchFlow workshop engine.

## 🏗️ Architecture: Pure Projection

Following the **API Consumption Doctrine**, this frontend performs zero business logic. It is a logic-less interface that projects the production reality defined by the Backend API.

### Features
- **Production Dashboard**: High-density view of workshop targets and deadline risks.
- **Order Detail View**: Deep-drill view of specific orders with interactive Workflow Graphs.
- **Intake Engine**: Multi-step wizard for customer lookup, measurement capture, and order creation.
- **Staff Management**: RBAC-protected roster for managing company users and invitations.
- **Workflow Orchestration**: Visual DAG renderer reflecting PENDING, ACTIVE, and COMPLETED states.
- **Measurement Archives**: Version-controlled measurement logs with immutable order locking.
- **Inventory Board**: Real-time material vault, stock reservation views, and dynamic low-stock guards.
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
