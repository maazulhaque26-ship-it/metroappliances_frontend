import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiPackage, FiShoppingBag, FiFileText,
  FiUserPlus, FiGrid, FiArrowRight,
} from 'react-icons/fi';
import WorkspaceSection from './WorkspaceSection';

const ACTIONS = [
  { label: 'Create Customer',  desc: 'Add a new customer account',      path: '/admin/users',                       icon: FiUsers,      accent: '#7C3AED' },
  { label: 'Add Product',      desc: 'List a new product in catalog',    path: '/admin/products',                    icon: FiPackage,    accent: '#16A34A' },
  { label: 'Create Order',     desc: 'Start a new sales order',          path: '/admin/orders',                      icon: FiShoppingBag, accent: 'var(--accent)' },
  { label: 'Create Invoice',   desc: 'Issue a customer invoice',         path: '/admin/accounts-receivable/invoices', icon: FiFileText,   accent: '#0891B2' },
  { label: 'Add Employee',     desc: 'Onboard a new employee',           path: '/admin/hr/employees',                icon: FiUserPlus,   accent: '#2563EB' },
  { label: 'Open Dashboard',   desc: 'Return to main overview',          path: '/admin',                             icon: FiGrid,       accent: '#D97706' },
];

const QuickActions = React.memo(function QuickActions() {
  return (
    <WorkspaceSection
      id="quick-actions"
      title="Quick Actions"
      subtitle="Common tasks at a glance"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" role="list" aria-label="Quick actions">
        {ACTIONS.map(action => {
          const Icon = action.icon;
          return (
            <div key={action.path} role="listitem">
              <Link
                to={action.path}
                className="flex items-center gap-3 p-4 group transition-all duration-150"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = action.accent; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div
                  className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${action.accent} 8%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${action.accent} 20%, transparent)`,
                    borderRadius: 'var(--radius-sm)',
                  }}
                  aria-hidden="true"
                >
                  <Icon size={14} strokeWidth={1.75} style={{ color: action.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-semibold leading-tight" style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                    {action.label}
                  </p>
                  <p className="text-[10.5px] mt-0.5 truncate" style={{ color: 'var(--text-4)' }}>{action.desc}</p>
                </div>
                <FiArrowRight
                  size={12}
                  style={{ color: 'var(--text-5)', flexShrink: 0 }}
                  className="group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </Link>
            </div>
          );
        })}
      </div>
    </WorkspaceSection>
  );
});

export default QuickActions;
