import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiList, FiUser, FiGrid, FiMapPin } from 'react-icons/fi';

const PAGES = [
  { label: 'Dashboard',         to: '/engineer/dashboard', icon: FiGrid,    desc: "Today's schedule and KPIs" },
  { label: 'My Installations',  to: '/engineer/jobs',      icon: FiList,    desc: 'Active and completed installation jobs' },
  { label: 'Route Planner',     to: '/engineer/route',     icon: FiMapPin,  desc: 'Route planning and navigation' },
  { label: 'Profile',           to: '/engineer/profile',   icon: FiUser,    desc: 'Profile, skills and availability' },
];

export default function EngineerSearch({ open, onClose }) {
  const [query, setQuery] = useState('');
  const navigate   = useNavigate();
  const inputRef   = useRef(null);
  const dialogRef  = useRef(null);
  const prevFocusRef = useRef(null);

  // Save focus on open, restore on close
  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement;
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      prevFocusRef.current?.focus();
    }
  }, [open]);

  // Focus trap + Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab') {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll('button:not([disabled]), input, [tabindex]:not([tabindex="-1"])') || []
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
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const results = query.trim()
    ? PAGES.filter(p =>
        p.label.toLowerCase().includes(query.toLowerCase()) ||
        p.desc.toLowerCase().includes(query.toLowerCase()))
    : PAGES;

  const go = to => { navigate(to); onClose(); };

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 16px 0' }}
    >
      <div
        ref={dialogRef}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search engineer pages"
        style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden', fontFamily: 'Poppins, sans-serif' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #E5E7EB' }}>
          <FiSearch size={16} color="#9CA3AF" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search installations, pages…"
            aria-label="Search engineer pages"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: 'inherit', background: 'transparent', color: '#111827' }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0 }} aria-label="Close search">
            <FiX size={16} aria-hidden="true" />
          </button>
        </div>

        <div style={{ maxHeight: 340, overflowY: 'auto', padding: '8px 0' }}>
          {results.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No results found</div>
          ) : results.map(r => {
            const Icon = r.icon;
            return (
              <button key={r.to} onClick={() => go(r.to)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(5,150,105,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                <div aria-hidden="true" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={14} color="#059669" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', fontFamily: 'inherit' }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'inherit' }}>{r.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ padding: '8px 16px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 16 }}>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}><kbd style={{ background: '#F3F4F6', borderRadius: 4, padding: '1px 5px', fontSize: 10 }}>ESC</kbd> Close</span>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}><kbd style={{ background: '#F3F4F6', borderRadius: 4, padding: '1px 5px', fontSize: 10 }}>Enter</kbd> Navigate</span>
        </div>
      </div>
    </div>
  );
}
