import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiShoppingBag, FiClock, FiCheckCircle, FiFileText, FiFile,
  FiChevronRight, FiTrendingUp,
} from 'react-icons/fi';
import supplierAPI   from '../../services/supplierAPI';
import PortalKPICard from '../../components/shared/PortalKPICard';
import StatusBadge   from '../../components/shared/StatusBadge';
import LoadingState  from '../../components/shared/LoadingState';

const fmtDate     = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
const fmtCurrency = v => `₹${(v || 0).toLocaleString('en-IN')}`;

const QUICK_ACTIONS = [
  { label: 'Purchase Orders', to: '/supplier/orders',    icon: FiShoppingBag, color: '#FF7A00', bg: '#FFF7ED' },
  { label: 'RFQ Invitations', to: '/supplier/rfq',       icon: FiFileText,    color: '#3B82F6', bg: '#EFF6FF' },
  { label: 'Invoices',        to: '/supplier/invoices',  icon: FiFile,        color: '#10B981', bg: '#ECFDF5' },
  { label: 'Documents',       to: '/supplier/documents', icon: FiFile,        color: '#8B5CF6', bg: '#F5F3FF' },
];

export default function SupplierDashboard() {
  const navigate = useNavigate();
  const { supplierUser } = useSelector(s => s.supplierAuth);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    supplierAPI.get('/supplier/dashboard')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState message="Loading dashboard…" />;

  return (
    <div className="p-6 space-y-6">

      {/* Welcome */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text,#111827)', fontFamily: 'Poppins', margin: 0 }}>
          Welcome back, {data?.name?.split(' ')[0] || supplierUser?.name?.split(' ')[0] || 'Supplier'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-4,#6B7280)', marginTop: 4 }}>
          Supplier Dashboard — manage your orders, quotes and invoices
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PortalKPICard icon={<FiShoppingBag size={20} />} color="#FF7A00" label="Open Orders"
          value={data?.openOrders ?? 0} to="/supplier/orders" />
        <PortalKPICard icon={<FiFileText size={20} />}    color="#3B82F6" label="Pending RFQs"
          value={data?.pendingRFQs ?? 0} to="/supplier/rfq" />
        <PortalKPICard icon={<FiCheckCircle size={20} />} color="#10B981" label="Delivered (Month)"
          value={data?.deliveredMonth ?? 0} to="/supplier/orders" />
        <PortalKPICard icon={<FiClock size={20} />}       color="#8B5CF6" label="Avg Lead Time"
          value={data?.avgLeadTime ? `${data.avgLeadTime}d` : '—'} to="/supplier/orders" />
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-4,#374151)', marginBottom: 14 }}>Quick Actions</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {QUICK_ACTIONS.map(a => {
            const Icon = a.icon;
            return (
              <Link key={a.label} to={a.to}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: a.bg, borderRadius: 10, textDecoration: 'none', color: a.color, fontWeight: 600, fontSize: 13, border: `1px solid ${a.color}22` }}>
                <Icon size={15} />{a.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Purchase Orders */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text,#111827)', fontFamily: 'Poppins', margin: 0 }}>Recent Purchase Orders</h2>
          <Link to="/supplier/orders" style={{ fontSize: 12, color: '#FF7A00', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
        </div>

        {(data?.recentOrders || []).length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)' }}>
            <FiShoppingBag size={32} style={{ color: '#9CA3AF', marginBottom: 10, opacity: 0.4 }} />
            <p style={{ fontSize: 13, color: 'var(--text-4,#9CA3AF)' }}>No orders yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(data?.recentOrders || []).map(po => (
              <div key={po._id} onClick={() => navigate(`/supplier/orders/${po._id}`)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '14px 18px', background: 'var(--card,#fff)', borderRadius: 12, border: '1px solid var(--border,#E5E7EB)', borderLeft: '4px solid #FF7A00', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#FF7A00' }}>{po.poNumber}</span>
                    <StatusBadge status={po.status} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text,#111827)' }}>{fmtCurrency(po.totalAmount)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-4,#9CA3AF)', marginTop: 2 }}>Expected: {fmtDate(po.expectedDeliveryDate)}</div>
                </div>
                <FiChevronRight size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
