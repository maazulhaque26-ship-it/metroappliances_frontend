import {
  FiShoppingBag, FiTrendingUp, FiDollarSign, FiUsers,
  FiClock, FiFolder, FiPackage, FiBriefcase, FiTool,
  FiCpu, FiBarChart2, FiFileText, FiSettings,
} from 'react-icons/fi';

export const CATEGORIES = {
  orders:     { label: 'Orders',     color: 'var(--accent)', icon: FiShoppingBag },
  sales:      { label: 'Sales',      color: '#2563EB',       icon: FiTrendingUp  },
  finance:    { label: 'Finance',    color: '#16A34A',       icon: FiDollarSign  },
  hr:         { label: 'HR',         color: '#7C3AED',       icon: FiUsers       },
  payroll:    { label: 'Payroll',    color: '#0891B2',       icon: FiDollarSign  },
  attendance: { label: 'Attendance', color: '#D97706',       icon: FiClock       },
  projects:   { label: 'Projects',   color: '#DC2626',       icon: FiFolder      },
  inventory:  { label: 'Inventory',  color: '#059669',       icon: FiPackage     },
  crm:        { label: 'CRM',        color: '#7C3AED',       icon: FiBriefcase   },
  service:    { label: 'Service',    color: '#EF4444',       icon: FiTool        },
  ai:         { label: 'AI',         color: '#8B5CF6',       icon: FiCpu         },
  bi:         { label: 'BI',         color: '#0EA5E9',       icon: FiBarChart2   },
  documents:  { label: 'Documents',  color: '#6366F1',       icon: FiFileText    },
  system:     { label: 'System',     color: '#6B7280',       icon: FiSettings    },
};

export const PRIORITIES = {
  critical: { label: 'Critical', color: '#DC2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.22)'   },
  high:     { label: 'High',     color: '#EA580C', bg: 'rgba(234,88,12,0.08)',   border: 'rgba(234,88,12,0.22)'   },
  medium:   { label: 'Medium',   color: '#D97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.22)'   },
  low:      { label: 'Low',      color: '#6B7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.22)' },
};

export const SOCKET_EVENT_META = {
  'order:created': (p) => ({
    category: 'orders', priority: 'high',
    title: 'New Order Placed',
    body: `Order ${p?.order?.orderNumber ? `#${p.order.orderNumber}` : ''} placed successfully`.trim(),
    path: '/admin/orders',
  }),
  'order:statusChanged': (p) => ({
    category: 'orders', priority: 'medium',
    title: 'Order Status Updated',
    body: `Order ${p?.order?.orderNumber ? `#${p.order.orderNumber}` : ''} status changed to ${p?.order?.status || 'updated'}`.trim(),
    path: '/admin/orders',
  }),
  'review:created': () => ({
    category: 'sales', priority: 'low',
    title: 'New Product Review',
    body: 'A customer submitted a new product review',
    path: '/admin/reviews',
  }),
};

const h = (n) => Date.now() - n * 3_600_000;
const d = (n) => Date.now() - n * 86_400_000;

export function seedNotifications() {
  return [
    {
      id: 'seed-1', category: 'inventory', priority: 'critical',
      title: 'Critical Stock Alert',
      body: 'SKU-WASH-001 (Front Load Washer) has only 2 units remaining. Reorder required immediately.',
      path: '/admin/inventory/stock', at: h(1), isRead: false, isArchived: false,
    },
    {
      id: 'seed-2', category: 'hr', priority: 'high',
      title: 'Leave Request Pending Approval',
      body: 'John Doe has requested 3 days of annual leave (Jul 5–7). Your approval is required.',
      path: '/admin/hr/leave/approvals', at: h(2), isRead: false, isArchived: false,
    },
    {
      id: 'seed-3', category: 'payroll', priority: 'high',
      title: 'Payroll Run Awaiting Approval',
      body: 'June 2026 payroll run PR-2026-06 totalling ₹24,80,000 is ready for final approval.',
      path: '/admin/hr/payroll/runs', at: h(3), isRead: false, isArchived: false,
    },
    {
      id: 'seed-4', category: 'orders', priority: 'high',
      title: 'New Order Placed',
      body: 'Order #ORD-2026-1284 for ₹45,999 placed by Priya Sharma. Ready for processing.',
      path: '/admin/orders', at: h(4), isRead: false, isArchived: false,
    },
    {
      id: 'seed-5', category: 'finance', priority: 'medium',
      title: 'Invoice Overdue',
      body: 'Invoice INV-2026-0089 (₹1,20,000) from Vendor Logistics Ltd is 5 days past due.',
      path: '/admin/accounts-payable/invoices', at: h(5), isRead: false, isArchived: false,
    },
    {
      id: 'seed-6', category: 'projects', priority: 'medium',
      title: 'Project Deadline Approaching',
      body: '"Q3 Brand Relaunch" milestone is due in 3 days. 2 blocking tasks are still open.',
      path: '/admin/project-management', at: h(8), isRead: true, isArchived: false,
    },
    {
      id: 'seed-7', category: 'service', priority: 'medium',
      title: 'Service Request Assigned',
      body: 'SR-1001 (Refrigerator compressor fault) has been assigned to Technician Ravi Kumar.',
      path: '/admin/service/requests', at: h(10), isRead: true, isArchived: false,
    },
    {
      id: 'seed-8', category: 'attendance', priority: 'low',
      title: 'Attendance Irregularity Detected',
      body: '5 employees were marked absent without prior leave approval today.',
      path: '/admin/hr/attendance', at: d(1), isRead: true, isArchived: false,
    },
    {
      id: 'seed-9', category: 'crm', priority: 'medium',
      title: 'Lead Follow-up Overdue',
      body: 'Lead from ABC Corp (₹8.5L potential deal) has not been contacted in 7 days.',
      path: '/admin/crm', at: d(1), isRead: true, isArchived: false,
    },
    {
      id: 'seed-10', category: 'documents', priority: 'low',
      title: 'Document Review Due',
      body: 'Vendor Agreement 2026 (DOC-V-0045) is scheduled for its annual compliance review.',
      path: '/admin/documents', at: d(1), isRead: true, isArchived: false,
    },
    {
      id: 'seed-11', category: 'bi', priority: 'low',
      title: 'Monthly BI Report Ready',
      body: 'June 2026 Executive Business Intelligence report has been generated and is ready for review.',
      path: '/admin/bi-exec/dashboard', at: d(2), isRead: true, isArchived: false,
    },
    {
      id: 'seed-12', category: 'ai', priority: 'low',
      title: 'AI Forecast Model Retrained',
      body: 'Demand forecasting model retrained on June 2026 data. New accuracy: 94.2% (+1.8%).',
      path: '/admin/ai/forecasting', at: d(2), isRead: true, isArchived: false,
    },
    {
      id: 'seed-13', category: 'orders', priority: 'low',
      title: 'Order Delivered Successfully',
      body: 'Order #ORD-2026-1190 has been delivered to customer Arun Mehta.',
      path: '/admin/orders', at: d(2), isRead: true, isArchived: false,
    },
    {
      id: 'seed-14', category: 'system', priority: 'low',
      title: 'System Backup Completed',
      body: 'Automated database backup completed at 02:00 AM. 3.2 GB archived successfully.',
      path: '/admin', at: d(3), isRead: true, isArchived: false,
    },
  ];
}
