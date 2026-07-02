import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiGrid, FiBriefcase, FiUser, FiLogOut, FiTool,
  FiBell, FiSearch, FiMenu, FiX, FiChevronRight,
} from 'react-icons/fi';
import { technicianLogout } from '../../redux/slices/technicianAuthSlice';
import TechSearch from '../../components/technician/TechSearch';
import TechNotificationDrawer from '../../components/technician/TechNotificationDrawer';

const NAV = [
  { to: '/technician/dashboard', icon: FiGrid,      label: 'Dashboard' },
  { to: '/technician/jobs',      icon: FiBriefcase, label: 'My Jobs' },
  { to: '/technician/profile',   icon: FiUser,      label: 'Profile' },
];

const BREADCRUMB_MAP = {
  '/technician/dashboard': 'Dashboard',
  '/technician/jobs':      'My Jobs',
  '/technician/profile':   'Profile',
};

function getBreadcrumb(pathname) {
  const label = BREADCRUMB_MAP[pathname];
  if (label) return [{ label }];
  if (pathname.startsWith('/technician/jobs/')) return [{ label: 'My Jobs', to: '/technician/jobs' }, { label: 'Job Detail' }];
  return [];
}

export default function TechnicianLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { technician } = useSelector(s => s.technicianAuth);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const crumbs = getBreadcrumb(location.pathname);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = useCallback(async () => {
    await dispatch(technicianLogout());
    navigate('/technician/login');
  }, [dispatch, navigate]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Poppins, sans-serif', background: '#F9FAFB' }}>

      {/* Skip to main content */}
      <a
        href="#main-content"
        style={{
          position: 'absolute', top: 0, left: 8, zIndex: 9999,
          padding: '8px 16px', background: '#fff', border: '2px solid #3B82F6',
          borderRadius: '6px', fontSize: '13px', fontWeight: 600, color: '#3B82F6',
          textDecoration: 'none', transform: 'translateY(-100%)', transition: 'transform 0s',
        }}
        onFocus={e => { e.currentTarget.style.transform = 'translateY(8px)'; }}
        onBlur={e => { e.currentTarget.style.transform = 'translateY(-100%)'; }}
      >
        Skip to main content
      </a>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }}
          className="lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed', top: 0, left: 0, height: '100vh', width: 240, zIndex: 110,
          background: '#111827', display: 'flex', flexDirection: 'column',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}
        className="lg:translate-x-0"
        aria-label="Technician portal navigation"
      >
        {/* Logo area */}
        <div style={{ padding: '20px 16px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div aria-hidden="true" style={{ width: 36, height: 36, background: '#3B82F6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiTool size={16} color="#fff" />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Tech Portal</div>
                <div style={{ color: '#9CA3AF', fontSize: 11, marginTop: 1 }}>{technician?.name || 'Technician'}</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4 }}
              aria-label="Close navigation"
            >
              <FiX size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }} aria-label="Main navigation">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 8, textDecoration: 'none', fontSize: 13, marginBottom: 2,
                color: isActive ? '#fff' : '#9CA3AF',
                fontWeight: isActive ? 600 : 400,
                background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #3B82F6' : '3px solid transparent',
              })}>
              <Icon size={17} aria-hidden="true" />{label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '10px 10px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(239,68,68,0.12)', border: 'none', borderRadius: 8, color: '#FCA5A5', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            <FiLogOut size={16} aria-hidden="true" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content area (offset on desktop) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}
        className="lg:ml-[240px]">

        {/* Sticky portal header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 90,
          background: '#fff', borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 20px', height: 56,
        }}>
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 4, flexShrink: 0 }}
            aria-label="Open navigation"
            aria-expanded={sidebarOpen}
          >
            <FiMenu size={20} aria-hidden="true" />
          </button>

          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>Tech Portal</span>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                <FiChevronRight size={12} color="#D1D5DB" aria-hidden="true" />
                <span
                  style={{ fontSize: 12, color: i === crumbs.length - 1 ? '#111827' : '#6B7280', fontWeight: i === crumbs.length - 1 ? 600 : 400 }}
                  aria-current={i === crumbs.length - 1 ? 'page' : undefined}
                >
                  {c.label}
                </span>
              </React.Fragment>
            ))}
          </nav>

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', color: '#6B7280', fontSize: 12, fontFamily: 'inherit', flexShrink: 0 }}
            aria-label="Open search (Ctrl+K)"
          >
            <FiSearch size={13} aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
            <kbd style={{ background: '#E5E7EB', borderRadius: 4, padding: '1px 5px', fontSize: 10, color: '#9CA3AF' }} className="hidden sm:inline">Ctrl K</kbd>
          </button>

          {/* Bell */}
          <button
            onClick={() => setNotifOpen(true)}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 6, flexShrink: 0 }}
            aria-label="Open notifications"
            aria-expanded={notifOpen}
          >
            <FiBell size={19} aria-hidden="true" />
            <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#EF4444', borderRadius: '50%', border: '2px solid #fff' }} aria-hidden="true" />
          </button>

          {/* Profile */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setProfileOpen(v => !v)}
              style={{ width: 32, height: 32, borderRadius: '50%', background: '#3B82F6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              {technician?.name?.[0]?.toUpperCase() || 'T'}
            </button>
            {profileOpen && (
              <>
                <div onClick={() => setProfileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200 }} aria-hidden="true" />
                <div
                  role="menu"
                  aria-label="Profile menu"
                  style={{ position: 'absolute', right: 0, top: 40, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 180, zIndex: 201, padding: '6px 0' }}
                >
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{technician?.name}</div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{technician?.email}</div>
                  </div>
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 13, fontFamily: 'inherit' }}
                  >
                    <FiLogOut size={14} aria-hidden="true" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <TechSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <TechNotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
