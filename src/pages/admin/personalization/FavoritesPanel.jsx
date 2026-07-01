import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiX, FiExternalLink, FiBarChart2, FiFileText, FiGrid } from 'react-icons/fi';
import { getFavPages, setFavPages } from './personalizationStore';
import { SEARCH_INDEX } from '../search/SearchRegistry';
import WorkspaceSection from '../workspace/WorkspaceSection';

function classifyPage(path, label) {
  const p = path.toLowerCase();
  const l = label.toLowerCase();
  if (p.endsWith('/dashboard') || l.includes('dashboard') || l.includes('overview')) return 'dashboard';
  if (l.includes('report') || p.includes('/report')) return 'report';
  return 'page';
}

function useFavPages() {
  const [pages, setPages] = useState(() => getFavPages());

  useEffect(() => {
    const handler = (e) => { if (e.detail?.key === 'favPages') setPages(e.detail.value); };
    window.addEventListener('ma:personalization', handler);
    return () => window.removeEventListener('ma:personalization', handler);
  }, []);

  return [pages, setPages];
}

function DragList({ items, onRemove, onReorder }) {
  const navigate = useNavigate();
  const dragIdx = useRef(null);
  const [dropIdx, setDropIdx] = useState(null);

  const handleDragStart = (e, idx) => {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIdx(idx);
  };
  const handleDrop = (e, idx) => {
    e.preventDefault();
    const from = dragIdx.current;
    if (from === null || from === idx) { setDropIdx(null); return; }
    const next = [...items];
    const [removed] = next.splice(from, 1);
    next.splice(idx, 0, removed);
    onReorder(next);
    dragIdx.current = null;
    setDropIdx(null);
  };
  const handleDragEnd = () => { dragIdx.current = null; setDropIdx(null); };

  return (
    <div className="space-y-1" role="list">
      {items.map((item, idx) => {
        const Icon = item.icon || FiGrid;
        const isDrop = dropIdx === idx;
        return (
          <div
            key={item.path}
            role="listitem"
            draggable
            onDragStart={e => handleDragStart(e, idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDrop={e => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            className="flex items-center gap-2.5 px-3 py-2 rounded group transition-colors"
            style={{
              background: isDrop ? 'rgba(255,122,0,0.06)' : 'var(--bg)',
              border: `1px solid ${isDrop ? 'rgba(255,122,0,0.3)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'grab',
            }}
          >
            {/* Drag handle dots */}
            <span
              className="text-[11px] leading-none select-none flex-shrink-0"
              style={{ color: 'var(--text-5)', letterSpacing: '-1px' }}
              aria-hidden="true"
            >⋮⋮</span>

            <div
              className="w-6 h-6 flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
              aria-hidden="true"
            >
              <Icon size={11} style={{ color: 'var(--accent)' }} />
            </div>

            <button
              onClick={() => navigate(item.path)}
              className="flex-1 text-left text-[12px] font-medium truncate transition-colors"
              style={{ color: 'var(--text-2)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
              aria-label={`Go to ${item.label}`}
            >
              {item.label}
            </button>

            <span className="text-[9px] font-semibold uppercase tracking-wide flex-shrink-0" style={{ color: 'var(--text-5)' }}>
              {item.type === 'dashboard' ? 'Board' : item.type === 'report' ? 'Report' : 'Page'}
            </span>

            <button
              onClick={() => onRemove(item.path)}
              className="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              style={{ color: 'var(--text-4)', background: 'var(--border)' }}
              aria-label={`Remove ${item.label} from favorites`}
            >
              <FiX size={9} strokeWidth={2.5} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

const FavoritesPanel = React.memo(function FavoritesPanel() {
  const [paths, setPaths] = useFavPages();

  const items = paths.map(path => {
    const match = SEARCH_INDEX.find(x => x.path === path);
    const label = match?.label || path.split('/').pop() || path;
    const type  = classifyPage(path, label);
    const icon  = type === 'dashboard' ? (match?.icon || FiBarChart2)
                : type === 'report'    ? (match?.icon || FiFileText)
                : (match?.icon || FiGrid);
    return { path, label, type, icon };
  });

  const dashboards = items.filter(i => i.type === 'dashboard');
  const reports    = items.filter(i => i.type === 'report');
  const pages      = items.filter(i => i.type === 'page');

  const remove = useCallback((path) => {
    const next = paths.filter(p => p !== path);
    setFavPages(next);
    setPaths(next);
  }, [paths]);

  const reorder = useCallback((newItems) => {
    // Preserve order across all types
    const otherPaths = paths.filter(p => !newItems.find(n => n.path === p));
    const next = [...newItems.map(n => n.path), ...otherPaths];
    // Actually we need to reorder within the full list
    const allNewItems = [...newItems];
    const full = items.map(i => i.path);
    // Keep positions of other-type items, reorder within-type
    const typeItems = newItems;
    // Simple: replace the type's slice in paths with the reordered slice
    const typePaths = typeItems.map(i => i.path);
    const remaining = paths.filter(p => !typePaths.includes(p));
    // Insert reordered type at the position where they were
    const firstIdx = paths.findIndex(p => typePaths.includes(p));
    const combined = [...remaining.slice(0, firstIdx), ...typePaths, ...remaining.slice(firstIdx)];
    setFavPages(combined);
    setPaths(combined);
  }, [paths, items]);

  if (paths.length === 0) {
    return (
      <WorkspaceSection id="fav-pages" title="Starred Pages" subtitle="Star pages from search (⌘K) to pin them here">
        <div
          className="flex flex-col items-center justify-center py-10 text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
        >
          <FiStar size={22} style={{ color: 'var(--text-5)', marginBottom: 8 }} aria-hidden="true" />
          <p className="text-[12px] font-medium" style={{ color: 'var(--text-3)' }}>No starred pages yet</p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-5)' }}>
            Open search (Ctrl+K) and click ★ on any result
          </p>
        </div>
      </WorkspaceSection>
    );
  }

  return (
    <WorkspaceSection id="fav-pages" title="Starred Pages" subtitle={`${paths.length} page${paths.length !== 1 ? 's' : ''} starred`}>
      <div
        className="overflow-hidden p-4 space-y-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
      >
        {dashboards.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FiBarChart2 size={11} style={{ color: 'var(--text-4)' }} aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>Dashboards</span>
            </div>
            <DragList items={dashboards} onRemove={remove} onReorder={reorder} />
          </div>
        )}
        {reports.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FiFileText size={11} style={{ color: 'var(--text-4)' }} aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>Reports</span>
            </div>
            <DragList items={reports} onRemove={remove} onReorder={reorder} />
          </div>
        )}
        {pages.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FiExternalLink size={11} style={{ color: 'var(--text-4)' }} aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-4)' }}>Pages</span>
            </div>
            <DragList items={pages} onRemove={remove} onReorder={reorder} />
          </div>
        )}
      </div>
    </WorkspaceSection>
  );
});

export default FavoritesPanel;
