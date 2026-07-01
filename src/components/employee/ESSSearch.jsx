import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiX, FiGrid, FiClock, FiCalendar, FiDollarSign,
  FiTrendingUp, FiBook, FiBell, FiStar, FiMessageSquare,
} from 'react-icons/fi';

const PAGES = [
  { label: 'Dashboard',       path: '/employee/dashboard',     icon: FiGrid,          desc: 'Your ESS overview' },
  { label: 'My Attendance',   path: '/employee/attendance',    icon: FiClock,         desc: 'Monthly attendance records' },
  { label: 'My Leave',        path: '/employee/leave',         icon: FiCalendar,      desc: 'Leave balances & requests' },
  { label: 'My Payslips',     path: '/employee/payslips',      icon: FiDollarSign,    desc: 'Payslips & salary breakdown' },
  { label: 'My Performance',  path: '/employee/performance',   icon: FiTrendingUp,    desc: 'Goals, KPIs & reviews' },
  { label: 'My Training',     path: '/employee/training',      icon: FiBook,          desc: 'Enrolled sessions & certifications' },
  { label: 'Announcements',   path: '/employee/announcements', icon: FiBell,          desc: 'Company & department notices' },
  { label: 'Recognition',     path: '/employee/recognition',   icon: FiStar,          desc: 'Your recognitions & shoutouts' },
  { label: 'Feedback',        path: '/employee/feedback',      icon: FiMessageSquare, desc: 'Send & view feedback' },
];

export default function ESSSearch({ open, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const filtered = query.trim()
    ? PAGES.filter(p =>
        p.label.toLowerCase().includes(query.toLowerCase()) ||
        p.desc.toLowerCase().includes(query.toLowerCase())
      )
    : PAGES;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const go = useCallback((path) => { navigate(path); onClose(); }, [navigate, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '80px' }}
      role="dialog"
      aria-modal="true"
      aria-label="Search ESS pages"
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--card,#fff)', borderRadius: '14px', width: '100%', maxWidth: '540px', margin: '0 16px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }}
      >
        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: '1px solid var(--border,#E5E7EB)' }}>
          <FiSearch size={17} style={{ color: 'var(--text-4,#9CA3AF)', flexShrink: 0 }} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search ESS pages…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: 'var(--text,#111)', background: 'transparent', fontFamily: 'inherit' }}
            aria-label="Search ESS pages"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-4,#9CA3AF)', padding: 0, display: 'flex', alignItems: 'center' }}
              aria-label="Clear search"
            >
              <FiX size={15} />
            </button>
          )}
          <kbd style={{ padding: '2px 7px', background: 'var(--bg,#F9FAFB)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '5px', fontSize: '11px', color: 'var(--text-4,#9CA3AF)', fontFamily: 'inherit' }}>
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-4,#9CA3AF)', fontSize: '13px' }}>
              No pages found
            </div>
          ) : filtered.map(p => {
            const Icon = p.icon;
            return (
              <button
                key={p.path}
                onClick={() => go(p.path)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '11px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg,#F9FAFB)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                <div style={{ width: 34, height: 34, borderRadius: '8px', background: 'rgba(255,122,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: 'var(--accent,#FF7A00)' }} aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text,#111)' }}>{p.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)', marginTop: '1px' }}>{p.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border,#E5E7EB)', display: 'flex', gap: '16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)' }}>
            <kbd style={{ padding: '1px 5px', background: 'var(--bg,#F9FAFB)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '4px', fontSize: '10px', fontFamily: 'inherit' }}>↵</kbd>{' '}
            to open
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)' }}>
            <kbd style={{ padding: '1px 5px', background: 'var(--bg,#F9FAFB)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '4px', fontSize: '10px', fontFamily: 'inherit' }}>Esc</kbd>{' '}
            to close
          </span>
        </div>
      </div>
    </div>
  );
}
