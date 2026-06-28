# Changelog

All notable changes to the Metro Appliances ERP frontend are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

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
