import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FiGrid, FiPackage, FiShoppingCart, FiFileText, FiBell,
  FiBarChart2, FiCreditCard, FiFile, FiList, FiArrowUpRight,
  FiZap, FiTag, FiUser, FiLogOut, FiLock,
  FiMenu, FiX, FiSearch, FiChevronRight,
} from 'react-icons/fi';
import { dealerLogout } from '../../redux/slices/dealerAuthSlice';
import { fetchDealerCart } from '../../redux/slices/dealerCartSlice';
import dealerAPI from '../../services/dealerAPI';
import DealerSearch from './DealerSearch';
import DealerNotificationDrawer from './DealerNotificationDrawer';

const NAV = [
  { label: 'Dashboard',     path: '/dealer/dashboard',              icon: FiGrid },
  { label: 'Products',      path: '/dealer/products',               icon: FiPackage },
  { label: 'My Cart',       path: '/dealer/cart',                   icon: FiShoppingCart, badge: 'cart' },
  { label: 'My Orders',     path: '/dealer/orders',                 icon: FiFileText },
  { label: 'Notifications', path: '/dealer/notifications',          icon: FiBell,         badge: 'notif' },
  { divider: 'Finance' },
  { label: 'Finance',       path: '/dealer/finance',                icon: FiBarChart2 },
  { label: 'Wallet',        path: '/dealer/finance/wallet',         icon: FiCreditCard },
  { label: 'Invoices',      path: '/dealer/finance/invoices',       icon: FiFile },
  { label: 'Ledger',        path: '/dealer/finance/ledger',         icon: FiList },
  { label: 'Payments',      path: '/dealer/finance/payments',       icon: FiArrowUpRight },
  { label: 'Credit',        path: '/dealer/finance/credit',         icon: FiZap },
  { label: 'Credit Notes',  path: '/dealer/finance/credit-notes',   icon: FiTag },
  { divider: 'Account' },
  { label: 'My Profile',    path: '/dealer/profile',                icon: FiUser },
];

const BREADCRUMB_MAP = {
  '/dealer/dashboard':            [{ label: 'Dashboard' }],
  '/dealer/products':             [{ label: 'Products' }],
  '/dealer/cart':                 [{ label: 'My Cart' }],
  '/dealer/orders':               [{ label: 'My Orders' }],
  '/dealer/notifications':        [{ label: 'Notifications' }],
  '/dealer/finance':              [{ label: 'Finance Overview' }],
  '/dealer/finance/wallet':       [{ label: 'Finance', to: '/dealer/finance' }, { label: 'Wallet' }],
  '/dealer/finance/invoices':     [{ label: 'Finance', to: '/dealer/finance' }, { label: 'Invoices' }],
  '/dealer/finance/ledger':       [{ label: 'Finance', to: '/dealer/finance' }, { label: 'Ledger' }],
  '/dealer/finance/payments':     [{ label: 'Finance', to: '/dealer/finance' }, { label: 'Payments' }],
  '/dealer/finance/credit':       [{ label: 'Finance', to: '/dealer/finance' }, { label: 'Credit' }],
  '/dealer/finance/credit-notes': [{ label: 'Finance', to: '/dealer/finance' }, { label: 'Credit Notes' }],
  '/dealer/profile':              [{ label: 'My Profile' }],
};

function getBreadcrumb(pathname) {
  if (BREADCRUMB_MAP[pathname]) return BREADCRUMB_MAP[pathname];
  if (pathname.startsWith('/dealer/orders/'))
    return [{ label: 'My Orders', to: '/dealer/orders' }, { label: 'Order Detail' }];
  if (pathname.startsWith('/dealer/products/'))
    return [{ label: 'Products', to: '/dealer/products' }, { label: 'Product Detail' }];
  if (pathname.startsWith('/dealer/finance/invoices/'))
    return [{ label: 'Finance', to: '/dealer/finance' }, { label: 'Invoices', to: '/dealer/finance/invoices' }, { label: 'Invoice Detail' }];
  return [{ label: 'Dealer Portal' }];
}

const STATUS_BADGE = {
  pending:   { color: '#F59E0B', label: 'Pending' },
  approved:  { color: '#10B981', label: 'Approved' },
  rejected:  { color: '#EF4444', label: 'Rejected' },
  suspended: { color: '#6B7280', label: 'Suspended' },
};

export default function DealerLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { dealer } = useSelector(s => s.dealerAuth);
  const { cart }   = useSelector(s => s.dealerCart);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef(null);
  const cartCount  = cart?.items?.length || 0;

  useEffect(() => {
    if (dealer?.status === 'approved') dispatch(fetchDealerCart());
  }, [dealer?.status, dispatch]);

  useEffect(() => {
    dealerAPI.get('/dealer/notifications/unread-count')
      .then(r => setUnreadCount(r.data.count || 0))
      .catch(() => {});
  }, [location.pathname]);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Escape closes sidebar
  useEffect(() => {
    if (!sidebarOpen) return;
    const h = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [sidebarOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [profileOpen]);

  const handleLogout = useCallback(async () => {
    await dispatch(dealerLogout());
    navigate('/dealer/login');
  }, [dispatch, navigate]);

  const sb          = STATUS_BADGE[dealer?.status] || STATUS_BADGE.suspended;
  const breadcrumb  = getBreadcrumb(location.pathname);
  const pageTitle   = breadcrumb[breadcrumb.length - 1]?.label || 'Dealer Portal';

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--bg)', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={[
          'fixed top-0 left-0 bottom-0 z-50 flex flex-col',
          'transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{
          width: '240px',
          background: 'var(--card)',
          borderRight: '1px solid var(--border)',
        }}
        aria-label="Dealer portal navigation"
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 flex-shrink-0"
          style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)' }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '8px', flexShrink: 0,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '12px', letterSpacing: '0.02em',
          }}>
            B2B
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
              Dealer Portal
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-4)', marginTop: '1px' }}>
              Metro Appliances
            </div>
          </div>
          <button
            className="lg:hidden flex-shrink-0"
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-3)', borderRadius: '6px' }}
            aria-label="Close navigation"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Dealer info */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {dealer?.businessName || 'Business Name'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-4)', marginBottom: '7px' }}>
            {dealer?.dealerCode || '—'}
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '2px 9px', borderRadius: '100px',
            background: sb.color + '1A', color: sb.color,
            fontSize: '10px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {sb.label}
          </span>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto"
          style={{ padding: '10px' }}
          aria-label="Main navigation"
        >
          {NAV.map((item, idx) => {
            if (item.divider) {
              return (
                <div
                  key={`d-${idx}`}
                  style={{
                    padding: '10px 10px 4px',
                    fontSize: '9px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    color: 'var(--text-4)',
                  }}
                >
                  {item.divider}
                </div>
              );
            }

            const isFinance      = item.path?.startsWith('/dealer/finance');
            const isCommerceLocked = ['Products', 'My Cart', 'My Orders'].includes(item.label);
            const isLocked       = (isCommerceLocked || isFinance) && dealer?.status !== 'approved';

            const isActive = item.path === '/dealer/finance'
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

            const badgeCount = item.badge === 'cart' ? cartCount : item.badge === 'notif' ? unreadCount : 0;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={isLocked || undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: '9px',
                  padding: '8px 10px', borderRadius: '7px', marginBottom: '1px',
                  textDecoration: 'none',
                  background:  isActive ? 'rgba(255,122,0,0.08)' : 'transparent',
                  color:       isActive ? 'var(--accent)' : isLocked ? 'var(--text-5, var(--text-4))' : 'var(--text-2)',
                  fontSize: '13px', fontWeight: isActive ? 600 : 500,
                  cursor:    isLocked ? 'not-allowed' : 'pointer',
                  opacity:   isLocked ? 0.55 : 1,
                  pointerEvents: isLocked ? 'none' : undefined,
                  transition: 'background 0.12s, color 0.12s',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                }}
              >
                <Icon size={15} strokeWidth={isActive ? 2.2 : 1.75} aria-hidden="true" />
                <span style={{ flex: 1 }}>{item.label}</span>
                {badgeCount > 0 && (
                  <span style={{
                    background: 'var(--accent)', color: '#fff',
                    borderRadius: '100px', padding: '1px 6px',
                    fontSize: '10px', fontWeight: 700, flexShrink: 0,
                  }}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
                {isLocked && <FiLock size={11} aria-hidden="true" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '10px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2"
            style={{
              padding: '9px 12px', borderRadius: '7px',
              border: '1px solid var(--border)',
              background: 'transparent', cursor: 'pointer',
              color: 'var(--text-3)', fontSize: '13px', fontWeight: 500,
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            <FiLogOut size={14} aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[240px]">

        {/* Portal Header */}
        <header
          className="sticky top-0 z-30 flex-shrink-0"
          style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
        >
          <div
            style={{
              height: '56px', padding: '0 20px 0 16px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            {/* Hamburger */}
            <button
              className="lg:hidden flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text)', borderRadius: '6px' }}
              aria-label="Open navigation"
              aria-expanded={sidebarOpen}
            >
              <FiMenu size={18} />
            </button>

            {/* Breadcrumb — desktop */}
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1 flex-1 min-w-0">
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
                Dealer Portal
              </span>
              {breadcrumb.map((crumb, i) => (
                <React.Fragment key={i}>
                  <FiChevronRight size={11} style={{ color: 'var(--text-5, var(--text-4))', flexShrink: 0 }} aria-hidden="true" />
                  {crumb.to ? (
                    <NavLink
                      to={crumb.to}
                      style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-3)', textDecoration: 'none', flexShrink: 0 }}
                    >
                      {crumb.label}
                    </NavLink>
                  ) : (
                    <span
                      aria-current="page"
                      style={{
                        fontSize: '12px', fontWeight: 700, color: 'var(--text)',
                        flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        maxWidth: '200px',
                      }}
                    >
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>

            {/* Page title — mobile */}
            <div className="sm:hidden flex-1 min-w-0">
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pageTitle}
              </span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 flex-shrink-0">

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden sm:flex items-center gap-1.5"
                style={{
                  background: 'none', border: '1px solid var(--border)',
                  cursor: 'pointer', padding: '6px 10px', borderRadius: '7px',
                  color: 'var(--text-3)', fontSize: '12px', fontWeight: 500,
                  transition: 'border-color 0.12s, color 0.12s',
                }}
                aria-label="Search"
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
              >
                <FiSearch size={13} aria-hidden="true" />
                <span>Search</span>
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                className="sm:hidden"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '7px', borderRadius: '7px', color: 'var(--text-3)' }}
                aria-label="Search"
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-3)'; }}
              >
                <FiSearch size={16} />
              </button>

              {/* Notifications */}
              <button
                onClick={() => setNotifOpen(true)}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '7px', borderRadius: '7px', color: 'var(--text-3)' }}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-3)'; }}
              >
                <FiBell size={16} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute', top: '4px', right: '4px',
                      minWidth: '16px', height: '16px', borderRadius: '50%',
                      background: 'var(--accent)', color: '#fff',
                      fontSize: '9px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid var(--card)',
                    }}
                    aria-hidden="true"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile dropdown */}
              <div ref={profileRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(o => !o)}
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: '2px solid var(--border)',
                    background: 'var(--accent)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '12px', fontWeight: 700, flexShrink: 0,
                  }}
                >
                  {dealer?.ownerName?.[0]?.toUpperCase() || 'D'}
                </button>

                {profileOpen && (
                  <div
                    style={{
                      position: 'absolute', right: 0, top: '40px', zIndex: 50,
                      background: 'var(--card)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md, 10px)',
                      boxShadow: 'var(--shadow-md, 0 8px 24px rgba(0,0,0,0.1))',
                      minWidth: '220px', overflow: 'hidden',
                    }}
                    role="menu"
                  >
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                        {dealer?.ownerName || 'Dealer'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '2px' }}>
                        {dealer?.email || ''}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '1px' }}>
                        {dealer?.businessName || ''}
                      </div>
                    </div>
                    <div style={{ padding: '6px' }}>
                      <NavLink
                        to="/dealer/profile"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 10px', borderRadius: '6px',
                          textDecoration: 'none', fontSize: '13px', color: 'var(--text-2)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <FiUser size={14} aria-hidden="true" />
                        My Profile
                      </NavLink>
                    </div>
                    <div style={{ padding: '6px', borderTop: '1px solid var(--border)' }}>
                      <button
                        role="menuitem"
                        onClick={() => { setProfileOpen(false); handleLogout(); }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 10px', borderRadius: '6px',
                          border: 'none', background: 'transparent',
                          cursor: 'pointer', fontSize: '13px', color: '#EF4444', textAlign: 'left',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <FiLogOut size={14} aria-hidden="true" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1"
          style={{
            padding: '24px',
            maxWidth: '1200px', width: '100%',
            margin: '0 auto', boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>

      {/* Search overlay */}
      {searchOpen && <DealerSearch onClose={() => setSearchOpen(false)} />}

      {/* Notification drawer */}
      <DealerNotificationDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onCountChange={setUnreadCount}
      />
    </div>
  );
}
