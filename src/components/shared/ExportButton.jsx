import React, { useState, useEffect, useRef } from 'react';
import { FiDownload, FiChevronDown } from 'react-icons/fi';

export default function ExportButton({ onExportCSV, onPrint, label = 'Export', loading }) {
  const [open, setOpen] = useState(false);
  const menuRef    = useRef(null);
  const triggerRef = useRef(null);

  // Close on Escape; restore focus to trigger
  useEffect(() => {
    if (!open) return;
    const handler = e => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  if (onPrint && onExportCSV) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          ref={triggerRef}
          onClick={() => setOpen(o => !o)}
          disabled={loading}
          aria-haspopup="menu"
          aria-expanded={open}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', color: '#374151', fontFamily: 'var(--font-body, Poppins, sans-serif)', opacity: loading ? 0.7 : 1 }}
        >
          <FiDownload size={13} aria-hidden="true" /> {label} <FiChevronDown size={12} aria-hidden="true" />
        </button>
        {open && (
          <>
            <div
              aria-hidden="true"
              style={{ position: 'fixed', inset: 0, zIndex: 49 }}
              onClick={() => setOpen(false)}
            />
            <div
              ref={menuRef}
              role="menu"
              aria-label={label}
              style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '150px', overflow: 'hidden' }}
            >
              <button
                role="menuitem"
                onClick={() => { onExportCSV(); setOpen(false); }}
                style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}
              >
                Download CSV
              </button>
              <button
                role="menuitem"
                onClick={() => { onPrint(); setOpen(false); }}
                style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'var(--font-body, Poppins, sans-serif)', borderTop: '1px solid #F3F4F6' }}
              >
                Print
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onExportCSV || onPrint}
      disabled={loading}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', color: '#374151', fontFamily: 'var(--font-body, Poppins, sans-serif)', opacity: loading ? 0.7 : 1 }}
    >
      <FiDownload size={13} aria-hidden="true" /> {label}
    </button>
  );
}
