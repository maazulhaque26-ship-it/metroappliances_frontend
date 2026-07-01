/**
 * WorkspaceRegistry — workspace metadata per workspaceKey.
 * Describes which widgets and quick-actions belong to each workspace.
 * Widget IDs are logical names; the actual components remain unchanged.
 */

export const WORKSPACE_CONFIGS = {
  full: {
    title: 'Enterprise Dashboard',
    description: 'Full platform overview',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working', 'favorites-panel',
      'shortcut-grid', 'quick-actions', 'recent-orders', 'favorite-modules',
      'recent-activity', 'announcements', 'workspace-schedule',
    ],
    quickActions: ['new-order', 'add-product', 'create-invoice', 'view-reports'],
  },

  executive: {
    title: 'Executive Dashboard',
    description: 'Strategic metrics and KPIs',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'bi-summary', 'cfo-summary',
      'recent-activity', 'announcements', 'workspace-schedule',
    ],
    quickActions: ['view-bi-dashboard', 'view-cfo-dashboard', 'view-reports'],
  },

  finance: {
    title: 'Finance Workspace',
    description: 'Finance, treasury, and GL overview',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'shortcut-grid', 'quick-actions',
      'recent-activity', 'workspace-schedule',
    ],
    quickActions: ['new-journal', 'create-invoice', 'bank-reconciliation', 'view-reports'],
  },

  accounts: {
    title: 'Accounts Workspace',
    description: 'Payables and receivables overview',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'recent-activity',
    ],
    quickActions: ['new-invoice', 'record-payment', 'aging-report'],
  },

  sales: {
    title: 'Sales Workspace',
    description: 'Orders, revenue, and customers',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'recent-orders', 'quick-actions', 'recent-activity', 'announcements',
    ],
    quickActions: ['new-order', 'view-customers', 'sales-report'],
  },

  crm: {
    title: 'CRM Workspace',
    description: 'Leads, deals, and agents',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'quick-actions', 'recent-activity',
    ],
    quickActions: ['new-lead', 'assign-agent', 'view-pipeline'],
  },

  procurement: {
    title: 'Procurement Workspace',
    description: 'Purchase orders and vendors',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'quick-actions', 'recent-activity',
    ],
    quickActions: ['new-po', 'approve-rfq', 'vendor-list'],
  },

  warehouse: {
    title: 'Warehouse Workspace',
    description: 'Warehouse operations and logistics',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'quick-actions', 'recent-activity',
    ],
    quickActions: ['receive-goods', 'dispatch-order', 'stock-transfer'],
  },

  inventory: {
    title: 'Inventory Workspace',
    description: 'Stock levels and adjustments',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'recent-activity',
    ],
    quickActions: ['stock-adjustment', 'low-stock-report', 'cycle-count'],
  },

  manufacturing: {
    title: 'Manufacturing Workspace',
    description: 'Production orders and planning',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'quick-actions', 'recent-activity',
    ],
    quickActions: ['new-work-order', 'production-schedule', 'bom-review'],
  },

  quality: {
    title: 'Quality Workspace',
    description: 'QMS inspections and NCRs',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'recent-activity',
    ],
    quickActions: ['new-inspection', 'raise-ncr', 'quality-report'],
  },

  service: {
    title: 'Service Workspace',
    description: 'Service tickets and technicians',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'quick-actions', 'recent-activity',
    ],
    quickActions: ['new-ticket', 'assign-technician', 'service-report'],
  },

  projects: {
    title: 'Projects Workspace',
    description: 'Tasks, milestones, and Gantt',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'quick-actions', 'recent-activity', 'workspace-schedule',
    ],
    quickActions: ['new-project', 'my-tasks', 'project-report'],
  },

  portfolio: {
    title: 'Portfolio Workspace',
    description: 'Portfolio, PPM, and PMO',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'recent-activity',
    ],
    quickActions: ['portfolio-dashboard', 'capacity-planner', 'risk-register'],
  },

  hr: {
    title: 'HR Workspace',
    description: 'Employees, attendance, and payroll',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'quick-actions', 'recent-activity', 'workspace-schedule',
    ],
    quickActions: ['new-employee', 'approve-leave', 'run-payroll'],
  },

  recruitment: {
    title: 'Recruitment Workspace',
    description: 'Job openings, candidates, and interviews',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'recent-activity',
    ],
    quickActions: ['new-job', 'review-candidates', 'schedule-interview'],
  },

  payroll: {
    title: 'Payroll Workspace',
    description: 'Payroll runs and compliance',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'favorites-panel', 'recent-activity',
    ],
    quickActions: ['run-payroll', 'payslip-report', 'tax-filing'],
  },

  analytics: {
    title: 'Analytics Workspace',
    description: 'BI reports and dashboards',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'favorites-panel', 'shortcut-grid', 'recent-activity',
    ],
    quickActions: ['open-bi-dashboard', 'create-report', 'schedule-report'],
  },

  ai: {
    title: 'AI Workspace',
    description: 'AI Copilot and forecasting tools',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'favorites-panel', 'recent-activity',
    ],
    quickActions: ['open-copilot', 'run-forecast', 'view-insights'],
  },

  bi: {
    title: 'BI Workspace',
    description: 'Executive analytics and KPI tracking',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'favorites-panel', 'shortcut-grid', 'recent-activity',
    ],
    quickActions: ['open-exec-dashboard', 'view-kpis', 'create-report'],
  },

  support: {
    title: 'Support Workspace',
    description: 'Customer support and service tickets',
    layout: 'two-column',
    widgets: [
      'hero', 'kpis', 'my-work', 'continue-working',
      'recent-activity', 'announcements',
    ],
    quickActions: ['new-ticket', 'view-open-tickets', 'escalate'],
  },

  auditor: {
    title: 'Audit Workspace',
    description: 'Audit logs and compliance trails',
    layout: 'single-column',
    widgets: ['hero', 'recent-activity', 'announcements'],
    quickActions: ['view-audit-log', 'export-audit'],
  },

  sysadmin: {
    title: 'System Administration',
    description: 'Platform settings and configuration',
    layout: 'single-column',
    widgets: ['hero', 'recent-activity', 'announcements'],
    quickActions: ['store-settings', 'user-management', 'system-health'],
  },

  /** External-portal workspaces — managed by their own portal routing. */
  employee: { title: 'My Workspace', description: 'ESS portal', layout: 'single-column', widgets: [], quickActions: [] },
  dealer:   { title: 'Dealer Portal', description: 'B2B dealer workspace', layout: 'single-column', widgets: [], quickActions: [] },
  retailer: { title: 'Retailer Portal', description: 'B2B retailer workspace', layout: 'single-column', widgets: [], quickActions: [] },
  supplier: { title: 'Supplier Portal', description: 'Supplier workspace', layout: 'single-column', widgets: [], quickActions: [] },
  customer: { title: 'Customer Portal', description: 'Customer workspace', layout: 'single-column', widgets: [], quickActions: [] },
  engineer: { title: 'Engineer Portal', description: 'Installation engineer workspace', layout: 'single-column', widgets: [], quickActions: [] },
  technician: { title: 'Technician Portal', description: 'Field technician workspace', layout: 'single-column', widgets: [], quickActions: [] },
};

/** Returns workspace config for a given workspaceKey. */
export function getWorkspaceConfig(workspaceKey) {
  return WORKSPACE_CONFIGS[workspaceKey] ?? WORKSPACE_CONFIGS.full;
}
