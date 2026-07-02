import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiGrid, FiList, FiUser, FiLogOut, FiTool, FiMapPin,
  FiBell, FiSearch, FiMenu, FiX, FiChevronRight,
} from 'react-icons/fi';
import { engineerLogout } from '../../redux/slices/engineerAuthSlice';
import EngineerSearch from '../../components/engineer/EngineerSearch';
import EngineerNotificationDrawer from '../../components/engineer/EngineerNotificationDrawer';

const NAV = [
  { to: '/engineer/dashboard', icon: FiGrid,    label: 'Dashboard' },
  { to: '/engineer/jobs',      icon: FiList,    label: 'My Jobs' },
  { to: '/engineer/route',     icon: FiMapPin,  label: 'Route' },
  { to: '/engineer/profile',   icon: FiUser,    label: 'Profile' },
];

const BREADCRUMB_MAP = {
  '/engineer/dashboard': 'Dashboard',
  '/engineer/jobs':      'My Installations',
  '/engineer/route':     'Route Planner',
  '/engineer/profile':   'Profile',
};

function getBreadcrumb(pathname) {
  const label = BREADCRUMB_MAP[pathname];
  if (label) return [{ label }];
  if (pathname.startsWith('/engineer/jobs/')) return [{ label: 'My Installations', to: '/engineer/jobs' }, { label: 'Installation Detail' }];
  return [];
}

export default function EngineerLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { engineer } = useSelector(s => s.engineerAuth);

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
    await dispatch(engineerLogout());
    navigate('/engineer/login');
  }, [dispatch, navigate]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Poppins, sans-serif', background: '#F9FAFB' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 }}
          className="lg:hidden" />
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', width: 240, zIndex: 110,
        background: '#064E3B', display: 'flex', flexDirection: 'column',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }}
        className="lg:translate-x-0">

        {/* Logo area */}
        <div style={{ padding: '20px 16px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#059669', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiTool size={16} color="#fff" />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Engineer Portal</div>
                <div style={{ color: '#6EE7B7', fontSize: 11, marginTop: 1 }}>{engineer?.name || 'Engineer'}</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden"
              style={{ background: 'none', border: 'none', color: '#6EE7B7', cursor: 'pointer', padding: 4 }}>
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                borderRadius: 8, textDecoration: 'none', fontSize: 13, marginBottom: 2,
                color: isActive ? '#fff' : '#A7F3D0',
                fontWeight: isActive ? 600 : 400,
                background: isActive ? 'rgba(5,150,105,0.2)' : 'transparent',
                borderLeft: isActive ? '3px solid #34D399' : '3px solid transparent',
              })}>
              <Icon size={17} />{label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '10px 10px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(239,68,68,0.12)', border: 'none', borderRadius: 8, color: '#FCA5A5', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            <FiLogOut size={16} /> Logout
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
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', padding: 4, flexShrink: 0 }}>
            <FiMenu size={20} />
          </button>

          {/* Breadcrumb */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>Engineer Portal</span>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                <FiChevronRight size={12} color="#D1D5DB" />
                <span style={{ fontSize: 12, color: i === crumbs.length - 1 ? '#111827' : '#6B7280', fontWeight: i === crumbs.length - 1 ? 600 : 400 }}>
                  {c.label}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Search trigger */}
          <button onClick={() => setSearchOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', color: '#6B7280', fontSize: 12, fontFamily: 'inherit', flexShrink: 0 }}>
            <FiSearch size={13} />
            <span className="hidden sm:inline">Search</span>
            <kbd style={{ background: '#E5E7EB', borderRadius: 4, padding: '1px 5px', fontSize: 10, color: '#9CA3AF' }} className="hidden sm:inline">Ctrl K</kbd>
          </button>

          {/* Bell */}
          <button onClick={() => setNotifOpen(true)}
            style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 6, flexShrink: 0 }}>
            <FiBell size={19} />
            <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#EF4444', borderRadius: '50%', border: '2px solid #fff' }} />
          </button>

          {/* Profile */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => setProfileOpen(v => !v)}
              style={{ width: 32, height: 32, borderRadius: '50%', background: '#059669', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }}>
              {engineer?.name?.[0]?.toUpperCase() || 'E'}
            </button>
            {profileOpen && (
              <>
                <div onClick={() => setProfileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
                <div style={{ position: 'absolute', right: 0, top: 40, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', minWidth: 180, zIndex: 201, padding: '6px 0' }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{engineer?.name}</div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{engineer?.email}</div>
                  </div>
                  <button onClick={handleLogout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 13, fontFamily: 'inherit' }}>
                    <FiLogOut size={14} /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      <EngineerSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <EngineerNotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
