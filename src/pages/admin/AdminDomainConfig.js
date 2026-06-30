import {
  FiShoppingBag, FiBriefcase, FiUsers, FiTruck, FiTool,
  FiCpu, FiDollarSign, FiFolder, FiBarChart2, FiSettings, FiFlag,
} from 'react-icons/fi';

export const DOMAINS = [
  { id: 'commerce',      label: 'Commerce',      icon: FiShoppingBag },
  { id: 'b2b',           label: 'B2B / Dealers', icon: FiBriefcase },
  { id: 'crm',           label: 'CRM',           icon: FiUsers },
  { id: 'supply-chain',  label: 'Supply Chain',  icon: FiTruck },
  { id: 'service',       label: 'Service',        icon: FiTool },
  { id: 'manufacturing', label: 'Manufacturing', icon: FiCpu },
  { id: 'finance',       label: 'Finance',       icon: FiDollarSign },
  { id: 'hr',            label: 'People & HR',   icon: FiFlag },
  { id: 'projects',      label: 'Projects',      icon: FiFolder },
  { id: 'intelligence',  label: 'Intelligence',  icon: FiBarChart2 },
  { id: 'settings',      label: 'Settings',      icon: FiSettings },
];

export const DOMAIN_GROUPS = {
  commerce:       ['Overview', 'Catalog', 'Sales', 'Customers', 'Content', 'Marketing'],
  b2b:            ['Dealers'],
  crm:            ['CRM', 'BI & Analytics'],
  'supply-chain': ['Warehouse', 'Inventory', 'Procurement', 'Logistics', 'Barcode & Scanning', 'IoT & Industry 4.0'],
  service:        ['After Sales Service', 'Installation'],
  manufacturing:  ['Manufacturing', 'Production Planning', 'MRP', 'MES', 'QMS', 'EAM'],
  finance:        ['Finance', 'Accounts Payable', 'Accounts Receivable', 'Tax & Compliance', 'Banking & Treasury', 'CFO & Executive'],
  hr:             ['HRMS'],
  projects:       ['Projects', 'Portfolio (PPM)', 'PMO Governance', 'BPM & Workflow'],
  intelligence:   ['Document Management', 'BI Executive Analytics', 'AI & Forecasting', 'AI Copilot'],
  settings:       ['Enterprise', 'Settings'],
};

// Section label dividers for groups whose items follow a natural sectional order.
// startPath = first item.path belonging to that section.
export const GROUP_SECTIONS = {
  'HRMS': [
    { label: 'Core HR',            startPath: '/admin/hr/employees' },
    { label: 'Attendance & Leave', startPath: '/admin/hr/attendance' },
    { label: 'Payroll',            startPath: '/admin/hr/payroll' },
    { label: 'Recruitment',        startPath: '/admin/hr/recruitment' },
    { label: 'Performance',        startPath: '/admin/hr/performance' },
  ],
  'Projects': [
    { label: 'Planning',  startPath: '/admin/projects' },
    { label: 'Execution', startPath: '/admin/projects/tasks/all' },
    { label: 'Reports',   startPath: '/admin/projects/reports' },
  ],
};

// Nav item paths that should reserve space for a future real-time counter badge.
export const COUNTER_PATHS = new Set([
  '/admin/orders',
  '/admin/procurement/approvals',
  '/admin/hr/leave/approvals',
  '/admin/service/requests',
  '/admin/bpm/approvals',
  '/admin/installation/requests',
]);
