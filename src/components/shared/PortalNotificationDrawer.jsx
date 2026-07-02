import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiBell } from 'react-icons/fi';

export default function PortalNotificationDrawer({ open, onClose, initialItems = [], accentColor = '#FF7A00' }) {
  const [items, setItems]    = useState(initialItems);
  const drawerRef            = useRef(null);
  const prevFocusRef         = useRef(null);

  const markAllRead = () => setItems(p => p.map(i => ({ ...i, read: true })));
  const dismiss     = id  => setItems(p => p.filter(i => i.id !== id));
  const unread = items.filter(i => !i.read).length;

  useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement;
    const id = setTimeout(() => {
      drawerRef.current?.querySelector('button:not([disabled])')?.focus();
    }, 0);
    return () => { clearTimeout(id); prevFocusRef.current?.focus(); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab') {
        const focusable = Array.from(
          drawerRef.current?.querySelectorAll('button:not([disabled])') || []
        );
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 1500 }}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Notifications"
        style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 400, maxWidth: '100vw', background: 'var(--card,#fff)', boxShadow: '-4px 0 32px rgba(0,0,0,0.12)', zIndex: 1501, display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border,#E5E7EB)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiBell size={18} color={accentColor} aria-hidden="true" />
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text,#111827)' }}>Notifications</span>
            {unread > 0 && (
              <span style={{ background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }} aria-hidden="true">{unread}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background: 'none', border: 'none', fontSize: 12, color: accentColor, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Mark all read</button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-4,#6B7280)', padding: 4 }} aria-label="Close notifications">
              <FiX size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-4,#9CA3AF)' }}>
              <FiBell size={36} style={{ marginBottom: 12, opacity: 0.3 }} aria-hidden="true" />
              <p style={{ fontSize: 13 }}>No notifications</p>
            </div>
          ) : items.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id} style={{ display: 'flex', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border,#F3F4F6)', background: item.read ? 'transparent' : `${accentColor}08` }}>
                <div aria-hidden="true" style={{ width: 36, height: 36, borderRadius: 10, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={item.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: item.read ? 500 : 700, color: 'var(--text,#111827)', lineHeight: 1.3 }}>{item.title}</div>
                    <button
                      onClick={() => dismiss(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-5,#D1D5DB)', padding: 0, flexShrink: 0 }}
                      aria-label={`Dismiss ${item.title}`}
                    >
                      <FiX size={13} aria-hidden="true" />
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3,#6B7280)', marginTop: 3, lineHeight: 1.5 }}>{item.body}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-4,#9CA3AF)', marginTop: 5 }}>{item.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
