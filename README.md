# Metro Appliances ERP — Frontend

> **React 18 SPA** powering a full enterprise ERP — customer storefront, admin panel, and 5 specialised portals, all lazy-loaded and code-split via Vite.

**Version**: v1.0.0 | **Stack**: React 18 · Vite · Redux Toolkit · React Router 6 · Recharts · Socket.IO Client | **Deployed**: Vercel

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Project Structure](#project-structure)
6. [Portals & Routing](#portals--routing)
7. [State Management (Redux)](#state-management-redux)
8. [API Services Layer](#api-services-layer)
9. [Component Library](#component-library)
10. [Hooks](#hooks)
11. [Styling & Theme](#styling--theme)
12. [Build & Deploy (Vercel)](#build--deploy-vercel)
13. [Adding New Pages](#adding-new-pages)
14. [Testing](#testing)
15. [Known Issues](#known-issues)

---

## Project Overview

The Metro Appliances frontend is a single-page application (SPA) that serves 6 distinct user groups:

| Portal | Who Uses It | Entry URL |
|---|---|---|
| **Customer Storefront** | Public buyers | `/` |
| **Admin Panel** | Internal staff, managers | `/admin/dashboard` |
| **Dealer Portal** | B2B dealer companies | `/dealer/login` |
| **Sales Agent Portal** | Field sales reps | `/agent/login` |
| **Employee Self-Service (ESS)** | Company employees | `/employee/login` |
| *(Supplier, Technician, Engineer)* | Managed via admin panel | `/admin/*` |

The app has **432 lazy-loaded admin pages** covering every ERP module from procurement to AI copilot. Each admin page is a separate Vite code-split chunk so initial load stays fast.

---

## Prerequisites

- **Node.js 20+** — [Download](https://nodejs.org/)
- **Git**
- The **backend API running** on `http://localhost:5000` (see [backend README](https://github.com/maazulhaque26-ship-it/metroappliances_backend))

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/maazulhaque26-ship-it/metroappliances_frontend
cd metroappliances_frontend

# 2. Install dependencies
npm install

# 3. Create your local environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# 4. Start the development server
npm run dev
# App opens at http://localhost:5173
```

### Useful development commands

```bash
npm run dev          # Start Vite dev server with HMR (hot module replacement)
npx vite build       # Production build → dist/
npx vite preview     # Preview the production build locally before deploying
```

> **Important:** Always use `npx vite build` for the production build — do **not** `cd` into any subfolder. The `vite.config.js` at the repo root is the correct one.

---

## Environment Variables

Create a `.env` file in the repo root (same level as `vite.config.js`):

```env
# Required — points to your running backend
VITE_API_URL=http://localhost:5000/api
```

For production on Vercel, set this to your Render backend URL:
```env
VITE_API_URL=https://metroappliances-backend.onrender.com/api
```

All Vite environment variables must be prefixed with `VITE_` to be accessible in React code via `import.meta.env.VITE_API_URL`.

---

## Project Structure

```
(repo root)
├── vite.config.js            # Vite configuration — build, proxy, aliases
├── package.json
├── index.html                # HTML shell (SPA entry point)
├── vercel.json               # Vercel SPA routing config (rewrites /* → /index.html)
│
└── src/
    ├── main.jsx              # App bootstrap — Redux Provider, ErrorBoundary, Router
    ├── App.jsx               # All route definitions (lazy imports for every page)
    │
    ├── components/
    │   ├── layout/           # Top-level UI wrappers
    │   │   ├── Navbar.jsx    # Customer storefront navbar
    │   │   ├── Footer.jsx    # Storefront footer
    │   │   └── AdminLayout.jsx  # Admin panel sidebar + header shell
    │   │
    │   ├── ui/               # Generic single-purpose components
    │   │   ├── ErrorBoundary.jsx   # Catches React render errors gracefully
    │   │   ├── ImageUploader.jsx   # Cloudinary image upload widget
    │   │   ├── Skeleton.jsx        # Loading placeholder animations
    │   │   ├── ConfirmModal.jsx    # Reusable delete/action confirmation dialog
    │   │   └── ...
    │   │
    │   └── shared/           # Domain-agnostic complex components
    │       ├── DataTable.jsx       # Sortable, filterable, paginated table
    │       ├── Pagination.jsx      # Page number controls
    │       ├── StatCard.jsx        # KPI metric card with trend indicator
    │       ├── Modal.jsx           # Generic modal wrapper
    │       ├── StatusBadge.jsx     # Coloured status pill
    │       ├── ExportButton.jsx    # CSV / PDF export trigger
    │       └── ...
    │
    ├── hooks/                # Custom React hooks
    │   ├── usePermissions.js     # Check current user's RBAC role
    │   ├── usePagination.js      # Page/limit state + query params
    │   ├── useExport.js          # Trigger CSV/PDF exports
    │   ├── useDebounce.js        # Debounce search input
    │   ├── useSocket.js          # Connect to Socket.IO and subscribe to events
    │   └── ...
    │
    ├── pages/
    │   ├── (storefront)/     # Customer-facing pages (no prefix in route)
    │   │   ├── HomePage.jsx
    │   │   ├── ProductListPage.jsx
    │   │   ├── ProductDetailPage.jsx
    │   │   ├── CartPage.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   ├── OrdersPage.jsx
    │   │   ├── OrderDetailPage.jsx
    │   │   └── ProfilePage.jsx
    │   │
    │   ├── admin/            # 432 admin panel pages — all lazy-loaded
    │   │   ├── DashboardPage.jsx
    │   │   ├── products/     # Product management
    │   │   ├── orders/       # Order management
    │   │   ├── users/        # User management
    │   │   ├── inventory/    # Inventory management
    │   │   ├── procurement/  # Purchase orders, vendors
    │   │   ├── warehouse/    # Warehouse, bins, IoT
    │   │   ├── manufacturing/ # BOM, work orders, MRP, MES
    │   │   ├── finance/      # GL, AP, AR, tax, banking, CFO
    │   │   ├── hrms/         # Employees, attendance, payroll, recruitment
    │   │   ├── service/      # Tickets, technicians, installation
    │   │   ├── projects/     # Project management, PPM, PMO
    │   │   ├── workflow/     # Workflow builder and instances
    │   │   ├── documents/    # DMS and knowledge base
    │   │   ├── bi-exec/      # BI dashboards, KPI, reports
    │   │   ├── ai/           # AI forecasting, anomaly detection
    │   │   ├── ai-copilot/   # AI copilot interface
    │   │   └── marketing/    # Campaigns, promotions, notifications
    │   │
    │   ├── dealer/           # Dealer B2B portal
    │   │   ├── DealerLoginPage.jsx
    │   │   ├── DealerDashboard.jsx
    │   │   ├── DealerCatalogPage.jsx
    │   │   ├── DealerCartPage.jsx
    │   │   ├── DealerOrdersPage.jsx
    │   │   ├── DealerInvoicesPage.jsx
    │   │   └── DealerWalletPage.jsx
    │   │
    │   ├── agent/            # Sales agent portal
    │   │   ├── AgentLoginPage.jsx
    │   │   ├── AgentDashboard.jsx
    │   │   ├── LeadsPage.jsx
    │   │   ├── TargetsPage.jsx
    │   │   └── CommissionsPage.jsx
    │   │
    │   └── employee/         # Employee self-service (ESS) portal
    │       ├── EmployeeLoginPage.jsx
    │       ├── EmployeeDashboard.jsx
    │       ├── PayslipsPage.jsx
    │       ├── LeaveRequestPage.jsx
    │       ├── AttendancePage.jsx
    │       └── ProfilePage.jsx
    │
    ├── redux/
    │   ├── store.js          # Redux store configuration
    │   └── slices/           # One slice per domain
    │       ├── authSlice.js          # Customer + admin auth state
    │       ├── dealerAuthSlice.js    # Dealer auth state
    │       ├── agentAuthSlice.js     # Sales agent auth state
    │       ├── employeeAuthSlice.js  # Employee ESS auth state
    │       ├── cartSlice.js          # Shopping cart state
    │       ├── productSlice.js       # Product list cache
    │       ├── orderSlice.js         # Customer orders
    │       └── notificationSlice.js  # In-app notifications
    │
    └── services/             # All API calls — grouped by portal/domain
        ├── api.js            # Customer storefront + admin API calls
        ├── dealerAPI.js      # Dealer portal API calls
        ├── agentAPI.js       # Sales agent API calls
        ├── employeeSelfServiceAPI.js  # ESS API calls
        ├── copilotAPI.js     # AI Copilot API calls
        ├── portfolioAPI.js   # PPM portfolio API calls
        ├── projectAPI.js     # Project management API calls
        ├── pmoAPI.js         # PMO governance API calls
        ├── workflowAPI.js    # BPM workflow API calls
        ├── documentAPI.js    # DMS API calls
        ├── biAPI.js          # BI dashboard API calls
        ├── aiAPI.js          # AI forecasting API calls
        ├── formatters.js     # Currency, date, phone number formatters
        └── exportService.js  # CSV and PDF export utilities
```

---

## Portals & Routing

All routes are defined in `src/App.jsx`. Pages are lazy-loaded with React's `lazy()` + `Suspense`:

```jsx
// Example of how pages are imported
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const AdminDashboard  = lazy(() => import('./pages/admin/DashboardPage'));
const DealerLogin     = lazy(() => import('./pages/dealer/DealerLoginPage'));
```

### Route structure

```
/                          → HomePage (storefront)
/products                  → ProductListPage
/products/:id              → ProductDetailPage
/cart                      → CartPage
/checkout                  → CheckoutPage [auth required]
/orders                    → OrdersPage [auth required]
/orders/:id                → OrderDetailPage [auth required]
/profile                   → ProfilePage [auth required]
/login                     → LoginPage
/register                  → RegisterPage

/admin                     → redirect → /admin/dashboard
/admin/dashboard           → AdminDashboardPage [admin required]
/admin/products            → AdminProductsPage [admin required]
/admin/orders              → AdminOrdersPage [admin required]
/admin/users               → AdminUsersPage [admin required]
/admin/...                 → (432 more pages, all lazy-loaded)

/dealer/login              → DealerLoginPage
/dealer/dashboard          → DealerDashboard [dealer auth]
/dealer/...                → (more dealer pages)

/agent/login               → AgentLoginPage
/agent/dashboard           → AgentDashboard [agent auth]

/employee/login            → EmployeeLoginPage
/employee/dashboard        → EmployeeDashboard [employee auth]
```

### How auth guards work

Each portal has a private route wrapper that checks its Redux slice:

```jsx
// Customer/Admin guard (checks authSlice)
<PrivateRoute>
  <OrdersPage />
</PrivateRoute>

// Admin-only guard (checks role)
<AdminRoute>
  <AdminDashboard />
</AdminRoute>

// Dealer guard (checks dealerAuthSlice)
<DealerRoute>
  <DealerDashboard />
</DealerRoute>
```

If the user is not authenticated, they are redirected to the appropriate login page.

---

## State Management (Redux)

The app uses **Redux Toolkit** with one slice per domain.

### Auth slices

Each portal has its own slice that stores the JWT token and user data:

```js
// Reading the current user
import { useSelector } from 'react-redux';
const { user, token } = useSelector(state => state.auth);          // customer/admin
const { dealer }      = useSelector(state => state.dealerAuth);    // dealer
const { agent }       = useSelector(state => state.agentAuth);     // sales agent
const { employee }    = useSelector(state => state.employeeAuth);  // ESS
```

### Cart slice

```js
import { addToCart, removeFromCart, clearCart } from '../redux/slices/cartSlice';
dispatch(addToCart({ product, quantity: 1 }));
```

### Persisted state

Auth tokens are persisted to `localStorage` automatically by the auth slices so users stay logged in after page refresh.

---

## API Services Layer

All HTTP calls go through the `services/` files, which use **axios** with a pre-configured base URL (`import.meta.env.VITE_API_URL`).

```js
// services/api.js — example usage in a component
import { getProducts, placeOrder } from '../services/api';

// In a React component:
const products = await getProducts({ category: 'refrigerators', page: 1 });
const order    = await placeOrder({ items: cart, address: shippingAddress });
```

### Adding a new API call

1. Open the relevant service file (e.g., `services/api.js` for admin calls)
2. Add an exported async function:

```js
export const getSupplierFeedbacks = async (params) => {
  const { data } = await axios.get('/admin/supplier-feedback', { params });
  return data;
};

export const createSupplierFeedback = async (payload) => {
  const { data } = await axios.post('/admin/supplier-feedback', payload);
  return data;
};
```

3. Import and call it in your page/component.

---

## Component Library

### `DataTable` — the most-used shared component

Used on every list page in the admin panel. Handles sorting, pagination, and empty states:

```jsx
import DataTable from '../../components/shared/DataTable';

<DataTable
  columns={[
    { key: 'name', label: 'Supplier Name', sortable: true },
    { key: 'rating', label: 'Rating' },
    { key: 'createdAt', label: 'Date', render: (val) => formatDate(val) },
  ]}
  data={feedbacks}
  loading={isLoading}
  emptyMessage="No feedback records found"
/>
```

### `StatCard` — KPI metric cards

Used on all dashboard pages:

```jsx
import StatCard from '../../components/shared/StatCard';

<StatCard
  title="Total Revenue"
  value={formatCurrency(totalRevenue)}
  trend="+12%"
  trendUp={true}
  icon="currency"
/>
```

### `Modal` — generic dialog

```jsx
import Modal from '../../components/shared/Modal';

<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Confirm Action">
  <p>Are you sure you want to delete this item?</p>
  <button onClick={handleDelete}>Delete</button>
</Modal>
```

### `StatusBadge` — coloured status pill

```jsx
import StatusBadge from '../../components/shared/StatusBadge';

<StatusBadge status="approved" />   // renders green pill
<StatusBadge status="pending" />    // renders yellow pill
<StatusBadge status="rejected" />   // renders red pill
```

---

## Hooks

### `usePermissions` — RBAC role checks

```js
import usePermissions from '../../hooks/usePermissions';
const { isAdmin, isSuperAdmin, can } = usePermissions();

if (!isAdmin) return <AccessDenied />;
```

### `usePagination` — pagination state

```js
import usePagination from '../../hooks/usePagination';
const { page, limit, setPage, queryParams } = usePagination({ defaultLimit: 20 });
// Pass queryParams to API calls: getProducts({ ...queryParams, search })
```

### `useDebounce` — search input debounce

```js
import useDebounce from '../../hooks/useDebounce';
const debouncedSearch = useDebounce(searchInput, 400);
// Use debouncedSearch in API calls to avoid firing on every keystroke
```

### `useSocket` — real-time Socket.IO

```js
import useSocket from '../../hooks/useSocket';
const { socket } = useSocket();

useEffect(() => {
  socket.on('orderStatusChanged', (data) => {
    // Update order in local state
  });
  return () => socket.off('orderStatusChanged');
}, [socket]);
```

### `useExport` — CSV / PDF export

```js
import useExport from '../../hooks/useExport';
const { exportCSV, exportPDF } = useExport();

<button onClick={() => exportCSV(data, 'orders-export')}>Export CSV</button>
```

---

## Styling & Theme

The app uses **plain CSS** and **inline styles** — no CSS framework. The design system constants are:

| Token | Value | Usage |
|---|---|---|
| Primary orange | `#FF7A00` | Buttons, active states, links |
| Gold accent | `#D4AF37` | Premium badges, highlights |
| Dark background | `#1A1A2E` | Admin sidebar |
| Card background | `#FFFFFF` | Content cards |
| Font | `Poppins` (Google Fonts) | All text |

Admin pages use `AdminLayout` as their wrapper, which provides the sidebar and top header automatically.

---

## Build & Deploy (Vercel)

### Production build

```bash
# Always run from the repo root (where vite.config.js is)
npx vite build
# Output goes to dist/
```

Build output breakdown:
- **432 lazy-loaded admin pages** — each is a separate chunk (~6–50 kB)
- **Main vendor bundle**: ~417 kB (104 kB gzip)
- **Recharts** (charts): ~273 kB (83 kB gzip) — only loaded on chart pages

### Deploying to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Vercel auto-detects Vite — confirm these settings:
   - **Build Command**: `npx vite build`
   - **Output Directory**: `dist`
4. Add environment variable: `VITE_API_URL` = your Render backend URL
5. Deploy

Vercel redeploys automatically on every push to `master`.

### SPA routing on Vercel

The `vercel.json` file at the repo root configures all paths to serve `index.html` (required for client-side routing):

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Adding New Pages

### Example: Add an admin "Supplier Feedback" page

**Step 1 — Create the page component**

```jsx
// src/pages/admin/procurement/SupplierFeedbackPage.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/layout/AdminLayout';
import DataTable from '../../../components/shared/DataTable';
import { getSupplierFeedbacks } from '../../../services/api';

export default function SupplierFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    getSupplierFeedbacks().then(res => {
      setFeedbacks(res.data);
      setLoading(false);
    });
  }, []);

  const columns = [
    { key: 'supplier.name', label: 'Supplier' },
    { key: 'rating', label: 'Rating' },
    { key: 'comment', label: 'Comment' },
  ];

  return (
    <AdminLayout>
      <h1>Supplier Feedback</h1>
      <DataTable columns={columns} data={feedbacks} loading={loading} />
    </AdminLayout>
  );
}
```

**Step 2 — Register the route in `App.jsx`**

```jsx
// In App.jsx, add a lazy import at the top:
const SupplierFeedbackPage = lazy(() => import('./pages/admin/procurement/SupplierFeedbackPage'));

// Then add the route inside <Routes>:
<Route path="/admin/procurement/supplier-feedback" element={
  <AdminRoute><SupplierFeedbackPage /></AdminRoute>
} />
```

**Step 3 — Add a sidebar link** (optional)

Find the admin sidebar component and add a `<NavLink to="/admin/procurement/supplier-feedback">` entry.

---

## Testing

The frontend does not currently have a Jest/Vitest unit test suite. Manual testing checklist before each deploy:

- [ ] Customer can register, login, browse products, add to cart, checkout with Stripe test card `4242 4242 4242 4242`
- [ ] Admin can login, view orders, update order status, add a product with an image
- [ ] Dealer can login, browse catalog, place a B2B order
- [ ] Employee can login to ESS portal, view payslips, submit a leave request
- [ ] Admin panel pages load without console errors (spot-check: dashboard, inventory, payroll)

---

## Known Issues

| Issue | Notes |
|---|---|
| No frontend unit test suite | Manual testing only. Adding Vitest planned for v1.1. |
| `frontend/frontend/` subfolder | This is an old, incomplete copy of the source — do not edit it. The live source is in `src/`. |

---

## License

Proprietary — Metro Appliances. All rights reserved.
