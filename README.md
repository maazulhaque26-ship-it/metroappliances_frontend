# Metro Appliances ERP — Frontend

**Version**: v1.0.0  
**Stack**: React 18 · Vite · Redux Toolkit · React Router 6 · Recharts · Socket.IO Client  
**Deployed**: Vercel (https://metroappliances-frontend.vercel.app)

---

## Quick Start

```bash
# From repo root (where vite.config.js lives)
npm install
npm run dev          # development server → http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview production build
```

---

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api    # backend API base URL
```

For production (Vercel), set `VITE_API_URL` to the Render backend URL.

---

## Project Structure

```
src/
  App.jsx                 # route definitions (all admin pages lazy-loaded)
  main.jsx                # root render, ErrorBoundary, Redux Provider
  components/
    layout/               # Navbar, Footer (storefront)
    ui/                   # ErrorBoundary, ImageUploader, Skeleton, etc.
    shared/               # DataTable, Pagination, StatCard, Modal, etc.
  hooks/                  # usePermissions, usePagination, useExport, etc.
  pages/
    admin/                # 432 admin panel pages (AdminLayout shell)
    agent/                # Sales agent portal pages
    dealer/               # Dealer portal pages
    /                     # Customer storefront pages
  redux/
    slices/               # One slice per domain
    store.js
  services/
    api.js                # Customer/admin API calls
    dealerAPI.js          # Dealer portal API calls
    agentAPI.js           # Sales agent API calls
    copilotAPI.js         # AI Copilot API calls
    portfolioAPI.js       # PPM API calls
    projectAPI.js         # Project management API calls
    formatters.js         # Currency, date, phone formatters
    exportService.js      # CSV/PDF export utilities
  utils/
    orderStatus.js
    imageHelper.js
```

---

## Portal Navigation

| Portal | Entry Point | Auth Redux Slice |
|---|---|---|
| Customer storefront | `/` | `authSlice` |
| Admin panel | `/admin/dashboard` | `authSlice` (role≥admin) |
| Dealer portal | `/dealer/login` | `dealerAuthSlice` |
| Sales agent portal | `/agent/login` | `agentAuthSlice` |
| Employee ESS | `/employee/login` | `employeeAuthSlice` |

---

## Build Output

- **432 lazy-loaded admin pages** — each page is a separate code-split chunk
- Main vendor bundle: ~417 kB (104 kB gzip)
- Recharts: ~273 kB (83 kB gzip) — loaded only on chart pages
- All other pages: 6–50 kB each

---

## Deployment (Vercel)

1. Connect GitHub repo to Vercel
2. Framework: Vite
3. Build command: `npx vite build`
4. Output directory: `dist`
5. Set `VITE_API_URL` environment variable to backend URL
6. Routes: configured via `vercel.json` for SPA routing

---

## Error Handling

- `ErrorBoundary` wraps the entire app at `main.jsx`
- All API errors display via `react-toastify` notifications
- Empty states and loading skeletons on all list/detail pages

---

## Known Issues (v1.0.0)

None affecting production functionality.
