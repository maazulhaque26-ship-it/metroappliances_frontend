import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiMenu, FiBell, FiSearch, FiChevronRight, FiChevronDown,
  FiArrowUpRight, FiLogOut, FiUser, FiPlus, FiUsers, FiPackage,
  FiShoppingBag, FiFileText, FiBriefcase, FiUserPlus,
  FiHelpCircle, FiBook, FiCommand, FiSliders, FiStar,
} from 'react-icons/fi';

const WORKSPACE = { name: 'Metro Appliances ERP', env: 'Production', version: 'v1.0.1' };

const QUICK_ACTIONS = [
  { label: 'New Customer',  path: '/admin/users',                       icon: FiUsers },
  { label: 'New Product',   path: '/admin/products',                    icon: FiPackage },
  { label: 'New Order',     path: '/admin/orders',                      icon: FiShoppingBag },
  { label: 'New Employee',  path: '/admin/hr/employees',                icon: FiUserPlus },
  { label: 'New Vendor',    path: '/admin/procurement/vendors',          icon: FiBriefcase },
  { label: 'New Invoice',   path: '/admin/accounts-receivable/invoices', icon: FiFileText },
];

const NOTIFICATION_META = {
  'order:created':       { icon: FiShoppingBag, text: (p) => `New order ${p?.order?.orderNumber ? `#${p.order.orderNumber}` : ''} placed`,           path: '/admin/orders' },
  'order:statusChanged': { icon: FiShoppingBag, text: (p) => `Order ${p?.order?.orderNumber ? `#${p.order.orderNumber}` : ''} status changed`,        path: '/admin/orders' },
  'review:created':      { icon: FiStar,        text: () => 'New product review submitted',                                                           path: '/admin/reviews' },
};

function useDateTime() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function AdminHeader({
  sidebarOpen, setSidebarOpen,
  sidebarCollapsed, setSidebarCollapsed,
  currentLabel, currentGroup,
  onOpenSearch,
  notifRef, notifOpen, setNotifOpen, unseenCount, setUnseenCount, notifications,
  userRef, userOpen, setUserOpen, user, handleLogout,
}) {
  const navigate = useNavigate();
  const now      = useDateTime();
  const qaRef    = useRef(null);
  const [qaOpen, setQaOpen] = useState(false);

  useEffect(() => {
    const close = (e) => { if (qaRef.current && !qaRef.current.contains(e.target)) setQaOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="sticky top-0 z-20"
      style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}
      role="banner"
    >
      <div className="flex items-center justify-between px-4 lg:px-6 gap-3" style={{ height: '56px' }}>

        {/* ── LEFT ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 min-w-0">

          {/* Mobile: open drawer */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 flex-shrink-0 transition-colors rounded"
            style={{ color: 'var(--text-3)' }}
            aria-label="Open navigation"
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            <FiMenu size={20} strokeWidth={1.75} />
          </button>

          {/* Desktop: collapse sidebar */}
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            className="hidden lg:flex p-1.5 flex-shrink-0 transition-colors rounded"
            style={{ color: 'var(--text-3)' }}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            <FiMenu size={18} strokeWidth={1.75} />
          </button>

          {/* Workspace badge */}
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1 flex-shrink-0"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              fontFamily: 'var(--font-display)',
            }}
          >
            <span className="text-[11.5px] font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              {WORKSPACE.name}
            </span>
            <span className="text-[9px]" style={{ color: 'var(--text-5)' }} aria-hidden="true">/</span>
            <span
              className="text-[9px] font-bold uppercase tracking-[0.12em]"
              style={{ color: 'var(--accent)' }}
            >
              {WORKSPACE.env}
            </span>
            <span className="text-[9px]" style={{ color: 'var(--text-5)' }} aria-hidden="true">/</span>
            <span className="text-[9px] font-medium" style={{ color: 'var(--text-4)' }}>
              {WORKSPACE.version}
            </span>
          </div>

          {/* Separator */}
          <div
            className="hidden md:block w-px h-5 flex-shrink-0"
            style={{ background: 'var(--border)' }}
            aria-hidden="true"
          />

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 min-w-0"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span
              className="hidden sm:inline text-[12.5px] font-medium flex-shrink-0"
              style={{ color: 'var(--text-4)' }}
            >
              Admin
            </span>
            {currentGroup && (
              <>
                <FiChevronRight
                  size={11}
                  className="hidden sm:inline flex-shrink-0"
                  style={{ color: 'var(--text-5)' }}
                  aria-hidden="true"
                />
                <span
                  className="hidden sm:inline text-[12.5px] font-medium flex-shrink-0 truncate"
                  style={{ color: 'var(--text-4)', maxWidth: '110px' }}
                >
                  {currentGroup}
                </span>
              </>
            )}
            <FiChevronRight
              size={11}
              className="hidden sm:inline flex-shrink-0"
              style={{ color: 'var(--text-5)' }}
              aria-hidden="true"
            />
            <span
              className="text-[12.5px] font-semibold truncate"
              style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}
              aria-current="page"
            >
              {currentLabel}
            </span>
          </nav>
        </div>

        {/* ── RIGHT ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 flex-shrink-0">

          {/* Date / Time */}
          <div
            className="hidden xl:flex flex-col items-end mr-2 flex-shrink-0"
            aria-label={`${dateStr} ${timeStr}`}
          >
            <span
              className="text-[12px] font-semibold leading-none"
              style={{ color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}
            >
              {timeStr}
            </span>
            <span className="text-[9.5px] mt-0.5 leading-none" style={{ color: 'var(--text-4)' }}>
              {dateStr}
            </span>
          </div>

          {/* Search trigger — opens full command palette */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 transition-colors"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-3)',
            }}
            aria-label="Open search (Ctrl+K)"
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            <FiSearch size={13} strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden md:inline text-[11.5px]">Search...</span>
            <kbd style={{
              fontSize: 10, padding: '1px 5px', borderRadius: 3,
              background: 'var(--card)', border: '1px solid var(--border)',
              color: 'var(--text-4)', letterSpacing: '0.03em', lineHeight: '16px',
            }}>⌘K</kbd>
          </button>

          {/* Quick Actions */}
          <div className="relative" ref={qaRef}>
            <button
              onClick={() => setQaOpen(o => !o)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-all flex-shrink-0"
              style={{
                color: 'var(--accent)',
                background: 'rgba(255,122,0,0.06)',
                border: '1px solid rgba(255,122,0,0.18)',
                borderRadius: 'var(--radius-sm)',
              }}
              aria-label="Quick create actions"
              aria-expanded={qaOpen}
              aria-haspopup="menu"
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,122,0,0.11)'; e.currentTarget.style.borderColor = 'rgba(255,122,0,0.32)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,122,0,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,122,0,0.18)'; }}
            >
              <FiPlus size={13} strokeWidth={2.5} aria-hidden="true" />
              <span className="hidden lg:inline">Create</span>
            </button>
            {qaOpen && (
              <div
                className="absolute right-0 mt-1.5 w-52 overflow-hidden"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 50,
                }}
                role="menu"
                aria-label="Quick create actions"
              >
                <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--text-4)' }}>
                    Quick Create
                  </p>
                </div>
                {QUICK_ACTIONS.map(a => (
                  <Link
                    key={a.path}
                    to={a.path}
                    role="menuitem"
                    onClick={() => setQaOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-medium transition-colors"
                    style={{ color: 'var(--text-2)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <a.icon size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} aria-hidden="true" />
                    {a.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notification center */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(o => !o); setUnseenCount(0); }}
              className="relative p-1.5 transition-colors rounded"
              style={{ color: 'var(--text-3)' }}
              aria-label={`Notifications${unseenCount > 0 ? `, ${unseenCount} unread` : ''}`}
              aria-expanded={notifOpen}
              aria-haspopup="dialog"
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >
              <FiBell size={17} strokeWidth={1.75} />
              {unseenCount > 0 && (
                <span
                  className="absolute top-0.5 right-0.5 flex items-center justify-center text-white font-bold leading-none"
                  style={{
                    minWidth: '14px',
                    height: '14px',
                    padding: '0 3px',
                    background: '#EF4444',
                    borderRadius: '7px',
                    fontSize: '8px',
                    border: '1.5px solid var(--card)',
                  }}
                  aria-hidden="true"
                >
                  {unseenCount > 9 ? '9+' : unseenCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div
                className="absolute right-0 mt-1.5 w-80 overflow-hidden"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 50,
                }}
                role="dialog"
                aria-label="Notification center"
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <div>
                    <p className="text-[12.5px] font-bold" style={{ color: 'var(--text)' }}>Notifications</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-4)' }}>Real-time activity alerts</p>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      className="text-[10px] font-semibold transition-colors"
                      style={{ color: 'var(--accent)' }}
                      onClick={() => setUnseenCount(0)}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Empty state */}
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 flex flex-col items-center">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-full mb-3"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                    >
                      <FiBell size={16} style={{ color: 'var(--text-4)' }} aria-hidden="true" />
                    </div>
                    <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--text-2)' }}>All caught up</p>
                    <p className="text-[11px] text-center" style={{ color: 'var(--text-4)' }}>
                      No new activity this session.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto no-scrollbar">
                    {notifications.map(n => {
                      const meta = NOTIFICATION_META[n.event];
                      const Icon = meta?.icon || FiBell;
                      return (
                        <button
                          key={n.id}
                          onClick={() => { navigate(meta?.path || '/admin'); setNotifOpen(false); }}
                          className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors"
                          style={{ borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div
                            className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5"
                            style={{ background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.15)' }}
                          >
                            <Icon size={13} style={{ color: 'var(--accent)' }} aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-medium leading-snug" style={{ color: 'var(--text)' }}>
                              {meta?.text(n.payload) || n.event}
                            </p>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-4)' }}>
                              {n.at.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Footer */}
                <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
                  <Link
                    to="/admin/orders"
                    onClick={() => setNotifOpen(false)}
                    className="text-[11px] font-semibold transition-colors"
                    style={{ color: 'var(--accent)' }}
                  >
                    View all activity →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* View Store */}
          <Link
            to="/"
            className="hidden lg:flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-widest px-3 py-1.5 transition-all flex-shrink-0"
            style={{ color: 'var(--text-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg)' }}
            aria-label="View storefront"
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.background = 'var(--bg-2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)'; }}
          >
            Store <FiArrowUpRight size={11} strokeWidth={2.5} aria-hidden="true" />
          </Link>

          {/* User menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserOpen(o => !o)}
              className="flex items-center gap-2 px-1.5 py-1 transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
              aria-label="User menu"
              aria-expanded={userOpen}
              aria-haspopup="menu"
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div
                className="w-7 h-7 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                style={{ background: 'var(--accent)', borderRadius: 'var(--radius-sm)' }}
                aria-hidden="true"
              >
                {user?.name?.[0]?.toUpperCase() || <FiUser size={13} />}
              </div>
              <div className="hidden xl:block text-left leading-none">
                <p className="text-[11.5px] font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                  {user?.name}
                </p>
                <p className="text-[9px] mt-0.5 capitalize" style={{ color: 'var(--text-4)' }}>
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
              <FiChevronDown size={12} style={{ color: 'var(--text-4)' }} aria-hidden="true" />
            </button>
            {userOpen && (
              <div
                className="absolute right-0 mt-1.5 w-60 overflow-hidden"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 50,
                }}
                role="menu"
                aria-label="User menu"
              >
                {/* Profile header */}
                <div className="px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
                      style={{ background: 'var(--accent)', borderRadius: 'var(--radius-sm)' }}
                      aria-hidden="true"
                    >
                      {user?.name?.[0]?.toUpperCase() || <FiUser size={15} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: 'var(--text)' }}>{user?.name}</p>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-4)' }}>{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Primary actions */}
                {[
                  { icon: FiUser,    label: 'Profile' },
                  { icon: FiSliders, label: 'Preferences' },
                  { icon: FiCommand, label: 'Keyboard Shortcuts' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    role="menuitem"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] font-medium transition-colors text-left"
                    style={{ color: 'var(--text-2)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Icon size={14} aria-hidden="true" /> {label}
                  </button>
                ))}

                {/* Help actions */}
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  {[
                    { icon: FiHelpCircle, label: 'Help Center' },
                    { icon: FiBook,       label: 'Documentation' },
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      role="menuitem"
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] font-medium transition-colors text-left"
                      style={{ color: 'var(--text-2)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Icon size={14} aria-hidden="true" /> {label}
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] font-medium transition-colors"
                    style={{ color: '#DC2626' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <FiLogOut size={14} aria-hidden="true" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
