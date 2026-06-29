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
