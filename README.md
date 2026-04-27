# 🎨 Stitchfyn Web Engine

The high-trust frontend projection layer for the Stitchfyn workshop engine.

## 🏗️ Architecture: Pure Projection

Following the **API Consumption Doctrine**, this frontend performs zero business logic. It is a logic-less interface that projects the production reality defined by the Backend API.

### 🔄 The "Pure Refresh" Sequence
To maintain absolute synchronization with the workshop floor, we avoid optimistic UI updates. Every mutation follows a strict sequence:
1. **Command**: Send `POST/PUT/DELETE` to the API.
2. **Acknowledge**: Show success toast (acknowledging command receipt).
3. **Invalidate**: Trigger TanStack Query cache invalidation.
4. **Refetch**: Automatically fetch the updated projection from the SSOT (Single Source of Truth).
5. **Render**: Display the actual state of the workshop.

---

## 💎 Design System & Aesthetics

Stitchfyn is designed to be a premium, "Trust-First" tool for modern workshops.
- **Premium Aesthetics**: Vibrant, curated color palettes, modern typography (Inter/Outfit), and subtle glassmorphism.
- **Modular CSS**: A token-driven styling architecture ensuring consistency across high-density management views and large-target shop floor interfaces.
- **Micro-animations**: Smooth transitions for stage completions and status changes to make the system feel responsive and "alive."

---

## 🛠️ Features

- **Production Dashboard**: High-density view of workshop targets and deadline risks.
- **Order Detail View**: Deep-drill view of specific orders with interactive Workflow Graphs.
- **Intake Engine**: Multi-step wizard for customer lookup, measurement capture, and order creation.
- **Material Vault**: Real-time stock reservation, immutable ledger views, and dynamic low-stock guards.
- **Measurement Archives**: Version-controlled measurement logs with immutable history.
- **Customer Portal**: A strictly read-only environment for production transparency.

---

## 🛠️ Tech Stack
- **Framework**: [React 19](https://react.dev/) (Vite)
- **Data Fetching**: [TanStack Query (v5)](https://tanstack.com/query/latest)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Minimal global state)
- **Styling**: Modular Vanilla CSS with centralized Design Tokens.
- **Networking**: Axios with "Silent Refresh" for JWT rotation.

---

## 📂 Directory Structure
- `src/app`: Routing and global provider configuration.
- `src/components`: UI primitives (Timeline, Stepper, RiskBadges, DataGrid).
- `src/features`: Domain-specific modules (Auth, Orders, Workflow, Materials).
- `src/design-system`: The core tokens and utility layer of the visual engine.

---

## 🚀 Commands
```bash
npm install  # Install dependencies
npm run dev   # Start Vite development server
npm run build # Production build
npm run lint  # ESLint check
```

---
© 2026 Bigeen Solutions — Pure Projection Architecture.
