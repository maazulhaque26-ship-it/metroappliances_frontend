import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { getShortcuts, setShortcuts } from './personalizationStore';
import { SEARCH_INDEX } from '../search/SearchRegistry';
import ShortcutCard from './ShortcutCard';
import WorkspaceSection from '../workspace/WorkspaceSection';

function useShortcuts() {
  const [items, setItems] = useState(() => getShortcuts());

  useEffect(() => {
    const handler = (e) => { if (e.detail?.key === 'shortcuts') setItems(e.detail.value); };
    window.addEventListener('ma:personalization', handler);
    return () => window.removeEventListener('ma:personalization', handler);
  }, []);

  return [items, setItems];
}

function AddShortcutPicker({ onAdd, onClose, existing }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    if (!q.trim()) return SEARCH_INDEX.slice(0, 12);
    const lo = q.toLowerCase();
    return SEARCH_INDEX
      .filter(x => x.label.toLowerCase().includes(lo) || x.path.toLowerCase().includes(lo))
      .slice(0, 12);
  }, [q]);

  const existingPaths = existing.map(s => s.path);

  return (
    <div
      className="absolute top-full right-0 mt-2 flex flex-col"
      style={{
        width: 300,
        maxHeight: 340,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        zIndex: 20,
      }}
      role="dialog"
      aria-label="Add shortcut"
    >
      <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
        <FiSearch size={13} style={{ color: 'var(--text-4)', flexShrink: 0 }} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search pages…"
          className="flex-1 bg-transparent outline-none text-[12px]"
          style={{ color: 'var(--text)' }}
          aria-label="Search pages to add as shortcut"
        />
        <button onClick={onClose} style={{ color: 'var(--text-4)' }} aria-label="Close picker">
          <FiX size={13} />
        </button>
      </div>
      <div className="overflow-y-auto flex-1">
        {results.map(item => {
          const Icon = item.icon;
          const already = existingPaths.includes(item.path);
          return (
            <button
              key={item.path}
              onClick={() => { if (!already) onAdd(item); }}
              disabled={already}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
              style={{ opacity: already ? 0.4 : 1, cursor: already ? 'default' : 'pointer' }}
              onMouseEnter={e => { if (!already) e.currentTarget.style.background = 'var(--bg)'; }}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              aria-label={already ? `${item.label} already added` : `Add ${item.label} as shortcut`}
            >
              <div
                className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                aria-hidden="true"
              >
                <Icon size={11} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text-2)' }}>{item.label}</p>
                <p className="text-[10px] truncate" style={{ color: 'var(--text-5)' }}>{item.group}</p>
              </div>
              {already && <span className="text-[9px]" style={{ color: 'var(--text-5)' }}>Added</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const ShortcutGrid = React.memo(function ShortcutGrid() {
  const [items, setItems] = useShortcuts();
  const [picking, setPicking] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dropIdx, setDropIdx] = useState(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setPicking(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const addShortcut = useCallback((item) => {
    const sc = { id: `sc-${Date.now()}`, path: item.path, label: item.label };
    const next = [...items, sc];
    setItems(next);
    setShortcuts(next);
    setPicking(false);
  }, [items]);

  const removeShortcut = useCallback((id) => {
    const next = items.filter(s => s.id !== id);
    setItems(next);
    setShortcuts(next);
  }, [items]);

  const handleDragStart = (e, idx) => { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver  = (e, idx) => { e.preventDefault(); setDropIdx(idx); };
  const handleDrop      = (e, idx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDropIdx(null); return; }
    const next = [...items];
    const [removed] = next.splice(dragIdx, 1);
    next.splice(idx, 0, removed);
    setItems(next);
    setShortcuts(next);
    setDragIdx(null);
    setDropIdx(null);
  };
  const handleDragEnd = () => { setDragIdx(null); setDropIdx(null); };

  return (
    <WorkspaceSection
      id="shortcuts"
      title="My Shortcuts"
      subtitle="Drag to reorder, click to navigate"
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
            aria-label="Add shortcut"
            aria-expanded={picking}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <FiPlus size={11} strokeWidth={2.5} aria-hidden="true" />
            Add
          </button>
          {picking && (
            <AddShortcutPicker
              onAdd={addShortcut}
              onClose={() => setPicking(false)}
              existing={items}
            />
          )}
        </div>
      }
    >
      <div
        className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3"
        role="list"
        aria-label="My shortcuts"
      >
        {items.map((sc, idx) => (
          <ShortcutCard
            key={sc.id}
            shortcut={sc}
            onRemove={removeShortcut}
            isDragging={dragIdx === idx}
            isDropTarget={dropIdx === idx}
            onDragStart={e => handleDragStart(e, idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDrop={e => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
          />
        ))}
        {/* Add placeholder */}
        <button
          onClick={() => setPicking(true)}
          className="flex flex-col items-center justify-center gap-2 p-4 transition-all"
          style={{
            background: 'transparent',
            border: '1.5px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
            minHeight: 80,
            color: 'var(--text-5)',
          }}
          aria-label="Add new shortcut"
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-5)'; }}
        >
          <FiPlus size={18} strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-medium">Add</span>
        </button>
      </div>
    </WorkspaceSection>
  );
});

export default ShortcutGrid;
