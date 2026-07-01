import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiGrid, FiShoppingBag, FiDollarSign, FiUsers, FiPackage,
  FiFolder, FiBarChart2, FiCpu, FiStar, FiPlus, FiX, FiCheck,
} from 'react-icons/fi';
import WorkspaceSection from './WorkspaceSection';

const FAVORITES_KEY = 'ma_erp_workspace_favorites';

const DEFAULT_FAVORITES = [
  { label: 'Dashboard',         path: '/admin',                   icon: 'FiGrid' },
  { label: 'Orders',            path: '/admin/orders',            icon: 'FiShoppingBag' },
  { label: 'Finance',           path: '/admin/finance',           icon: 'FiDollarSign' },
  { label: 'HR Dashboard',      path: '/admin/hr',                icon: 'FiUsers' },
  { label: 'Inventory',         path: '/admin/inventory',         icon: 'FiPackage' },
  { label: 'Projects',          path: '/admin/projects',          icon: 'FiFolder' },
  { label: 'BI Dashboard',      path: '/admin/bi-exec/dashboard', icon: 'FiBarChart2' },
  { label: 'Manufacturing',     path: '/admin/manufacturing',     icon: 'FiCpu' },
];

const ALL_PINNABLE = [
  ...DEFAULT_FAVORITES,
  { label: 'Products',          path: '/admin/products',          icon: 'FiPackage' },
  { label: 'Customers',         path: '/admin/users',             icon: 'FiUsers' },
  { label: 'Warehouse',         path: '/admin/warehouse',         icon: 'FiGrid' },
  { label: 'Procurement',       path: '/admin/procurement',       icon: 'FiShoppingBag' },
  { label: 'CFO Dashboard',     path: '/admin/cfo',               icon: 'FiBarChart2' },
  { label: 'AI Copilot',        path: '/admin/ai-copilot/dashboard', icon: 'FiCpu' },
  { label: 'Tax Management',    path: '/admin/tax',               icon: 'FiDollarSign' },
  { label: 'Payroll',           path: '/admin/hr/payroll',        icon: 'FiDollarSign' },
];

const ICON_MAP = {
  FiGrid: FiGrid, FiShoppingBag: FiShoppingBag, FiDollarSign: FiDollarSign,
  FiUsers: FiUsers, FiPackage: FiPackage, FiFolder: FiFolder,
  FiBarChart2: FiBarChart2, FiCpu: FiCpu,
};

function readFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || DEFAULT_FAVORITES; } catch { return DEFAULT_FAVORITES; }
}
function saveFavorites(favs) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs)); } catch {}
}

const FavoriteModules = React.memo(function FavoriteModules() {
  const navigate    = useNavigate();
  const [favs,     setFavs]   = useState(() => readFavorites());
  const [picking,  setPicking] = useState(false);
  const [dragIdx,  setDragIdx] = useState(null);
  const [dropIdx,  setDropIdx] = useState(null);
  const pickerRef = useRef(null);

  const removeFav = useCallback((path) => {
    setFavs(prev => {
      const next = prev.filter(f => f.path !== path);
      saveFavorites(next);
      return next;
    });
  }, []);

  const addFav = useCallback((item) => {
    setFavs(prev => {
      if (prev.find(f => f.path === item.path)) return prev;
      const next = [...prev, item];
      saveFavorites(next);
      return next;
    });
    setPicking(false);
  }, []);

  const handleDragStart = useCallback((e, idx) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIdx(idx);
  }, []);

  const handleDrop = useCallback((e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDropIdx(null); return; }
    const next = [...favs];
    const [removed] = next.splice(dragIdx, 1);
    next.splice(idx, 0, removed);
    setFavs(next);
    saveFavorites(next);
    setDragIdx(null);
    setDropIdx(null);
  }, [dragIdx, favs]);

  const handleDragEnd = useCallback(() => { setDragIdx(null); setDropIdx(null); }, []);

  const notPinned = useMemo(() =>
    ALL_PINNABLE.filter(p => !favs.find(f => f.path === p.path)),
  [favs]);

  return (
    <WorkspaceSection
      id="favorites"
      title="Favorite Modules"
      subtitle="Pinned for quick access"
      action={
        <div className="relative" ref={pickerRef}>
          <button
            onClick={() => setPicking(p => !p)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors"
            style={{
              color: 'var(--text-3)',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
            }}
            aria-label="Add favorite module"
            aria-expanded={picking}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <FiPlus size={11} strokeWidth={2.5} aria-hidden="true" />
            Pin
          </button>
          {picking && notPinned.length > 0 && (
            <div
              className="absolute right-0 mt-1.5 overflow-hidden z-30"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                width: 200,
              }}
              role="listbox"
              aria-label="Modules to pin"
            >
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-4)', borderBottom: '1px solid var(--border)' }}>
                Pin a module
              </p>
              <div className="max-h-52 overflow-y-auto">
                {notPinned.map(item => {
                  const Icon = ICON_MAP[item.icon] || FiGrid;
                  return (
                    <button
                      key={item.path}
                      role="option"
                      aria-selected="false"
                      onClick={() => addFav(item)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Icon size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} aria-hidden="true" />
                      <span className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      }
    >
      {favs.length === 0 ? (
        <div className="text-center py-8" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <FiStar size={20} style={{ color: 'var(--text-5)', margin: '0 auto 8px' }} aria-hidden="true" />
          <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>No favorites yet — click Pin to add</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2" role="list" aria-label="Favorite modules">
          {favs.map((fav, idx) => {
            const Icon = ICON_MAP[fav.icon] || FiGrid;
            const isDragging = dragIdx === idx;
            const isDropTarget = dropIdx === idx && dragIdx !== idx;
            return (
              <div
                key={fav.path}
                role="listitem"
                className="relative group"
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onDragOver={e => handleDragOver(e, idx)}
                onDrop={e => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                style={{ opacity: isDragging ? 0.4 : 1 }}
              >
                <button
                  onClick={() => navigate(fav.path)}
                  className="w-full flex items-center gap-2.5 px-3 py-3 text-left transition-all duration-150"
                  style={{
                    background: isDropTarget ? 'rgba(255,122,0,0.07)' : 'var(--card)',
                    border: `1px solid ${isDropTarget ? 'rgba(255,122,0,0.35)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-display)',
                  }}
                  aria-label={`Go to ${fav.label}`}
                  onMouseEnter={e => { if (!isDropTarget) { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}}
                  onMouseLeave={e => { if (!isDropTarget) { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.borderColor = 'var(--border)'; }}}
                >
                  <div
                    className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,122,0,0.07)', border: '1px solid rgba(255,122,0,0.15)', borderRadius: 'var(--radius-sm)' }}
                    aria-hidden="true"
                  >
                    <Icon size={13} style={{ color: 'var(--accent)' }} />
                  </div>
                  <span className="text-[11.5px] font-semibold truncate" style={{ color: 'var(--text)' }}>{fav.label}</span>
                </button>
                {/* Unpin button */}
                <button
                  onClick={e => { e.stopPropagation(); removeFav(fav.path); }}
                  className="absolute top-1 right-1 w-5 h-5 items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-4)' }}
                  aria-label={`Unpin ${fav.label}`}
                >
                  <FiX size={9} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </WorkspaceSection>
  );
});

export default FavoriteModules;
