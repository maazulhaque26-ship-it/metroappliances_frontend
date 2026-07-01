import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiGrid, FiClock, FiCalendar, FiDollarSign, FiTrendingUp, FiBook,
  FiBell, FiStar, FiMessageSquare, FiLogOut, FiMenu, FiX, FiSearch,
  FiUser, FiChevronDown, FiChevronRight,
} from 'react-icons/fi';
import { employeeLogout } from '../../redux/slices/employeeAuthSlice';
import ESSSearch from '../../components/employee/ESSSearch';
import ESSNotificationDrawer from '../../components/employee/ESSNotificationDrawer';

const NAV = [
  { to: '/employee/dashboard',     label: 'Dashboard',      icon: FiGrid },
  { to: '/employee/attendance',    label: 'My Attendance',  icon: FiClock },
  { to: '/employee/leave',         label: 'My Leave',       icon: FiCalendar },
  { to: '/employee/payslips',      label: 'My Payslips',    icon: FiDollarSign },
  { to: '/employee/performance',   label: 'My Performance', icon: FiTrendingUp },
  { to: '/employee/training',      label: 'My Training',    icon: FiBook },
  { divider: 'Communications' },
  { to: '/employee/announcements', label: 'Announcements',  icon: FiBell },
  { to: '/employee/recognition',   label: 'Recognition',    icon: FiStar },
  { to: '/employee/feedback',      label: 'Feedback',       icon: FiMessageSquare },
];

const BREADCRUMB_MAP = {
  '/employee/dashboard':     'Dashboard',
  '/employee/attendance':    'My Attendance',
  '/employee/leave':         'My Leave',
  '/employee/payslips':      'My Payslips',
  '/employee/performance':   'My Performance',
  '/employee/training':      'My Training',
  '/employee/announcements': 'Announcements',
  '/employee/recognition':   'Recognition',
  '/employee/feedback':      'Feedback',
};

export default function EmployeeLayout() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { employee } = useSelector(s => s.employeeAuth);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setSidebarOpen(false); setProfileOpen(false); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    setProfileOpen(false);
    await dispatch(employeeLogout());
    navigate('/employee/login');
  };

  const breadcrumb  = BREADCRUMB_MAP[location.pathname] || '';
  const displayName = employee?.name || employee?.firstName || 'Employee';
  const initials    = displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-body,Poppins,sans-serif)', background: 'var(--bg,#F9FAFB)' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 49 }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: '240px', background: '#111827', borderRight: '1px solid rgba(255,255,255,0.06)' }}
        aria-label="ESS navigation"
      >
        {/* Brand */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{ width: 34, height: 34, background: 'var(--accent,#FF7A00)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FiUser size={16} style={{ color: '#fff' }} aria-hidden="true" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '13px', lineHeight: 1.2 }}>ESS Portal</div>
              <div style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                {displayName}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            style={{ border: 'none', background: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
            aria-label="Close sidebar"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }} aria-label="ESS pages">
          {NAV.map((item, idx) => {
            if (item.divider) {
              return (
                <div key={idx} style={{ padding: '14px 10px 4px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>
                  {item.divider}
                </div>
              );
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-current={location.pathname === item.to ? 'page' : undefined}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '9px',
                  padding: isActive ? '9px 10px 9px 7px' : '9px 10px',
                  borderRadius: '7px',
                  color: isActive ? '#fff' : '#9CA3AF',
                  background: isActive ? 'rgba(255,122,0,0.15)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent,#FF7A00)' : '3px solid transparent',
                  textDecoration: 'none', fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  marginBottom: '1px',
                  transition: 'background 0.15s, color 0.15s',
                })}
              >
                <Icon size={15} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 10px', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: '7px', color: '#FCA5A5', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
          >
            <FiLogOut size={14} aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[240px]">

        {/* Portal header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--card,#fff)', borderBottom: '1px solid var(--border,#E5E7EB)', height: '56px', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '12px', flexShrink: 0 }}>

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-2,#374151)', padding: '4px', display: 'flex', alignItems: 'center' }}
            aria-label="Open navigation menu"
          >
            <FiMenu size={20} />
          </button>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)', fontWeight: 500, whiteSpace: 'nowrap' }}>ESS</span>
            {breadcrumb && (
              <>
                <FiChevronRight size={12} style={{ color: 'var(--text-4,#9CA3AF)', flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text,#111)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {breadcrumb}
                </span>
              </>
            )}
          </div>

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid var(--border,#E5E7EB)', borderRadius: '8px', background: 'var(--bg,#F9FAFB)', cursor: 'pointer', color: 'var(--text-4,#9CA3AF)', fontSize: '12px', fontFamily: 'inherit', flexShrink: 0 }}
            aria-label="Search ESS pages — Ctrl K"
          >
            <FiSearch size={13} aria-hidden="true" />
            <span className="hidden sm:inline">Search…</span>
            <kbd style={{ padding: '1px 5px', background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '4px', fontSize: '10px', fontFamily: 'inherit' }}>Ctrl K</kbd>
          </button>

          {/* Bell */}
          <button
            onClick={() => setNotifOpen(true)}
            style={{ width: '34px', height: '34px', border: 'none', background: 'var(--bg,#F9FAFB)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-2,#374151)', flexShrink: 0 }}
            aria-label="Open announcements"
          >
            <FiBell size={17} />
          </button>

          {/* Profile */}
          <div ref={profileRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setProfileOpen(o => !o)}
              aria-expanded={profileOpen}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
              aria-label="Open profile menu"
            >
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent,#FF7A00)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <FiChevronDown size={13} style={{ color: 'var(--text-4,#9CA3AF)' }} className="hidden sm:block" aria-hidden="true" />
            </button>

            {profileOpen && (
              <div style={{ position: 'absolute', top: '42px', right: 0, background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: '200px', zIndex: 100, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border,#E5E7EB)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text,#111)' }}>{displayName}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)', marginTop: '2px' }}>
                    {employee?.employeeCode || employee?.email || ''}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#EF4444', fontFamily: 'inherit', textAlign: 'left' }}
                >
                  <FiLogOut size={14} aria-hidden="true" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>

      <ESSSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ESSNotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
