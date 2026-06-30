import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiX, FiArrowRight, FiClock, FiGrid,
  FiSettings, FiHelpCircle, FiCommand,
} from 'react-icons/fi';
import { SEARCH_INDEX } from './SearchRegistry';
import { scoreMatch, groupResults } from './SearchUtils';

const RECENT_SEARCHES_KEY = 'ma_erp_recent_searches';
const RECENT_PAGES_KEY    = 'ma_erp_recent_pages';
const MAX_RESULTS_PER_GROUP = 6;

const QUICK_ACTIONS = [
  { label: 'Dashboard',       path: '/admin',          icon: FiGrid,        kbd: 'G D' },
  { label: 'Settings',        path: '/admin/settings', icon: FiSettings,    kbd: 'G S' },
  { label: 'Help Center',     path: null,              icon: FiHelpCircle,  kbd: null  },
  { label: 'Keyboard Shortcuts', path: null,           icon: FiCommand,     kbd: '?'   },
];

function Highlight({ text, query }) {
  if (!query || !query.trim()) return <span>{text}</span>;
  const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${q})`, 'gi'));
  return (
    <span>
      {parts.map((p, i) =>
        p.toLowerCase() === query.trim().toLowerCase()
          ? <mark key={i} style={{ background: 'rgba(255,122,0,0.18)', color: 'var(--accent)', borderRadius: 2, padding: '0 1px' }}>{p}</mark>
          : p
      )}
    </span>
  );
}

function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function writeStorage(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export default function SearchDialog({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentPages,    setRecentPages]    = useState([]);
  const inputRef    = useRef(null);
  const listRef     = useRef(null);
  const prevFocus   = useRef(null);

  // Load from localStorage on open
  useEffect(() => {
    if (open) {
      prevFocus.current = document.activeElement;
      setQuery('');
      setActiveIdx(0);
      setRecentSearches(readStorage(RECENT_SEARCHES_KEY, []));
      setRecentPages(readStorage(RECENT_PAGES_KEY, []));
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      prevFocus.current?.focus?.();
    }
  }, [open]);

  // Scored + grouped results
  const grouped = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const scored = SEARCH_INDEX
      .map(item => ({ item, score: scoreMatch(item, q) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score);
    const groups = groupResults(scored);
    return groups.map(g => ({
      ...g,
      items: g.items.slice(0, MAX_RESULTS_PER_GROUP),
    }));
  }, [query]);

  // Flat list for keyboard nav
  const flatItems = useMemo(() => grouped.flatMap(g => g.items), [grouped]);

  // Reset active index when query changes
  useEffect(() => setActiveIdx(0), [query]);

  const saveRecentSearch = useCallback((q) => {
    if (!q.trim()) return;
    setRecentSearches(prev => {
      const next = [q.trim(), ...prev.filter(s => s !== q.trim())].slice(0, 10);
      writeStorage(RECENT_SEARCHES_KEY, next);
      return next;
    });
  }, []);

  const goTo = useCallback((path, currentQuery) => {
    if (!path) return;
    if (currentQuery?.trim()) saveRecentSearch(currentQuery.trim());
    onClose();
    navigate(path);
  }, [navigate, onClose, saveRecentSearch]);

  // Keyboard handling
  const handleKeyDown = useCallback((e) => {
    if (!open) return;
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIdx(i => Math.min(i + 1, flatItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIdx(i => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIdx(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIdx(flatItems.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (flatItems[activeIdx]) goTo(flatItems[activeIdx].path, query);
        break;
      default:
        break;
    }
  }, [open, flatItems, activeIdx, goTo, query, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  const removeRecentSearch = (s) => {
    setRecentSearches(prev => {
      const next = prev.filter(x => x !== s);
      writeStorage(RECENT_SEARCHES_KEY, next);
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    writeStorage(RECENT_SEARCHES_KEY, []);
  };

  // Enrich recent pages with icon from index
  const enrichedPages = useMemo(() =>
    recentPages.map(p => {
      const match = SEARCH_INDEX.find(x => x.path === p.path);
      return { ...p, icon: match?.icon || FiGrid };
    }),
  [recentPages]);

  if (!open) return null;

  const hasQuery = query.trim().length > 0;
  const hasResults = grouped.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
      className="fixed inset-0 z-50 flex items-start justify-center"
      style={{ paddingTop: 'clamp(40px, 8vh, 100px)' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="relative w-full flex flex-col"
        style={{
          maxWidth: 680,
          maxHeight: 'min(72vh, 600px)',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4" style={{ borderBottom: '1px solid var(--border)', minHeight: 52 }}>
          <FiSearch size={16} style={{ color: 'var(--text-4)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, modules, features..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text)', fontSize: 14, lineHeight: '20px' }}
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="search-results"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="flex items-center justify-center w-5 h-5 rounded"
              style={{ color: 'var(--text-4)' }}
            >
              <FiX size={14} />
            </button>
          )}
          <kbd style={{
            fontSize: 10, padding: '2px 6px', borderRadius: 4,
            background: 'var(--bg)', border: '1px solid var(--border)',
            color: 'var(--text-4)', letterSpacing: '0.03em',
          }}>ESC</kbd>
        </div>

        {/* Body */}
        <div
          id="search-results"
          ref={listRef}
          role="listbox"
          className="overflow-y-auto"
          style={{ flex: 1 }}
        >
          {/* Search results */}
          {hasQuery && hasResults && (
            <div className="py-2">
              {grouped.map(group => (
                <div key={group.label}>
                  <div className="px-4 py-1.5 flex items-center gap-2">
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {group.label}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-5)', background: 'var(--bg)', borderRadius: 3, padding: '1px 5px', border: '1px solid var(--border)' }}>
                      {group.domainLabel}
                    </span>
                  </div>
                  {group.items.map(item => {
                    const idx = flatItems.indexOf(item);
                    const Icon = item.icon;
                    const isActive = idx === activeIdx;
                    return (
                      <button
                        key={item.path}
                        role="option"
                        aria-selected={isActive}
                        data-idx={idx}
                        onClick={() => goTo(item.path, query)}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors"
                        style={{
                          background: isActive ? 'rgba(255,122,0,0.08)' : 'transparent',
                          borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                          color: 'var(--text)',
                        }}
                      >
                        <span className="flex items-center justify-center w-7 h-7 rounded" style={{ background: 'var(--bg)', border: '1px solid var(--border)', flexShrink: 0 }}>
                          <Icon size={13} style={{ color: isActive ? 'var(--accent)' : 'var(--text-3)' }} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span style={{ fontSize: 13, fontWeight: 500 }}>
                            <Highlight text={item.label} query={query} />
                          </span>
                          <span className="block truncate" style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 1 }}>
                            {item.path}
                          </span>
                        </span>
                        <FiArrowRight size={12} style={{ color: 'var(--text-5)', flexShrink: 0, opacity: isActive ? 1 : 0 }} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {hasQuery && !hasResults && (
            <div className="flex flex-col items-center justify-center py-14" style={{ color: 'var(--text-4)' }}>
              <FiSearch size={28} style={{ opacity: 0.35, marginBottom: 12 }} />
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3)' }}>No results for "{query}"</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Try a different keyword or browse by module</p>
            </div>
          )}

          {/* Home state: recent pages + quick actions + recent searches */}
          {!hasQuery && (
            <div className="py-2">
              {/* Recently Visited */}
              {enrichedPages.length > 0 && (
                <div>
                  <div className="px-4 py-1.5">
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Recently Visited
                    </span>
                  </div>
                  {enrichedPages.slice(0, 6).map((page, i) => {
                    const Icon = page.icon;
                    const isActive = i === activeIdx;
                    return (
                      <button
                        key={page.path}
                        role="option"
                        aria-selected={isActive}
                        data-idx={i}
                        onClick={() => goTo(page.path, '')}
                        onMouseEnter={() => setActiveIdx(i)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors"
                        style={{
                          background: isActive ? 'rgba(255,122,0,0.08)' : 'transparent',
                          borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                        }}
                      >
                        <span className="flex items-center justify-center w-7 h-7 rounded" style={{ background: 'var(--bg)', border: '1px solid var(--border)', flexShrink: 0 }}>
                          <Icon size={13} style={{ color: isActive ? 'var(--accent)' : 'var(--text-3)' }} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{page.label}</span>
                          <span className="block truncate" style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 1 }}>{page.path}</span>
                        </span>
                        <FiClock size={11} style={{ color: 'var(--text-5)', flexShrink: 0 }} />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <div className="px-4 py-1.5" style={{ marginTop: enrichedPages.length ? 8 : 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Quick Actions
                  </span>
                </div>
                {QUICK_ACTIONS.map((action, i) => {
                  const base = enrichedPages.length > 0 ? Math.min(enrichedPages.length, 6) : 0;
                  const idx = base + i;
                  const Icon = action.icon;
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      key={action.label}
                      role="option"
                      aria-selected={isActive}
                      data-idx={idx}
                      onClick={() => action.path && goTo(action.path, '')}
                      onMouseEnter={() => setActiveIdx(idx)}
                      disabled={!action.path}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors"
                      style={{
                        background: isActive ? 'rgba(255,122,0,0.08)' : 'transparent',
                        borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                        opacity: action.path ? 1 : 0.45,
                        cursor: action.path ? 'pointer' : 'default',
                      }}
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded" style={{ background: 'var(--bg)', border: '1px solid var(--border)', flexShrink: 0 }}>
                        <Icon size={13} style={{ color: isActive ? 'var(--accent)' : 'var(--text-3)' }} />
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', flex: 1 }}>{action.label}</span>
                      {action.kbd && (
                        <kbd style={{ fontSize: 10, padding: '2px 5px', borderRadius: 3, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-4)' }}>
                          {action.kbd}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 flex items-center justify-between" style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Recent Searches
                    </span>
                    <button onClick={clearRecentSearches} style={{ fontSize: 10, color: 'var(--text-4)', cursor: 'pointer' }}>
                      Clear all
                    </button>
                  </div>
                  {recentSearches.map(s => (
                    <div key={s} className="flex items-center gap-2 px-4 py-1.5">
                      <FiClock size={11} style={{ color: 'var(--text-5)', flexShrink: 0 }} />
                      <button
                        onClick={() => setQuery(s)}
                        className="flex-1 text-left"
                        style={{ fontSize: 13, color: 'var(--text-3)' }}
                      >
                        {s}
                      </button>
                      <button
                        onClick={() => removeRecentSearch(s)}
                        aria-label={`Remove "${s}" from recent searches`}
                        style={{ color: 'var(--text-5)' }}
                      >
                        <FiX size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-4 px-4 py-2"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}
        >
          {[
            { keys: ['↑','↓'], label: 'navigate' },
            { keys: ['↵'], label: 'open' },
            { keys: ['ESC'], label: 'close' },
          ].map(({ keys, label }) => (
            <span key={label} className="flex items-center gap-1">
              {keys.map(k => (
                <kbd key={k} style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text-4)' }}>{k}</kbd>
              ))}
              <span style={{ fontSize: 11, color: 'var(--text-5)' }}>{label}</span>
            </span>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-5)' }}>
            {hasQuery && hasResults ? `${flatItems.length} result${flatItems.length !== 1 ? 's' : ''}` : 'Metro Appliances ERP'}
          </span>
        </div>
      </div>
    </div>
  );
}
