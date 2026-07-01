// Registry barrel — import only what you need for tree-shaking.

export { ROLES, ADMIN_ROLES, PORTAL_ROLES, getRoleById }          from './RoleRegistry';
export { LANDING_PATHS, getLandingPath }                           from './LandingRegistry';
export { ALL_DOMAINS, NAVIGATION_SCOPES, getNavigationScope }      from './NavigationRegistry';
export { WORKSPACE_CONFIGS, getWorkspaceConfig }                   from './WorkspaceRegistry';
export { SEARCH_SCOPES, getSearchScope }                           from './SearchScopeRegistry';
export {
  PERMISSION_LEVELS, PERMISSION_MAPS,
  getPermissionMap, getModulePermission,
}                                                                   from './PermissionRegistry';
export {
  RegistryProvider,
  useRole, useLanding, useWorkspace,
  useNavigationScope, useSearchScope, usePermissions,
}                                                                   from './RegistryProvider';
