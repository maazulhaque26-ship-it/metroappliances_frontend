import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth, logout } from '../../redux/slices/authSlice';
import useAdminSocket from '../../hooks/useAdminSocket';
import { FiX, FiLogOut } from 'react-icons/fi';
import Logo from '../../components/ui/Logo';
import { DOMAIN_GROUPS } from './AdminDomainConfig';
import { NAV_GROUPS, ALL_ITEMS } from './AdminNavConfig';
import AdminDomainRail from './AdminDomainRail';
import AdminModuleSidebar from './AdminModuleSidebar';
import AdminHeader from './AdminHeader';
import SearchDialog from './search/SearchDialog';

const SIDEBAR_BG = '#0C0C0C';

const PAGE_DESCRIPTIONS = {
  '/admin':                                    'Enterprise overview — key metrics, live activity, and system health.',
  '/admin/products':                           'Browse, create, and manage your entire product catalog.',
  '/admin/categories':                         'Organize products into hierarchical categories for easy navigation.',
  '/admin/orders':                             'Monitor and process customer orders end-to-end.',
  '/admin/users':                              'View and manage registered customer accounts and profiles.',
  '/admin/finance':                            'Financial overview — general ledger, P&L, and cash flow at a glance.',
  '/admin/accounts-payable':                   'Manage vendor bills, payment runs, and AP aging.',
  '/admin/accounts-receivable':                'Track customer invoices, receipts, collections, and AR aging.',
  '/admin/tax':                                'GST, TDS, compliance calendar, e-invoice, and e-way bill management.',
  '/admin/banking':                            'Bank accounts, reconciliation, treasury, and cash forecasting.',
  '/admin/cfo':                                'CFO executive dashboard — budgets, forecasts, and financial KPIs.',
  '/admin/hr':                                 'People & HR overview — headcount, attendance, and payroll at a glance.',
  '/admin/manufacturing':                      'Manufacturing operations — factories, work centers, BOMs, and production orders.',
  '/admin/manufacturing/planning':             'Production planning — master schedule, capacity, and scheduling board.',
  '/admin/mrp':                                'Material Requirements Planning — runs, shortages, and purchase/production suggestions.',
  '/admin/mes':                                'Manufacturing Execution — work orders, OEE tracking, and production events.',
  '/admin/qms':                                'Quality Management System — inspection plans, CAPA, and audit programs.',
  '/admin/eam':                                'Enterprise Asset Management — maintenance plans, work orders, and condition monitoring.',
  '/admin/warehouse':                          'Warehouse overview — zones, locations, and inventory control.',
  '/admin/inventory':                          'Inventory management — stock levels, transactions, GRN, and cycle counts.',
  '/admin/procurement':                        'Procurement dashboard — vendors, purchase orders, and approval queues.',
  '/admin/logistics':                          'Dispatch, shipments, couriers, and stock transfers.',
  '/admin/barcodes':                           'Barcode generation, label printing, bin management, and scanner activity.',
  '/admin/iot':                                'IoT & Industry 4.0 — devices, sensors, RFID, and automation rules.',
  '/admin/service':                            'After-sales service — requests, technicians, warranty, and spare parts.',
  '/admin/installation':                       'Installation management — requests, engineers, and product registrations.',
  '/admin/projects/dashboard':                 'Project management overview — status, milestones, and resource utilization.',
  '/admin/portfolio/dashboard':                'Portfolio (PPM) overview — programs, initiatives, and portfolio finance.',
  '/admin/pmo/dashboard':                      'PMO governance — compliance, business cases, scorecards, and audits.',
  '/admin/bpm/dashboard':                      'Business Process Management — workflow instances, approvals, and SLA tracking.',
  '/admin/dms/dashboard':                      'Document management — library, templates, review queue, and knowledge base.',
  '/admin/bi-exec/dashboard':                  'Executive BI — KPIs, board reports, department analytics, and benchmarks.',
  '/admin/ai/dashboard':                       'AI & Forecasting — predictions, anomaly detection, and scenario modeling.',
  '/admin/ai-copilot/dashboard':               'AI Copilot — executive briefings, AI chat, insights, and automation center.',
  '/admin/dealers':                            'Manage dealer accounts, pricing, orders, wallets, and credit lines.',
  '/admin/sales-agents':                       'CRM sales agents — territories, leads, visit reports, and assignments.',
  '/admin/bi/dashboard':                       'Business intelligence — revenue, sales, agent performance, and territory analytics.',
  '/admin/audit-log':                          'Enterprise audit trail — all system actions with user and timestamp.',
  '/admin/settings':                           'Store configuration — general settings, integrations, and preferences.',
  '/admin/management':                         'Admin user management — roles, permissions, and access control.',
};

function getPageDescription(path, label, group) {
  if (PAGE_DESCRIPTIONS[path]) return PAGE_DESCRIPTIONS[path];
  if (label.toLowerCase().includes('dashboard')) return `Overview and analytics for the ${group || label} module.`;
  if (label.toLowerCase().includes('report')) return `Reports and data exports for ${group || label}.`;
  if (label.toLowerCase().includes('setting')) return `Configuration and settings for the ${group || label} module.`;
  return `Manage ${label.toLowerCase()} — ${group ? group + ' module' : 'Admin Panel'}.`;
}

function findDomainForPath(pathname) {
  for (const [domainId, groupLabels] of Object.entries(DOMAIN_GROUPS)) {
    for (const groupLabel of groupLabels) {
      const group = NAV_GROUPS.find(g => g.label === groupLabel);
      if (!group) continue;
      for (const item of group.items) {
        const hit = item.path === '/admin'
          ? pathname === '/admin'
          : pathname.startsWith(item.path);
        if (hit) return domainId;
      }
    }
  }
  return 'commerce';
}

export default function AdminLayout({ children }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useSelector(s => s.auth);
  const [sidebarOpen,       setSidebarOpen]       = useState(false);
  const [searchDialogOpen,  setSearchDialogOpen]  = useState(false);
  const [notifOpen,         setNotifOpen]         = useState(false);
  const [notifications,     setNotifications]     = useState([]);
  const [unseenCount,       setUnseenCount]       = useState(0);
  const [userOpen,          setUserOpen]          = useState(false);
  const [activeDomain,      setActiveDomain]      = useState(() => findDomainForPath(location.pathname));
  const [sidebarCollapsed,  setSidebarCollapsed]  = useState(false);

  const notifRef = useRef(null);
  const userRef  = useRef(null);

  const handleLogout = () => { dispatch(clearAuth()); dispatch(logout()); navigate('/'); };
  const isActive = (path) => path === '/admin'
    ? location.pathname === '/admin'
    : location.pathname.startsWith(path);

  const visibleGroups = NAV_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => !i.roles || i.roles.includes(user?.role)) }))
    .filter(g => g.items.length > 0);

  const currentItem  = ALL_ITEMS.find(i => isActive(i.path));
  const currentLabel = currentItem?.label || 'Admin';
  const currentGroup = visibleGroups.find(g => g.items.includes(currentItem))?.label;

  useAdminSocket({
    'order:created':       (p) => pushNotification('order:created', p),
    'order:statusChanged': (p) => pushNotification('order:statusChanged', p),
    'review:created':      (p) => pushNotification('review:created', p),
  });

  function pushNotification(event, payload) {
    setNotifications(prev => [{ id: `${event}-${Date.now()}`, event, payload, at: new Date() }, ...prev].slice(0, 8));
    setUnseenCount(c => c + 1);
  }

  useEffect(() => {
    const close = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // Track recently visited pages for the search dialog home state
  useEffect(() => {
    setActiveDomain(findDomainForPath(location.pathname));
    const match = ALL_ITEMS.find(i =>
      i.path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(i.path)
    );
    if (match) {
      try {
        const prev = JSON.parse(localStorage.getItem('ma_erp_recent_pages')) || [];
        const entry = { label: match.label, path: match.path };
        const next = [entry, ...prev.filter(p => p.path !== match.path)].slice(0, 15);
        localStorage.setItem('ma_erp_recent_pages', JSON.stringify(next));
      } catch {}
    }
  }, [location.pathname]);

  // CTRL+K global shortcut opens the search dialog
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchDialogOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const domainGroupLabels = DOMAIN_GROUPS[activeDomain] || [];
  const domainNavGroups   = visibleGroups.filter(g => domainGroupLabels.includes(g.label));

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 flex overflow-hidden transition-[width,transform] duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          width: sidebarCollapsed ? '48px' : '268px',
          background: SIDEBAR_BG,
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
        aria-label="Admin navigation"
      >
        {/* Domain Rail — 48px, full height */}
        <AdminDomainRail activeDomain={activeDomain} onSelect={setActiveDomain} />

        {/* Module column — fills remaining width */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ minWidth: 0 }}>

          {/* Logo area */}
          <div
            className="flex items-center justify-between px-5 flex-shrink-0"
            style={{ height: '92px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Logo imageClass="h-12 w-auto" />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-white/50 hover:text-white flex-shrink-0">
              <FiX size={18} />
            </button>
          </div>

          {/* Role badge */}
          {user?.role && (
            <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span
                className="text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1"
                style={{
                  color: 'var(--accent)',
                  background: 'rgba(255,138,0,0.1)',
                  border: '1px solid rgba(255,138,0,0.18)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {user.role.replace('_', ' ')}
              </span>
            </div>
          )}

          {/* Module nav — scrollable, accordion grouped */}
          <AdminModuleSidebar
            groups={domainNavGroups}
            isActive={isActive}
            onNavigate={() => setSidebarOpen(false)}
            pathname={location.pathname}
          />

          {/* User footer */}
          <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3 px-3 py-3 mb-2" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
              <div className="w-7 h-7 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0" style={{ background: 'var(--accent)', borderRadius: 'var(--radius-sm)' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold truncate" style={{ color: '#fff' }}>{user?.name}</p>
                <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-[12px] font-medium transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.35)', borderRadius: 'var(--radius-sm)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <FiLogOut size={13} strokeWidth={1.75} /> Sign Out
            </button>
          </div>

        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 lg:hidden" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className={`flex-1 min-w-0 flex flex-col transition-[margin-left] duration-200 ${sidebarCollapsed ? 'lg:ml-12' : 'lg:ml-[268px]'}`}>

        {/* Enterprise Header */}
        <AdminHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          currentLabel={currentLabel}
          currentGroup={currentGroup}
          onOpenSearch={() => setSearchDialogOpen(true)}
          notifRef={notifRef}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          unseenCount={unseenCount}
          setUnseenCount={setUnseenCount}
          notifications={notifications}
          userRef={userRef}
          userOpen={userOpen}
          setUserOpen={setUserOpen}
          user={user}
          handleLogout={handleLogout}
        />

        {/* Dynamic Page Header */}
        <div
          className="px-6 lg:px-10 pt-7 pb-5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}
        >
          <h1
            className="text-[22px] font-bold tracking-tight leading-none"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
          >
            {currentLabel}
          </h1>
          <p
            className="text-[13px] mt-2 leading-relaxed"
            style={{ color: 'var(--text-3)', maxWidth: '60ch' }}
          >
            {getPageDescription(location.pathname, currentLabel, currentGroup)}
          </p>
        </div>

        {/* Page content */}
        <div className="flex-1 p-6 lg:p-10" style={{ maxWidth: '80rem' }}>
          {children}
        </div>
      </main>

      {/* Global Search Dialog */}
      <SearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        user={user}
      />
    </div>
  );
}
