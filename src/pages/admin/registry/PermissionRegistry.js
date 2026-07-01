/**
 * PermissionRegistry — defines 8 named permission levels and a per-module
 * permission map per permissionKey.
 *
 * PHASE 1 ONLY: These are metadata definitions, not enforcement.
 * No runtime checks are wired from this file.  Enforcement is deferred to
 * a future sprint.
 */

/** 8 canonical permission levels, ordered least → most privileged. */
export const PERMISSION_LEVELS = {
  NONE:       'none',
  VIEW:       'view',
  COMMENT:    'comment',
  CREATE:     'create',
  EDIT:       'edit',
  APPROVE:    'approve',
  MANAGE:     'manage',
  SUPERADMIN: 'superadmin',
};

const { NONE, VIEW, CREATE, EDIT, APPROVE, MANAGE, SUPERADMIN } = PERMISSION_LEVELS;

/**
 * Module IDs that permission maps reference.
 * Keeps the permission maps below terse.
 */
const M = {
  ORDERS:       'orders',
  PRODUCTS:     'products',
  CUSTOMERS:    'customers',
  FINANCE:      'finance',
  AP:           'accounts_payable',
  AR:           'accounts_receivable',
  TAX:          'tax',
  BANKING:      'banking',
  CFO:          'cfo',
  HR:           'hr',
  PAYROLL:      'payroll',
  RECRUITMENT:  'recruitment',
  WAREHOUSE:    'warehouse',
  INVENTORY:    'inventory',
  PROCUREMENT:  'procurement',
  LOGISTICS:    'logistics',
  MANUFACTURING:'manufacturing',
  QMS:          'qms',
  EAM:          'eam',
  SERVICE:      'service',
  INSTALLATION: 'installation',
  PROJECTS:     'projects',
  PORTFOLIO:    'portfolio',
  PMO:          'pmo',
  WORKFLOW:     'workflow',
  DOCUMENTS:    'documents',
  BI:           'bi',
  AI:           'ai',
  SETTINGS:     'settings',
  AUDIT:        'audit',
  USERS:        'users',
  B2B:          'b2b',
  CRM:          'crm',
};

/**
 * Maps permissionKey → { [moduleId]: permissionLevel }
 * Omitted modules default to NONE.
 */
export const PERMISSION_MAPS = {
  superadmin: Object.fromEntries(Object.values(M).map(m => [m, SUPERADMIN])),

  admin: Object.fromEntries(Object.values(M).map(m => [m, MANAGE])),

  executive: {
    [M.ORDERS]: VIEW, [M.PRODUCTS]: VIEW, [M.CUSTOMERS]: VIEW,
    [M.FINANCE]: VIEW, [M.CFO]: VIEW, [M.HR]: VIEW, [M.BI]: VIEW,
    [M.AI]: VIEW, [M.PROJECTS]: VIEW, [M.PORTFOLIO]: VIEW,
    [M.MANUFACTURING]: VIEW, [M.WAREHOUSE]: VIEW,
  },

  finance: {
    [M.FINANCE]: MANAGE, [M.AP]: MANAGE, [M.AR]: MANAGE,
    [M.TAX]: MANAGE, [M.BANKING]: MANAGE, [M.CFO]: VIEW,
    [M.ORDERS]: VIEW,
  },

  accounts: {
    [M.AP]: EDIT, [M.AR]: EDIT, [M.FINANCE]: VIEW,
    [M.ORDERS]: VIEW,
  },

  sales: {
    [M.ORDERS]: MANAGE, [M.PRODUCTS]: EDIT, [M.CUSTOMERS]: MANAGE,
    [M.B2B]: VIEW, [M.CRM]: VIEW,
  },

  crm: {
    [M.CRM]: MANAGE, [M.CUSTOMERS]: MANAGE, [M.ORDERS]: VIEW,
    [M.B2B]: VIEW,
  },

  procurement: {
    [M.PROCUREMENT]: MANAGE, [M.INVENTORY]: VIEW,
    [M.WAREHOUSE]: VIEW, [M.LOGISTICS]: VIEW,
  },

  warehouse: {
    [M.WAREHOUSE]: MANAGE, [M.INVENTORY]: EDIT,
    [M.LOGISTICS]: EDIT, [M.PROCUREMENT]: VIEW,
  },

  inventory: {
    [M.INVENTORY]: MANAGE, [M.WAREHOUSE]: VIEW,
    [M.PROCUREMENT]: VIEW,
  },

  manufacturing: {
    [M.MANUFACTURING]: MANAGE, [M.QMS]: EDIT, [M.EAM]: EDIT,
    [M.INVENTORY]: VIEW, [M.PROCUREMENT]: VIEW,
  },

  quality: {
    [M.QMS]: MANAGE, [M.MANUFACTURING]: VIEW,
  },

  service: {
    [M.SERVICE]: MANAGE, [M.INSTALLATION]: VIEW,
    [M.CUSTOMERS]: VIEW, [M.ORDERS]: VIEW,
  },

  projects: {
    [M.PROJECTS]: MANAGE, [M.WORKFLOW]: EDIT,
    [M.DOCUMENTS]: EDIT, [M.PMO]: VIEW,
  },

  portfolio: {
    [M.PORTFOLIO]: MANAGE, [M.PROJECTS]: VIEW,
    [M.PMO]: VIEW,
  },

  hr: {
    [M.HR]: MANAGE, [M.PAYROLL]: VIEW, [M.RECRUITMENT]: MANAGE,
  },

  recruitment: {
    [M.RECRUITMENT]: MANAGE, [M.HR]: VIEW,
  },

  payroll: {
    [M.PAYROLL]: MANAGE, [M.HR]: VIEW, [M.TAX]: VIEW,
  },

  analyst: {
    [M.BI]: MANAGE, [M.AI]: VIEW,
    [M.FINANCE]: VIEW, [M.ORDERS]: VIEW, [M.HR]: VIEW,
  },

  ai_user: {
    [M.AI]: MANAGE, [M.BI]: VIEW,
  },

  bi_user: {
    [M.BI]: MANAGE, [M.AI]: VIEW,
  },

  support: {
    [M.SERVICE]: EDIT, [M.CUSTOMERS]: VIEW,
    [M.ORDERS]: VIEW, [M.INSTALLATION]: VIEW,
  },

  auditor: {
    [M.AUDIT]: VIEW,
    ...Object.fromEntries(Object.values(M).map(m => [m, VIEW])),
  },

  sysadmin: {
    [M.SETTINGS]: MANAGE, [M.USERS]: MANAGE,
    [M.AUDIT]: VIEW,
  },

  employee:   { [M.HR]: VIEW },
  dealer:     { [M.B2B]: VIEW, [M.ORDERS]: VIEW },
  supplier:   { [M.PROCUREMENT]: VIEW },
  customer:   { [M.ORDERS]: VIEW },
  engineer:   { [M.INSTALLATION]: EDIT },
  technician: { [M.SERVICE]: EDIT },
};

/** Returns the permission map for a given permissionKey. */
export function getPermissionMap(permissionKey) {
  return PERMISSION_MAPS[permissionKey] ?? {};
}

/** Returns the permission level a role has for a specific module. */
export function getModulePermission(permissionKey, moduleId) {
  return PERMISSION_MAPS[permissionKey]?.[moduleId] ?? NONE;
}
