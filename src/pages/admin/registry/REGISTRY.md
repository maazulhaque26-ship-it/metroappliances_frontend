# Enterprise Role Registry — Developer Guide

> Sprint UX-1I-B | Phase 1 — Foundation (metadata only, no enforcement)

## What this is

A read-only metadata layer that describes the 31 enterprise roles, their landing pages, workspace configurations, navigation scopes, search scopes, and permission levels.  Nothing in this directory touches the sidebar, filters pages, or enforces access — that is deferred to future sprints.

## Directory structure

```
src/pages/admin/registry/
├── index.js               — barrel export (tree-shakable named exports only)
├── RoleRegistry.js        — 31 role definitions
├── LandingRegistry.js     — roleKey → existing route path
├── NavigationRegistry.js  — domain/group scope per navigationKey
├── WorkspaceRegistry.js   — widget lists and quick-actions per workspaceKey
├── SearchScopeRegistry.js — CTRL+K scope constraints per searchScopeKey
├── PermissionRegistry.js  — 8 permission levels + per-module maps
├── RegistryProvider.jsx   — React Context + hooks
└── REGISTRY.md            — this file
```

## Quick start

```jsx
// Option A — hooks with explicit roleId (no provider needed)
import { useRole, useWorkspace, usePermissions } from '../registry';

function MyComponent() {
  const role      = useRole('finance');
  const workspace = useWorkspace('finance');
  const { can }   = usePermissions('finance');

  return <div>{role.displayName} — {workspace.title}</div>;
}

// Option B — wrap a sub-tree and omit roleId from every hook
import { RegistryProvider, useRole } from '../registry';

function App() {
  return (
    <RegistryProvider roleId="finance">
      <InnerComponent />
    </RegistryProvider>
  );
}

function InnerComponent() {
  const role = useRole(); // reads roleId from context
  return <div>{role.displayName}</div>;
}
```

## Roles (31 total)

| id | displayName | tier | portalType |
|----|-------------|------|------------|
| super_admin | Super Administrator | system | admin |
| admin | Administrator | system | admin |
| executive | Executive | leadership | admin |
| finance | Finance Manager | functional | admin |
| accounts | Accounts | functional | admin |
| sales | Sales Manager | functional | admin |
| crm | CRM Manager | functional | admin |
| procurement | Procurement Manager | functional | admin |
| warehouse | Warehouse Manager | functional | admin |
| inventory | Inventory Manager | functional | admin |
| manufacturing | Manufacturing Manager | functional | admin |
| quality | Quality Manager | functional | admin |
| service | Service Manager | functional | admin |
| projects | Project Manager | functional | admin |
| portfolio | Portfolio Manager | functional | admin |
| hr | HR Manager | functional | admin |
| recruitment | Recruitment Manager | functional | admin |
| payroll | Payroll Manager | functional | admin |
| business_analyst | Business Analyst | functional | admin |
| ai_user | AI User | functional | admin |
| bi_user | BI User | functional | admin |
| support | Support Agent | functional | admin |
| auditor | Auditor | compliance | admin |
| system_administrator | System Administrator | system | admin |
| employee | Employee | portal | employee |
| dealer | Dealer | portal | dealer |
| retailer | Retailer | portal | dealer |
| supplier | Supplier | portal | supplier |
| customer | Customer | portal | customer |
| installation_engineer | Installation Engineer | portal | engineer |
| technician | Technician | portal | technician |

## Permission levels (8, ordered least → most privileged)

`none` → `view` → `comment` → `create` → `edit` → `approve` → `manage` → `superadmin`

## Keys schema

Each role object contains these pointer keys:

| Field | Points to |
|-------|-----------|
| `landingKey` | `LANDING_PATHS[key]` in LandingRegistry |
| `workspaceKey` | `WORKSPACE_CONFIGS[key]` in WorkspaceRegistry |
| `navigationKey` | `NAVIGATION_SCOPES[key]` in NavigationRegistry |
| `searchScopeKey` | `SEARCH_SCOPES[key]` in SearchScopeRegistry |
| `permissionKey` | `PERMISSION_MAPS[key]` in PermissionRegistry |

## What NOT to do

- Do **not** import from this registry inside existing UX components (Header, Sidebar, Workspace, Search, Dashboard) in Phase 1.
- Do **not** use these registries to conditionally hide UI elements until a dedicated UX sprint wires the enforcement layer.
- Do **not** duplicate nav group labels or domain IDs — read them from `AdminNavConfig.js` and `AdminDomainConfig.js`.

## Adding a new role

1. Add a role object to `ROLES` in `RoleRegistry.js`.
2. If it needs a new landing path, add it to `LANDING_PATHS` in `LandingRegistry.js`.
3. Add its `navigationKey` entry in `NavigationRegistry.js` (`NAVIGATION_SCOPES`).
4. Add its `workspaceKey` entry in `WorkspaceRegistry.js` (`WORKSPACE_CONFIGS`).
5. Add its `searchScopeKey` entry in `SearchScopeRegistry.js` (`SEARCH_SCOPES`).
6. Add its `permissionKey` entry in `PermissionRegistry.js` (`PERMISSION_MAPS`).
7. No other files need to change.
