import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiPackage, FiClock, FiCalendar, FiTruck, FiTrendingUp, FiShoppingCart,
  FiCreditCard, FiZap, FiList, FiFile, FiAlertCircle, FiXCircle, FiSlash,
  FiPhone, FiMail, FiMessageSquare, FiArrowRight, FiRefreshCw,
} from 'react-icons/fi';
import DealerLayout from '../../components/dealer/DealerLayout';
import PortalKPICard from '../../components/shared/PortalKPICard';
import dealerAPI from '../../services/dealerAPI';

const STATUS_COLORS = {
  pending:    '#F59E0B',
  confirmed:  '#3B82F6',
  processing: '#8B5CF6',
  shipped:    '#06B6D4',
  delivered:  '#10B981',
  cancelled:  '#EF4444',
};

function fmt(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n?.toLocaleString('en-IN') || 0}`;
}

function fmtFin(n) {
  if (!n) return '₹0';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

const QUICK_ACTIONS = [
  { label: 'Place Order',           path: '/dealer/products',         icon: FiShoppingCart, color: '#FF7A00' },
  { label: 'Browse Products',       path: '/dealer/products',         icon: FiPackage,      color: '#8B5CF6' },
  { label: 'Outstanding Payments',  path: '/dealer/finance/payments', icon: FiCreditCard,   color: '#EF4444' },
  { label: 'Wallet',                path: '/dealer/finance/wallet',   icon: FiZap,          color: '#10B981' },
  { label: 'Support',               path: '/dealer/notifications',    icon: FiMessageSquare, color: '#3B82F6' },
];

export default function DealerDashboard() {
  const { dealer } = useSelector(s => s.dealerAuth);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [finance, setFinance] = useState(null);

  useEffect(() => {
    dealerAPI.get('/dealer/dashboard')
      .then(r => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (dealer?.status === 'approved') {
      dealerAPI.get('/dealer/finance/summary')
        .then(r => setFinance(r.data.summary))
        .catch(() => {});
    }
  }, [dealer?.status]);

  const isPending   = dealer?.status === 'pending';
  const isRejected  = dealer?.status === 'rejected';
  const isSuspended = dealer?.status === 'suspended';
  const isApproved  = dealer?.status === 'approved';

  return (
    <DealerLayout>

      {/* ── Status banners ── */}
      {isPending && (
        <div style={{
          background: '#FFF7ED', border: '1px solid #FED7AA',
          borderRadius: '10px', padding: '14px 18px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }} role="status">
          <div style={{ width: 32, height: 32, borderRadius: '8px', flexShrink: 0, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiAlertCircle size={16} style={{ color: '#F59E0B' }} aria-hidden="true" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#92400E' }}>Application Under Review</div>
            <div style={{ fontSize: '12px', color: '#B45309', marginTop: '2px' }}>
              Our team is reviewing your application. Upload your documents to speed up the process.
            </div>
          </div>
          <Link to="/dealer/profile" style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 600, color: '#F59E0B', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Upload Docs
            <FiArrowRight size={11} style={{ marginLeft: '4px', verticalAlign: 'middle' }} aria-hidden="true" />
          </Link>
        </div>
      )}
      {isRejected && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA',
          borderRadius: '10px', padding: '14px 18px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }} role="alert">
          <div style={{ width: 32, height: 32, borderRadius: '8px', flexShrink: 0, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiXCircle size={16} style={{ color: '#EF4444' }} aria-hidden="true" />
          </div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#991B1B' }}>Application Rejected — Contact Support</div>
        </div>
      )}
      {isSuspended && (
        <div style={{
          background: '#F9FAFB', border: '1px solid #D1D5DB',
          borderRadius: '10px', padding: '14px 18px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }} role="alert">
          <div style={{ width: 32, height: 32, borderRadius: '8px', flexShrink: 0, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiSlash size={16} style={{ color: '#6B7280' }} aria-hidden="true" />
          </div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#374151' }}>Account Suspended — Contact Support</div>
        </div>
      )}

      {/* ── Welcome header ── */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
            Welcome, {dealer?.ownerName?.split(' ')[0] || 'Dealer'}
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--text-4)', marginTop: '4px' }}>
            {dealer?.businessName} · {dealer?.dealerCode}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            to="/dealer/products"
            style={{
              padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: '12px', fontWeight: 700,
              opacity: !isApproved ? 0.5 : 1,
              pointerEvents: !isApproved ? 'none' : undefined,
            }}
          >
            Browse Catalog
          </Link>
          <Link
            to="/dealer/orders"
            style={{
              padding: '8px 16px', borderRadius: '8px', textDecoration: 'none',
              border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px', fontWeight: 600,
              background: 'var(--card)',
            }}
          >
            My Orders
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '16px' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: 'var(--border)', borderRadius: '12px', height: '100px' }} />
          ))}
        </div>
      ) : (
        <>
          {/* ── Commerce KPIs ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: '16px', marginBottom: '28px' }}>
            <PortalKPICard label="Today's Orders"  value={data?.stats?.todayOrders || 0}      icon={FiPackage}      color="var(--accent)"  to="/dealer/orders" />
            <PortalKPICard label="Pending"         value={data?.stats?.pendingOrders || 0}     icon={FiClock}        color="#F59E0B"         to="/dealer/orders" />
            <PortalKPICard label="This Month"      value={data?.stats?.monthOrders || 0}       icon={FiCalendar}     color="#8B5CF6"         to="/dealer/orders" />
            <PortalKPICard label="Outstanding"     value={data?.stats?.outstandingOrders || 0} icon={FiTruck}        color="#06B6D4"         to="/dealer/orders" />
            <PortalKPICard label="Monthly Revenue" value={fmt(data?.stats?.monthRevenue || 0)} icon={FiTrendingUp}   color="#10B981" />
            <PortalKPICard label="Cart Items"      value={data?.stats?.cartItems || 0}         icon={FiShoppingCart} color="var(--accent)"  to="/dealer/cart" />
          </div>

          {/* ── Finance KPIs — approved dealers only ── */}
          {isApproved && finance && (
            <>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                Finance Summary
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: '16px', marginBottom: '28px' }}>
                <PortalKPICard label="Wallet Balance"   value={fmtFin(finance.wallet?.availableBalance)} icon={FiCreditCard} color="var(--accent)" to="/dealer/finance/wallet" sub={`Total: ${fmtFin(finance.wallet?.totalBalance)}`} />
                <PortalKPICard label="Credit Available" value={fmtFin(finance.credit?.remainingCredit)} icon={FiZap}        color="#8B5CF6"         to="/dealer/finance/credit" sub={`Limit: ${fmtFin(finance.credit?.creditLimit)}`} />
                <PortalKPICard label="Outstanding"      value={fmtFin(Math.max(0, finance.outstanding || 0))} icon={FiList}  color={finance.outstanding > 0 ? '#EF4444' : '#10B981'} to="/dealer/finance/ledger" sub="Running balance" />
                <PortalKPICard label="Unpaid Invoices"  value={finance.unpaidInvoices ?? 0}            icon={FiFile}       color="#F59E0B"          to="/dealer/finance/invoices" sub="Pending payment" />
                <PortalKPICard label="Pending Payments" value={finance.pendingPayments ?? 0}           icon={FiCreditCard} color="#3B82F6"          to="/dealer/finance/payments" sub="Awaiting verify" />
              </div>
            </>
          )}

          {/* ── Quick Actions ── */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              Quick Actions
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {QUICK_ACTIONS.map(({ label, path, icon: Icon, color }) => {
                const locked = !isApproved && (path.startsWith('/dealer/products') || path.startsWith('/dealer/finance') || path === '/dealer/cart');
                return (
                  <Link
                    key={label}
                    to={locked ? '#' : path}
                    aria-disabled={locked || undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '9px 15px', borderRadius: '8px', textDecoration: 'none',
                      background: 'var(--card)', border: '1px solid var(--border)',
                      fontSize: '12px', fontWeight: 600, color: locked ? 'var(--text-4)' : 'var(--text-2)',
                      opacity: locked ? 0.55 : 1,
                      pointerEvents: locked ? 'none' : undefined,
                      transition: 'border-color 0.12s, box-shadow 0.12s',
                    }}
                    onMouseEnter={e => { if (!locked) { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 0 3px ${color}15`; } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <Icon size={14} style={{ color, flexShrink: 0 }} aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Info cards + Contact Sales Agent ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '16px', marginBottom: '28px' }}>

            {/* Business Info */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-4)', marginBottom: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Business Info</div>
              {[
                ['Dealer Code',   dealer?.dealerCode],
                ['Business',      dealer?.businessName],
                ['Category',      dealer?.businessCategory],
                ['Member Since',  dealer?.createdAt ? new Date(dealer.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-4)' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text)', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v || '—'}</span>
                </div>
              ))}
            </div>

            {/* KYC Status */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-4)', marginBottom: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>KYC Status</div>
              {[['KYC', dealer?.kycStatus], ['GST', dealer?.gstNumber || '—'], ['PAN', dealer?.panNumber || '—']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-4)' }}>{k}</span>
                  <span style={{ fontWeight: 600, color: v === 'verified' ? '#10B981' : v === 'rejected' ? '#EF4444' : 'var(--text)' }}>{v || '—'}</span>
                </div>
              ))}
              <Link to="/dealer/profile" style={{ display: 'inline-block', marginTop: '10px', fontSize: '12px', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                Manage Documents
                <FiArrowRight size={11} style={{ marginLeft: '4px', verticalAlign: 'middle' }} aria-hidden="true" />
              </Link>
            </div>

            {/* Contact Sales Agent */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-4)', marginBottom: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your Sales Agent</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                {dealer?.assignedAgent?.name || 'Metro Support Team'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-4)', marginBottom: '14px' }}>
                {dealer?.assignedAgent?.email || 'Available Mon–Sat, 9am–6pm'}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Call', icon: FiPhone,        href: `tel:${dealer?.assignedAgent?.phone || '1800-XXX-XXXX'}`, color: '#10B981' },
                  { label: 'Email', icon: FiMail,        href: `mailto:${dealer?.assignedAgent?.email || 'support@metroappliances.com'}`, color: '#3B82F6' },
                  { label: 'WhatsApp', icon: FiMessageSquare, href: `https://wa.me/${(dealer?.assignedAgent?.phone || '').replace(/\D/g, '')}`, color: '#25D366' },
                ].map(({ label, icon: Icon, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    target={label !== 'Call' ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '6px 10px', borderRadius: '7px',
                      border: `1px solid ${color}30`, background: `${color}0D`,
                      fontSize: '11px', fontWeight: 600, color,
                      textDecoration: 'none', flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${color}1A`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${color}0D`; }}
                  >
                    <Icon size={12} aria-hidden="true" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Recent rows ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* Recent Orders with Quick Reorder */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Recent Orders</div>
                <Link to="/dealer/orders" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>View All</Link>
              </div>
              {!data?.recentOrders?.length ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-4)', fontSize: '13px' }}>No orders yet</div>
              ) : data.recentOrders.map(o => (
                <div key={o._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <Link
                    to={`/dealer/orders/${o._id}`}
                    style={{ textDecoration: 'none', flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{o.orderNumber}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-4)' }}>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>₹{o.totalAmount?.toLocaleString('en-IN')}</div>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: STATUS_COLORS[o.status] || '#6B7280', textTransform: 'capitalize' }}>{o.status}</span>
                    </div>
                  </Link>
                  {/* Quick Reorder — UI only */}
                  {isApproved && (
                    <Link
                      to="/dealer/cart"
                      title={`Reorder #${o.orderNumber}`}
                      aria-label={`Quick reorder for ${o.orderNumber}`}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: '6px', flexShrink: 0,
                        border: '1px solid var(--border)', background: 'var(--bg)',
                        color: 'var(--text-3)', textDecoration: 'none',
                        transition: 'border-color 0.12s, color 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
                    >
                      <FiRefreshCw size={12} aria-hidden="true" />
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Recent Notifications */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Notifications</div>
                <Link to="/dealer/notifications" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>View All</Link>
              </div>
              {!data?.recentNotifications?.length ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-4)', fontSize: '13px' }}>No notifications</div>
              ) : data.recentNotifications.map(n => (
                <div key={n._id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', opacity: n.isRead ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    {!n.isRead && (
                      <span
                        style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: '4px' }}
                        aria-label="Unread"
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{n.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </DealerLayout>
  );
}
