/**
 * SearchScopeRegistry — defines what the CTRL+K search palette should include
 * per role's searchScopeKey.
 *
 * Domain IDs match AdminDomainConfig.js.  The actual SEARCH_INDEX built in
 * SearchRegistry.js is not duplicated here — this file describes scope
 * constraints only.  Filtering is deferred to a future sprint.
 */

export const SEARCH_SCOPES = {
  /** No restrictions — full SEARCH_INDEX. */
  enterprise: {
    label: 'Enterprise Search',
    placeholder: 'Search anything across the platform…',
    domains: [],
    allowEnterpriseToggle: false,
  },

  analytics: {
    label: 'Analytics Search',
    placeholder: 'Search dashboards, reports, KPIs…',
    domains: ['intelligence'],
    allowEnterpriseToggle: true,
  },

  finance: {
    label: 'Finance Search',
    placeholder: 'Search invoices, journals, payments…',
    domains: ['finance'],
    allowEnterpriseToggle: true,
  },

  commerce: {
    label: 'Commerce Search',
    placeholder: 'Search orders, products, customers…',
    domains: ['commerce', 'b2b'],
    allowEnterpriseToggle: false,
  },

  crm: {
    label: 'CRM Search',
    placeholder: 'Search leads, agents, campaigns…',
    domains: ['crm', 'commerce'],
    allowEnterpriseToggle: false,
  },

  supply_chain: {
    label: 'Supply Chain Search',
    placeholder: 'Search warehouse, inventory, procurement…',
    domains: ['supply-chain'],
    allowEnterpriseToggle: false,
  },

  manufacturing: {
    label: 'Manufacturing Search',
    placeholder: 'Search work orders, BOMs, quality…',
    domains: ['manufacturing'],
    allowEnterpriseToggle: false,
  },

  service: {
    label: 'Service Search',
    placeholder: 'Search tickets, technicians, installations…',
    domains: ['service'],
    allowEnterpriseToggle: false,
  },

  projects: {
    label: 'Projects Search',
    placeholder: 'Search projects, tasks, documents…',
    domains: ['projects'],
    allowEnterpriseToggle: false,
  },

  hr: {
    label: 'HR Search',
    placeholder: 'Search employees, payroll, recruitment…',
    domains: ['hr'],
    allowEnterpriseToggle: false,
  },

  b2b: {
    label: 'B2B Search',
    placeholder: 'Search dealers, orders, pricing…',
    domains: ['b2b'],
    allowEnterpriseToggle: false,
  },

  ess: {
    label: 'ESS Search',
    placeholder: 'Search leave, payslips, attendance…',
    domains: [],
    allowEnterpriseToggle: false,
  },
};

/** Returns the search scope config for a given searchScopeKey. */
export function getSearchScope(searchScopeKey) {
  return SEARCH_SCOPES[searchScopeKey] ?? SEARCH_SCOPES.enterprise;
}
