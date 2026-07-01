import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiGrid } from 'react-icons/fi';
import { SEARCH_INDEX } from '../search/SearchRegistry';

export default function ShortcutCard({ shortcut, onRemove, isDragging, isDropTarget, onDragStart, onDragOver, onDrop, onDragEnd }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const match = SEARCH_INDEX.find(x => x.path === shortcut.path);
  const Icon  = match?.icon || FiGrid;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative"
      style={{ opacity: isDragging ? 0.4 : 1 }}
      role="listitem"
    >
      <button
        onClick={() => navigate(shortcut.path)}
        className="w-full flex flex-col items-center justify-center gap-2 p-4 transition-all"
        style={{
          background: isDropTarget ? 'rgba(255,122,0,0.07)' : hovered ? 'var(--bg)' : 'var(--card)',
          border: `1px solid ${isDropTarget ? 'rgba(255,122,0,0.35)' : hovered ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          minHeight: 80,
        }}
        aria-label={`Open ${shortcut.label}`}
      >
        <div
          className="w-9 h-9 flex items-center justify-center"
          style={{
            background: 'rgba(255,122,0,0.07)',
            border: '1px solid rgba(255,122,0,0.15)',
            borderRadius: 'var(--radius-sm)',
          }}
          aria-hidden="true"
        >
          <Icon size={16} style={{ color: 'var(--accent)' }} />
        </div>
        <span
          className="text-[11px] font-semibold text-center leading-tight line-clamp-2"
          style={{ color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}
        >
          {shortcut.label}
        </span>
      </button>

      {/* Remove button — shown on hover */}
      {hovered && onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(shortcut.id); }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full"
          style={{ background: '#EF4444', color: '#fff', border: '2px solid var(--card)', zIndex: 5 }}
          aria-label={`Remove ${shortcut.label} shortcut`}
        >
          <FiX size={9} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
