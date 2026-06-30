import React, { useMemo } from 'react';
import {
  FiDollarSign, FiShoppingBag, FiPackage, FiUsers,
  FiArrowUp, FiArrowDown,
} from 'react-icons/fi';
import { Skeleton } from '../../../components/ui/Skeleton';

const KPI_DEFS = [
  { key: 'totalRevenue',   label: 'Total Revenue',   format: v => `₹${Number(v || 0).toLocaleString('en-IN')}`, icon: FiDollarSign, accent: 'var(--accent)',  change: '+12%', up: true  },
  { key: 'totalOrders',    label: 'Total Orders',    format: v => Number(v || 0).toLocaleString(),               icon: FiShoppingBag, accent: '#2563EB',       change: '+8%',  up: true  },
  { key: 'totalProducts',  label: 'Total Products',  format: v => Number(v || 0).toLocaleString(),               icon: FiPackage,    accent: '#16A34A',       change: '+3',   up: true  },
  { key: 'totalUsers',     label: 'Total Customers', format: v => Number(v || 0).toLocaleString(),               icon: FiUsers,      accent: '#7C3AED',       change: '+24',  up: true  },
];

const KPICard = React.memo(function KPICard({ label, value, Icon, accent, change, up }) {
  return (
    <div
      className="p-5 transition-all duration-150"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-9 h-9 flex items-center justify-center"
          style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}
          aria-hidden="true"
        >
          <Icon size={16} strokeWidth={1.75} style={{ color: accent }} />
        </div>
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5"
          style={{
            color: up ? '#15803D' : '#DC2626',
            background: up ? 'rgba(22,163,74,0.07)' : 'rgba(239,68,68,0.07)',
            border: `1px solid ${up ? 'rgba(22,163,74,0.18)' : 'rgba(239,68,68,0.18)'}`,
            borderRadius: 'var(--radius-sm)',
          }}
          aria-label={`${up ? 'Up' : 'Down'} ${change}`}
        >
          {up ? <FiArrowUp size={8} strokeWidth={2.5} /> : <FiArrowDown size={8} strokeWidth={2.5} />}
          {change}
        </span>
      </div>
      <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] mb-1.5" style={{ color: 'var(--text-4)' }}>
        {label}
      </p>
      <p
        className="font-bold text-[22px] leading-none"
        style={{ fontFamily: 'var(--font-numbers)', color: 'var(--text)', letterSpacing: '-0.03em' }}
      >
        {value}
      </p>
    </div>
  );
});

const WorkspaceKPIs = React.memo(function WorkspaceKPIs({ stats, loading }) {
  const cards = useMemo(() => {
    if (!stats) return [];
    return KPI_DEFS.map(d => ({
      label: d.label,
      value: d.format(stats[d.key]),
      Icon: d.icon,
      accent: d.accent,
      change: d.change,
      up: d.up,
    }));
  }, [stats]);

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4" aria-busy="true" aria-label="Loading KPIs">
        {[0,1,2,3].map(i => (
          <div key={i} className="p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex justify-between mb-4">
              <Skeleton style={{ width: 36, height: 36 }} />
              <Skeleton style={{ width: 44, height: 20 }} />
            </div>
            <Skeleton style={{ height: 10, width: '60%', marginBottom: 8 }} />
            <Skeleton style={{ height: 28, width: '50%' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4" role="list" aria-label="Key performance indicators">
      {cards.map(card => (
        <div key={card.label} role="listitem">
          <KPICard {...card} />
        </div>
      ))}
    </div>
  );
});

export default WorkspaceKPIs;
