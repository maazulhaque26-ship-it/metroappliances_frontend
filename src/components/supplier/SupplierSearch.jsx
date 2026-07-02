import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiGrid, FiShoppingBag, FiFileText, FiFile, FiBell, FiUser } from 'react-icons/fi';

const PAGES = [
  { label: 'Dashboard',       to: '/supplier/dashboard',     icon: FiGrid,        desc: 'Overview, KPIs and recent orders' },
  { label: 'Purchase Orders', to: '/supplier/orders',        icon: FiShoppingBag, desc: 'Incoming POs to acknowledge and accept' },
  { label: 'RFQ Invitations', to: '/supplier/rfq',           icon: FiFileText,    desc: 'Request-for-quotation invitations' },
  { label: 'Invoices',        to: '/supplier/invoices',      icon: FiFile,        desc: 'Invoice status and payment tracking' },
  { label: 'Documents',       to: '/supplier/documents',     icon: FiFile,        desc: 'Compliance certificates and docs' },
  { label: 'Profile',         to: '/supplier/profile',       icon: FiUser,        desc: 'Update contact details and settings' },
];

export default function SupplierSearch({ open, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const results = query.trim()
    ? PAGES.filter(p =>
        p.label.toLowerCase().includes(query.toLowerCase()) ||
        p.desc.toLowerCase().includes(query.toLowerCase()))
    : PAGES;

  const go = to => { navigate(to); onClose(); };

  if (!open) return null;
  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 16px 0' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: 'var(--card,#fff)', borderRadius: 14, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden', fontFamily: 'Poppins, sans-serif', border: '1px solid var(--border,#E5E7EB)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border,#E5E7EB)' }}>
          <FiSearch size={16} color="#9CA3AF" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search supplier pages…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', background: 'transparent', color: 'var(--text,#111827)' }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }}>
            <FiX size={16} />
          </button>
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px 0' }}>
          {results.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No results found</div>
          ) : results.map(r => {
            const Icon = r.icon;
            return (
              <button key={r.to} onClick={() => go(r.to)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,122,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,122,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} color="#FF7A00" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text,#111827)', fontFamily: 'inherit' }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'inherit' }}>{r.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border,#E5E7EB)', display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}><kbd style={{ background: 'var(--bg-2,#F3F4F6)', borderRadius: 4, padding: '1px 5px', fontSize: 10 }}>ESC</kbd> Close</span>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}><kbd style={{ background: 'var(--bg-2,#F3F4F6)', borderRadius: 4, padding: '1px 5px', fontSize: 10 }}>Enter</kbd> Navigate</span>
        </div>
      </div>
    </div>
  );
}
