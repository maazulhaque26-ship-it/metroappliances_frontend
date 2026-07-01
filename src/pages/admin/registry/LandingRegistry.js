/**
 * LandingRegistry — maps landingKey → existing admin route path.
 * All paths must already exist in the router; this file contains no routing logic.
 */

export const LANDING_PATHS = {
  dashboard:         '/admin',
  bi_exec:           '/admin/bi-exec/dashboard',
  finance:           '/admin/finance',
  accounts_receivable: '/admin/accounts-receivable',
  sales_agents:      '/admin/sales-agents',
  procurement:       '/admin/procurement',
  warehouse:         '/admin/warehouse',
  inventory:         '/admin/inventory',
  manufacturing:     '/admin/manufacturing',
  qms:               '/admin/qms',
  service:           '/admin/service',
  projects:          '/admin/projects/dashboard',
  portfolio:         '/admin/portfolio/dashboard',
  hr:                '/admin/hr',
  recruitment:       '/admin/hr/recruitment',
  payroll:           '/admin/hr/payroll',
  ai_copilot:        '/admin/ai-copilot/dashboard',
  audit_log:         '/admin/audit-log',
  settings:          '/admin/settings',
  cfo:               '/admin/cfo',
};

/**
 * Returns the landing path for a given landingKey.
 * Falls back to '/admin' if the key is not found.
 */
export function getLandingPath(landingKey) {
  return LANDING_PATHS[landingKey] ?? '/admin';
}
