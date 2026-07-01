/**
 * RegistryProvider — React Context + custom hooks for the Role Registry.
 *
 * Provides read-only access to registry data based on a roleId string.
 * Does NOT modify any existing context, Redux state, or component.
 * Consumers opt in via useRole() / useWorkspace() / etc.
 *
 * Usage:
 *   // Wrap a sub-tree (or the whole app) if you need registry hooks:
 *   <RegistryProvider roleId="admin">
 *     <App />
 *   </RegistryProvider>
 *
 *   // Or call hooks directly with an explicit roleId (no wrapping needed):
 *   const role = useRole('finance');
 */

import React, { createContext, useContext, useMemo } from 'react';
import { getRoleById }          from './RoleRegistry';
import { getLandingPath }       from './LandingRegistry';
import { getNavigationScope }   from './NavigationRegistry';
import { getWorkspaceConfig }   from './WorkspaceRegistry';
import { getSearchScope }       from './SearchScopeRegistry';
import { getPermissionMap, getModulePermission } from './PermissionRegistry';

const RegistryContext = createContext(null);

/**
 * Optional provider — lets deeply nested components call hooks without
 * passing roleId every time.  When not wrapped, pass roleId to each hook.
 */
export function RegistryProvider({ roleId, children }) {
  const value = useMemo(() => ({ roleId }), [roleId]);
  return (
    <RegistryContext.Provider value={value}>
      {children}
    </RegistryContext.Provider>
  );
}

function resolveRoleId(hookRoleId) {
  const ctx = useContext(RegistryContext);
  return hookRoleId ?? ctx?.roleId ?? 'admin';
}

/**
 * Returns the full role definition for roleId.
 * Falls back to the 'admin' role if roleId is not found.
 */
export function useRole(roleId) {
  const id = resolveRoleId(roleId);
  return useMemo(() => getRoleById(id) ?? getRoleById('admin'), [id]);
}

/**
 * Returns { path } for the role's landing page.
 */
export function useLanding(roleId) {
  const role = useRole(roleId);
  return useMemo(() => ({
    path: getLandingPath(role.landingKey),
    landingKey: role.landingKey,
  }), [role]);
}

/**
 * Returns the workspace config (title, description, widgets, quickActions, layout).
 */
export function useWorkspace(roleId) {
  const role = useRole(roleId);
  return useMemo(() => getWorkspaceConfig(role.workspaceKey), [role]);
}

/**
 * Returns the navigation scope (domains[], groups[]).
 */
export function useNavigationScope(roleId) {
  const role = useRole(roleId);
  return useMemo(() => getNavigationScope(role.navigationKey), [role]);
}

/**
 * Returns the search scope (label, placeholder, domains[], allowEnterpriseToggle).
 */
export function useSearchScope(roleId) {
  const role = useRole(roleId);
  return useMemo(() => getSearchScope(role.searchScopeKey), [role]);
}

/**
 * Returns the full permission map and a helper to check a specific module.
 */
export function usePermissions(roleId) {
  const role = useRole(roleId);
  const map = useMemo(() => getPermissionMap(role.permissionKey), [role]);
  return {
    permissionMap: map,
    can: (moduleId) => getModulePermission(role.permissionKey, moduleId),
  };
}
