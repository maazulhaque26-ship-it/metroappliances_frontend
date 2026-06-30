import React, { useEffect, useRef, useState } from 'react';
import { FiSearch, FiFilter, FiChevronDown } from 'react-icons/fi';
import { CATEGORIES } from './notificationData';

const BASE_FILTERS = [
  { key: 'all',    label: 'All'       },
  { key: 'unread', label: 'Unread'    },
  { key: 'today',  label: 'Today'     },
  { key: 'week',   label: 'This Week' },
];

export default function NotificationFilters({
  filter, onFilterChange,
  category, onCategoryChange,
  search, onSearchChange,
  counts,
}) {
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Search */}
      <div className="px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="relative">
          <FiSearch
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-4)' }}
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search notifications…"
            className="w-full pl-8 pr-3 py-2 text-[12px] outline-none"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
            }}
            aria-label="Search notifications"
          />
        </div>
      </div>

      {/* Filter tabs + category dropdown */}
      <div className="flex items-center gap-2 px-4 py-1">
        {/* Tabs */}
        <div
          className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto"
          role="tablist"
          aria-label="Notification filters"
          style={{ scrollbarWidth: 'none' }}
        >
          {BASE_FILTERS.map(f => {
            const count = counts?.[f.key] ?? 0;
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange(f.key)}
                className="flex items-center gap-1.5 px-2.5 py-2 text-[11px] font-semibold whitespace-nowrap transition-colors"
                style={{
                  color: active ? 'var(--accent)' : 'var(--text-4)',
                  background: active ? 'rgba(255,122,0,0.06)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                {f.label}
                {count > 0 && (
                  <span
                    className="text-[9px] font-bold leading-none"
                    style={{
                      padding: '1px 4px',
                      background: active ? 'var(--accent)' : 'rgba(107,114,128,0.15)',
                      color: active ? '#fff' : 'var(--text-4)',
                      borderRadius: 5,
                      minWidth: 14,
                      textAlign: 'center',
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Category dropdown */}
        <div className="relative flex-shrink-0" ref={catRef}>
          <button
            onClick={() => setCatOpen(o => !o)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold transition-colors"
            style={{
              color: category ? 'var(--accent)' : 'var(--text-4)',
              background: category ? 'rgba(255,122,0,0.06)' : 'var(--bg)',
              border: `1px solid ${category ? 'rgba(255,122,0,0.25)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
            }}
            aria-haspopup="listbox"
            aria-expanded={catOpen}
            aria-label={`Filter by category${category ? `: ${CATEGORIES[category]?.label}` : ''}`}
          >
            <FiFilter size={11} aria-hidden="true" />
            {category ? CATEGORIES[category]?.label : 'Category'}
            <FiChevronDown size={10} aria-hidden="true" />
          </button>

          {catOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-44 overflow-y-auto"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                zIndex: 10,
                maxHeight: 280,
              }}
              role="listbox"
              aria-label="Filter by category"
            >
              <button
                className="w-full px-3 py-2 text-left text-[11.5px] font-medium transition-colors"
                style={{ color: !category ? 'var(--accent)' : 'var(--text-3)' }}
                onClick={() => { onCategoryChange(null); setCatOpen(false); }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                role="option"
                aria-selected={!category}
              >
                All Categories
              </button>
              {Object.entries(CATEGORIES).map(([key, cat]) => {
                const Icon = cat.icon;
                const selected = category === key;
                return (
                  <button
                    key={key}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11.5px] font-medium transition-colors"
                    style={{ color: selected ? 'var(--accent)' : 'var(--text-3)' }}
                    onClick={() => { onCategoryChange(key); setCatOpen(false); }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    role="option"
                    aria-selected={selected}
                  >
                    <Icon size={11} style={{ color: cat.color, flexShrink: 0 }} aria-hidden="true" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
