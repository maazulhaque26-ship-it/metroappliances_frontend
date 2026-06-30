import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag, FiAlertTriangle, FiCheckSquare, FiTool,
  FiUserPlus, FiClipboard, FiArrowRight,
} from 'react-icons/fi';
import WorkspaceSection from './WorkspaceSection';

function AttentionCard({ label, count, path, icon: Icon, color, desc }) {
  return (
    <Link
      to={path}
      className="flex items-start gap-3 p-4 group transition-all duration-150"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `rgba(0,0,0,0.03)`, border: `1px solid var(--border)`, borderRadius: 'var(--radius-sm)' }}
        aria-hidden="true"
      >
        <Icon size={15} strokeWidth={1.75} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12.5px] font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
            {label}
          </span>
          {count !== null && (
            <span
              className="text-[11px] font-bold tabular-nums px-2 py-0.5 flex-shrink-0"
              style={{
                background: count > 0 ? 'rgba(239,68,68,0.07)' : 'rgba(22,163,74,0.07)',
                color: count > 0 ? '#DC2626' : '#15803D',
                border: `1px solid ${count > 0 ? 'rgba(239,68,68,0.18)' : 'rgba(22,163,74,0.18)'}`,
                borderRadius: 'var(--radius-sm)',
              }}
              aria-label={`${count} item${count !== 1 ? 's' : ''}`}
            >
              {count}
            </span>
          )}
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>{desc}</p>
      </div>
      <FiArrowRight
        size={13}
        style={{ color: 'var(--text-5)', flexShrink: 0, marginTop: 3 }}
        className="group-hover:translate-x-0.5 transition-transform"
        aria-hidden="true"
      />
    </Link>
  );
}

const MyWorkPanel = React.memo(function MyWorkPanel({ stats }) {
  const items = useMemo(() => [
    {
      label: 'Pending Orders',
      count: stats?.pendingOrders ?? null,
      path: '/admin/orders',
      icon: FiShoppingBag,
      color: 'var(--accent)',
      desc: 'Orders awaiting processing',
    },
    {
      label: 'Out of Stock',
      count: stats?.outOfStock ?? null,
      path: '/admin/products',
      icon: FiAlertTriangle,
      color: '#DC2626',
      desc: 'Products with zero inventory',
    },
    {
      label: 'Procurement Approvals',
      count: null,
      path: '/admin/procurement/approvals',
      icon: FiClipboard,
      color: '#2563EB',
      desc: 'Purchase requests awaiting approval',
    },
    {
      label: 'Leave Approvals',
      count: null,
      path: '/admin/hr/leave/approvals',
      icon: FiCheckSquare,
      color: '#16A34A',
      desc: 'Employee leave requests pending',
    },
    {
      label: 'Service Requests',
      count: null,
      path: '/admin/service/requests',
      icon: FiTool,
      color: '#7C3AED',
      desc: 'Open after-sales service tickets',
    },
    {
      label: 'Install Requests',
      count: null,
      path: '/admin/installation/requests',
      icon: FiUserPlus,
      color: '#0891B2',
      desc: 'Pending installation jobs',
    },
  ], [stats]);

  return (
    <WorkspaceSection
      id="my-work"
      title="My Work"
      subtitle="Items requiring your attention"
    >
      <div className="grid sm:grid-cols-2 gap-3" role="list" aria-label="Work items requiring attention">
        {items.map(item => (
          <div key={item.path} role="listitem">
            <AttentionCard {...item} />
          </div>
        ))}
      </div>
    </WorkspaceSection>
  );
});

export default MyWorkPanel;
