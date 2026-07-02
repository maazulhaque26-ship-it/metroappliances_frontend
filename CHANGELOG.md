# Changelog

All notable changes to the Metro Appliances ERP frontend are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [1.1.0] — 2026-07-02

### Added — Enterprise UX Certification Suite (Sprints UX-1D through UX-1R)

**Admin Panel — Header & Navigation (UX-1D)**
- New `AdminHeader` component: workspace badge, breadcrumb, page-header strip, quick actions, notification shell, user menu, live date/time clock.

**Admin Panel — Command Palette (UX-1E)**
- `AdminNavConfig.js` + `SearchDialog` with 280-page index, fuzzy+grouped results, CTRL+K activation, localStorage recent pages/searches.

**Admin Panel — My Workspace Dashboard (UX-1F)**
- SAP Fiori-style landing dashboard: Hero, KPIs, MyWork, Continue, Favorites, Quick Actions, Activity, Announcements, Schedule (11 new components).

**Admin Panel — Notification Center (UX-1G)**
- 480px slide-over notification panel: 14 categories, 4 priorities, mark-read/archive/dismiss, Action Center tab, filters+search, 14 seeded items.

**Admin Panel — Personalization (UX-1H)**
- Favorites panel, shortcut grid, drag-and-drop FavoriteModules, PersonalizationDrawer (layout/theme/resets).

**Admin Panel — Role Registry & Navigation Activation (UX-1I-B/C)**
- 31 roles, 5 registries, RegistryProvider + 6 hooks, domain rail, dev role switcher.

**Admin Panel — Role Landing Dashboards & Workspace Switching (UX-1I-D/E)**
- Shell/Content pattern, RoleModuleLinks, WorkspaceSwitcher + PreviewBanner (18 workspaces, amber preview banner).

**Portal UX Upgrades (UX-1K/L/M/N)**
- Dealer Portal: responsive sidebar, PortalKPICard, Quick Actions, DealerSearch, DealerNotificationDrawer.
- ESS Portal: ESSSearch, ESSNotificationDrawer, responsive sidebar.
- Technician & Engineer Portals: TechSearch/EngineerSearch wrappers, responsive sidebars, mobile sticky action bars.
- Supplier Portal: SupplierSearch, SupplierNotificationDrawer, real Invoices/Notifications/Documents pages.

**Accessibility Certification — WCAG 2.1 AA (UX-1P-A/B/C)**
- 12 shared components certified: ConfirmDialog focus trap, DataTable keyboard navigation, Pagination landmark, SearchToolbar focus ring, LoadingState role=status, and more.
- All portal dialogs/drawers: focus trap + restore, role=dialog, Tab cycle.
- All login forms: htmlFor/id, autoComplete, aria-invalid, role=alert.

**Mobile & Tablet Certification (UX-1Q)**
- `viewport-fit=cover` for iOS safe area insets; CSS vars `--sat/--sab/--sal/--sar`.
- `.input` raised to 16px (prevents iOS Safari auto-zoom).
- `.touch-target` utility (44×44px) applied to all hamburger/close/bell/profile buttons across 8 portals.
- AgentLayout sidebar always-visible critical bug fixed (inline style overriding Tailwind `hidden`).

**Design System Consolidation (UX-1R)**
- New `PortalSearchPalette` shared primitive: parametric search dialog for portal pages.
- New `PortalNotificationDrawer` shared primitive: parametric notification slide-over.
- `PortalKPICard` added to barrel export (`shared/index.js`).
- CSS design tokens applied to `Pagination`, `FilterToolbar`, `SearchToolbar`, `MetricCard`.
- `SearchToolbar` width moved from input to container for responsive override support.

### Changed
- `package.json` version bumped to `1.1.0`.

### Verified
- `npm run build` — 0 errors, 619 JS chunks, 7 MB dist.
- `vitest run` — 22/22 tests passing.
- Frontend CI GREEN.
- Vercel production deployment verified.

---

## [1.0.1] — 2026-06-28

### Fixed
- Renamed `postcss.config.js` → `postcss.config.cjs` so PostCSS loads under
  the ESM package (`"type": "module"`), resolving the CI build failure
  `ReferenceError: module is not defined in ES module scope`.
- Restored the correct frontend `package.json` and `package-lock.json`
  (React 18 / Vite / Vitest) after a monorepo merge had replaced them with the
  backend's package manifest.
- Removed the `backend-ci.yml` workflow that was incorrectly running MongoDB +
  Jest backend tests inside the frontend CI pipeline.

### Removed (repository hygiene — no functional change)
- Purged the entire backend source tree that a monorepo merge had committed
  into the frontend repository: nested `backend/` and `frontend/` directories,
  root-level backend `utils/`, `render.yaml`, and ~700 top-level backend
  controller/model/route files. None of these were referenced by the frontend
  build or runtime.

### Verified
- `npm ci` + `npm run build` succeed (0 errors).
- `vitest run` — 22 tests pass.
- Frontend CI green.

## [1.0.0] — 2026-06-28

### Added
- Initial production release of the Metro Appliances ERP frontend.
- React 18 SPA with Vite build, Redux Toolkit state, React Router 6.
- Customer storefront, admin panel (432 lazy-loaded pages), and dealer,
  sales-agent, and employee self-service portals.
- Code-split bundles (400+ chunks), lazy loading, Socket.IO real-time updates.
- Security headers and CSP enforced via `vercel.json`.

See the backend repository's `CHANGELOG.md` for the full 44-sprint platform
delivery history.
