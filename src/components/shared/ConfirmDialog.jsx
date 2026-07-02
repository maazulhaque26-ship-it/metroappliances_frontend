import React, { useEffect, useRef } from 'react';
import { FiAlertTriangle, FiTrash2, FiInfo } from 'react-icons/fi';

const TYPES = {
  danger:  { icon: FiTrash2,        accent: '#EF4444', bg: '#FEE2E2', confirmBg: '#EF4444', confirmLabel: 'Delete' },
  warning: { icon: FiAlertTriangle, accent: '#F59E0B', bg: '#FEF3C7', confirmBg: '#F59E0B', confirmLabel: 'Confirm' },
  info:    { icon: FiInfo,          accent: '#3B82F6', bg: '#DBEAFE', confirmBg: '#3B82F6', confirmLabel: 'Confirm' },
};

const TITLE_ID = 'confirm-dialog-title';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, type = 'danger', confirmLabel, loading }) {
  const conf = TYPES[type] || TYPES.danger;
  const Icon = conf.icon;
  const dialogRef       = useRef(null);
  const previousFocusRef = useRef(null);

  // Save trigger focus on open; restore it on close (cleanup runs when open → false)
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement;
    const id = setTimeout(() => {
      const first = dialogRef.current?.querySelector('button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      first?.focus();
    }, 0);
    return () => {
      clearTimeout(id);
      previousFocusRef.current?.focus();
    };
  }, [open]);

  // Escape + Tab focus-trap
  useEffect(() => {
    if (!open) return;
    const handler = e => {
      if (e.key === 'Escape') { onCancel?.(); return; }
      if (e.key === 'Tab') {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll('button:not([disabled]), [tabindex]:not([tabindex="-1"])') || []
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={e => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
          <div
            aria-hidden="true"
            style={{ width: '44px', height: '44px', borderRadius: '50%', background: conf.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <Icon size={20} style={{ color: conf.accent }} />
          </div>
          <div>
            <div id={TITLE_ID} style={{ fontSize: '16px', fontWeight: 800, color: '#111', marginBottom: '6px' }}>
              {title || 'Are you sure?'}
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6 }}>
              {message || 'This action cannot be undone.'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#374151' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: conf.confirmBg, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Processing…' : (confirmLabel || conf.confirmLabel)}
          </button>
        </div>
      </div>
    </div>
  );
}
