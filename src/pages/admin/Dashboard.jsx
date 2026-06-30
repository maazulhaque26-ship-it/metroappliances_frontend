import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../../services/api';
import AdminLayout from './AdminLayout';
import useAdminSocket from '../../hooks/useAdminSocket';
import { TableSkeleton } from '../../components/ui/Skeleton';
import {
  FiShoppingBag, FiEye, FiChevronRight,
} from 'react-icons/fi';

import WorkspaceHero      from './workspace/WorkspaceHero';
import WorkspaceKPIs      from './workspace/WorkspaceKPIs';
import MyWorkPanel        from './workspace/MyWorkPanel';
import ContinueWorking    from './workspace/ContinueWorking';
import FavoriteModules    from './workspace/FavoriteModules';
import QuickActions       from './workspace/QuickActions';
import RecentActivity     from './workspace/RecentActivity';
import Announcements      from './workspace/Announcements';
import WorkspaceSchedule  from './workspace/WorkspaceSchedule';
import WorkspaceSection   from './workspace/WorkspaceSection';

const STATUS_COLORS = {
  Pending:    { bg: 'rgba(255,138,0,0.07)',  text: '#B45309', border: 'rgba(255,138,0,0.18)' },
  Processing: { bg: 'rgba(37,99,235,0.07)',  text: '#1D4ED8', border: 'rgba(37,99,235,0.18)' },
  Shipped:    { bg: 'rgba(109,40,217,0.07)', text: '#6D28D9', border: 'rgba(109,40,217,0.18)' },
  Delivered:  { bg: 'rgba(22,163,74,0.07)',  text: '#15803D', border: 'rgba(22,163,74,0.18)' },
  Cancelled:  { bg: 'rgba(239,68,68,0.07)',  text: '#DC2626', border: 'rgba(239,68,68,0.18)' },
};

export default function AdminDashboard() {
  const { user }          = useSelector(s => s.auth);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [recentOrders,  setRecentOrders]  = useState([]);

  const fetchAll = () => {
    API.get('/admin/stats').then(r => setStats(r.data.stats || r.data)).catch(() => {});
    API.get('/admin/orders?limit=5&sort=-createdAt').then(r => setRecentOrders(r.data.orders || [])).catch(() => {});
  };

  useAdminSocket({
    'order:created':       fetchAll,
    'order:statusChanged': fetchAll,
    'review:created':      fetchAll,
  });

  useEffect(() => {
    Promise.all([
      API.get('/admin/stats'),
      API.get('/admin/orders?limit=5&sort=-createdAt'),
    ])
      .then(([s, o]) => {
        setStats(s.data.stats || s.data);
        setRecentOrders(o.data.orders || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* ── Feature 1: Workspace Hero ──────────────────────────── */}
        <WorkspaceHero user={user} />

        {/* ── Feature 6: KPI Cards ──────────────────────────────── */}
        <WorkspaceKPIs stats={stats} loading={loading} />

        {/* ── Main workspace grid ───────────────────────────────── */}
        <div className="grid xl:grid-cols-3 gap-8">

          {/* ── Left column (2/3) ──────────────────────────────── */}
          <div className="xl:col-span-2 space-y-8">

            {/* Feature 2: My Work */}
            <MyWorkPanel stats={stats} />

            {/* Feature 3: Continue Working */}
            <ContinueWorking />

            {/* Feature 5: Quick Actions */}
            <QuickActions />

            {/* Recent Orders — preserving existing real data */}
            <WorkspaceSection
              id="recent-orders"
              title="Recent Orders"
              subtitle="Latest orders from your store"
              action={
                <Link
                  to="/admin/orders"
                  className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest transition-colors"
                  style={{ color: 'var(--text-3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                >
                  View All <FiChevronRight size={12} strokeWidth={2.5} aria-hidden="true" />
                </Link>
              }
            >
              <div
                className="overflow-hidden"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
              >
                {loading ? (
                  <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
                ) : recentOrders.length > 0 ? (
                  <>
                    {/* Desktop table */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr>
                            {['Order ID', 'Customer', 'Amount', 'Status', 'Date', ''].map((h, i) => (
                              <th
                                key={h || i}
                                scope="col"
                                className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest"
                                style={{ color: 'var(--text-4)', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map(order => {
                            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
                            return (
                              <tr
                                key={order._id}
                                className="transition-colors"
                                style={{ borderBottom: '1px solid var(--border)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <td className="px-5 py-4 font-mono text-[12px] font-semibold" style={{ color: 'var(--text)' }}>
                                  #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                                </td>
                                <td className="px-5 py-4">
                                  <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--text)' }}>{order.user?.name || 'N/A'}</p>
                                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>{order.user?.email || ''}</p>
                                </td>
                                <td className="px-5 py-4">
                                  <span className="font-bold text-[13px]" style={{ fontFamily: 'var(--font-numbers)', color: 'var(--text)' }}>
                                    ₹{order.totalPrice?.toLocaleString('en-IN')}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <span
                                    className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                                    style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, borderRadius: 'var(--radius-sm)' }}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-[12px] font-medium" style={{ color: 'var(--text-3)' }}>
                                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <Link
                                    to="/admin/orders"
                                    className="inline-flex p-2 transition-colors"
                                    style={{ color: 'var(--text-4)', borderRadius: 'var(--radius-sm)' }}
                                    aria-label="View order"
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg-2)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-4)'; e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    <FiEye size={15} strokeWidth={1.75} />
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="block lg:hidden divide-y" style={{ borderColor: 'var(--border)' }}>
                      {recentOrders.map(order => {
                        const sc = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
                        return (
                          <div key={order._id} className="p-5 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-mono font-bold text-[13px]" style={{ color: 'var(--text)' }}>#{order.orderNumber || order._id?.slice(-6).toUpperCase()}</p>
                                <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'var(--text-4)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-[13px]" style={{ fontFamily: 'var(--font-numbers)', color: 'var(--text)' }}>₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                                <span
                                  className="inline-flex mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                                  style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, borderRadius: 'var(--radius-sm)' }}
                                >
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            <div
                              className="flex justify-between items-center p-3"
                              style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                            >
                              <div>
                                <p className="font-semibold text-[13px]" style={{ color: 'var(--text)' }}>{order.user?.name || 'N/A'}</p>
                                <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>{order.user?.email || ''}</p>
                              </div>
                              <Link to="/admin/orders" className="p-2" style={{ color: 'var(--text-3)' }} aria-label="View order">
                                <FiEye size={16} strokeWidth={1.75} />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16" style={{ background: 'var(--bg)' }}>
                    <FiShoppingBag size={36} className="mx-auto mb-4" style={{ color: 'var(--text-5)' }} aria-hidden="true" />
                    <p className="text-sm font-medium" style={{ color: 'var(--text-3)' }}>No orders yet.</p>
                  </div>
                )}
              </div>
            </WorkspaceSection>
          </div>

          {/* ── Right column (1/3) ─────────────────────────────── */}
          <div className="space-y-8">

            {/* Feature 4: Favorite Modules */}
            <FavoriteModules />

            {/* Feature 8: Recent Activity */}
            <RecentActivity />

            {/* Feature 9: Announcements */}
            <Announcements />

            {/* Feature 7: Today's Schedule */}
            <WorkspaceSchedule />
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
