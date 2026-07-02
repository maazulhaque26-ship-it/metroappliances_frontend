import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

export default function SearchToolbar({ value, onChange, placeholder = 'Search…', style, 'aria-label': ariaLabel }) {
  const label = ariaLabel || placeholder;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', ...style }}>
      <FiSearch size={14} aria-hidden="true" style={{ position: 'absolute', left: '10px', color: '#9CA3AF', pointerEvents: 'none' }} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        style={{
          padding: '8px 32px 8px 32px',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          fontSize: '13px',
          outline: 'none',
          background: '#fff',
          fontFamily: 'var(--font-body, Poppins, sans-serif)',
          color: '#374151',
          width: '240px',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => {
          e.target.style.borderColor = '#FF7A00';
          e.target.style.outline = '2px solid #FF7A00';
          e.target.style.outlineOffset = '1px';
        }}
        onBlur={e => {
          e.target.style.borderColor = '#E5E7EB';
          e.target.style.outline = 'none';
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center' }}
        >
          <FiX size={13} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
