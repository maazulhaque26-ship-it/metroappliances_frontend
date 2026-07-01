/**
 * NavigationRegistry — domain and nav-group visibility metadata per navigationKey.
 *
 * IMPORTANT: This file contains METADATA ONLY.  It does NOT filter the sidebar,
 * does NOT hide any page, and does NOT enforce access control.  All pages remain
 * accessible via direct URL.  Filtering is deferred to a future UX sprint.
 *
 * Domain IDs come from AdminDomainConfig.js.
 * Group label strings come from AdminNavConfig.js — must be exact matches.
 */

/** Every domain available in the admin panel. */
export const ALL_DOMAINS = [
  'commerce', 'b2b', 'crm', 'supply-chain', 'service',
  'manufacturing', 'finance', 'hr', 'projects', 'intelligence', 'settings',
];

/**
 * Maps navigationKey → { domains: string[], groups: string[] }
 * An empty array means "all" for that field.
 */
export const NAVIGATION_SCOPES = {
  /** Unrestricted — sees everything. */
  full: {
    domains: [],
    groups: [],
  },

  executive: {
    domains: ['intelligence', 'finance', 'hr', 'projects', 'commerce'],
    groups: [
      'Overview', 'BI & Analytics', 'CFO & Executive', 'Finance',
      'Accounts Receivable', 'HRMS', 'Projects', 'Portfolio (PPM)',
      'BI Executive Analytics', 'AI & Forecasting', 'AI Copilot', 'Enterprise',
    ],
  },

  finance: {
    domains: ['finance'],
    groups: [
      'Finance', 'Accounts Payable', 'Accounts Receivable',
      'Tax & Compliance', 'Banking & Treasury', 'CFO & Executive',
    ],
  },

  accounts: {
    domains: ['finance'],
    groups: ['Accounts Payable', 'Accounts Receivable', 'Finance'],
  },

  commerce: {
    domains: ['commerce', 'b2b'],
    groups: ['Overview', 'Catalog', 'Sales', 'Customers', 'Content', 'Marketing', 'Dealers'],
  },

  crm: {
    domains: ['crm', 'commerce'],
    groups: ['Overview', 'CRM', 'Sales', 'Customers', 'Marketing'],
  },

  supply_chain: {
    domains: ['supply-chain'],
    groups: [
      'Warehouse', 'Inventory', 'Procurement', 'Logistics',
      'Barcode & Scanning', 'IoT & Industry 4.0',
    ],
  },

  warehouse: {
    domains: ['supply-chain'],
    groups: ['Warehouse', 'Inventory', 'Barcode & Scanning', 'Logistics'],
  },

  inventory: {
    domains: ['supply-chain'],
    groups: ['Inventory', 'Warehouse', 'Barcode & Scanning'],
  },

  manufacturing: {
    domains: ['manufacturing'],
    groups: ['Manufacturing', 'Production Planning', 'MRP', 'MES', 'QMS', 'EAM'],
  },

  quality: {
    domains: ['manufacturing'],
    groups: ['QMS', 'Manufacturing', 'MES'],
  },

  service: {
    domains: ['service'],
    groups: ['After Sales Service', 'Installation'],
  },

  projects: {
    domains: ['projects'],
    groups: ['Projects', 'BPM & Workflow', 'Document Management', 'PMO Governance'],
  },

  portfolio: {
    domains: ['projects'],
    groups: ['Projects', 'Portfolio (PPM)', 'PMO Governance', 'BPM & Workflow'],
  },

  hr: {
    domains: ['hr'],
    groups: ['HRMS'],
  },

  recruitment: {
    domains: ['hr'],
    groups: ['HRMS'],
  },

  payroll: {
    domains: ['hr'],
    groups: ['HRMS'],
  },

  analytics: {
    domains: ['intelligence'],
    groups: ['BI & Analytics', 'BI Executive Analytics', 'AI & Forecasting', 'Enterprise'],
  },

  ai: {
    domains: ['intelligence'],
    groups: ['AI Copilot', 'AI & Forecasting'],
  },

  bi: {
    domains: ['intelligence'],
    groups: ['BI Executive Analytics', 'BI & Analytics'],
  },

  support: {
    domains: ['service', 'commerce'],
    groups: ['After Sales Service', 'Installation', 'Customers', 'Sales'],
  },

  auditor: {
    domains: [],
    groups: ['Enterprise', 'Settings'],
  },

  sysadmin: {
    domains: ['settings'],
    groups: ['Enterprise', 'Settings'],
  },

  /** External-portal roles — these roles use separate routing trees, not admin nav. */
  employee_ess: { domains: [], groups: [] },
  dealer_portal: { domains: [], groups: [] },
  supplier_portal: { domains: [], groups: [] },
  customer_portal: { domains: [], groups: [] },
  engineer_portal: { domains: [], groups: [] },
  technician_portal: { domains: [], groups: [] },
};

/** Returns the navigation scope for a given navigationKey. */
export function getNavigationScope(navigationKey) {
  return NAVIGATION_SCOPES[navigationKey] ?? NAVIGATION_SCOPES.full;
}
