# stitchfyn-web

The frontend for StitchFYN. It displays what the backend reports and computes nothing on its own — no stage math, no risk levels, no balances calculated in the browser.

## How a mutation actually works

There's no optimistic UI here. Every change follows the same sequence:

1. Send the `POST`/`PATCH`/`DELETE` to the API.
2. Show a success toast acknowledging the request went through.
3. Invalidate the relevant TanStack Query cache entries.
4. Refetch from the server.
5. Render whatever the server actually says now.

If the UI shows something wrong, it's reflecting what the API returned — check the backend first.

## What's here

- **Production dashboard** — deadline risk and workshop load at a glance
- **Order detail** — full order view with the live workflow graph
- **Intake wizard** — customer lookup, measurement capture, order creation
- **Material vault** — stock levels, reservations, and the material ledger
- **Measurement archive** — version history, nothing overwritten
- **Customer portal** — read-only order status page for customers
- **StitchScore** — workshop reputation and on-time delivery metrics
- **Fabric safety flow** — intake photo verification and dispute handling
- **Group order coordination** — multiple orders booked together for one event
- **Deadline countdown** — daily digest and urgent-timeline escalation
- **Audit trail viewer** — full evidence view for dispute resolution
- **Analytics dashboard** — revenue, velocity, and activity reporting
- **Transparency panel** — trust/capacity/audit-health indicators for staff

## Tech stack

- [React 19](https://react.dev/) on Vite
- [TanStack Query v5](https://tanstack.com/query/latest) for server state
- [Zustand](https://zustand-demo.pmnd.rs/) for the small amount of client-only state (auth session, UI toggles)
- Plain CSS with a shared design-token layer — no CSS framework
- Axios, with silent token refresh on 401s

## Directory structure

- `src/app` — routing and top-level providers
- `src/components` — shared UI primitives (timelines, steppers, badges, data grids)
- `src/features` — one folder per domain area (auth, orders, workflow, materials, etc.), mirroring the backend's module boundaries
- `src/design-system` — design tokens and shared styling utilities

## Commands

```bash
npm install
npm run dev     # start the Vite dev server
npm run build   # production build
npm run lint    # ESLint
npm test        # Vitest
```
