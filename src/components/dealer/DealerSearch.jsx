import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch, FiX, FiPackage, FiFileText, FiFile,
  FiDollarSign, FiList, FiArrowRight,
} from 'react-icons/fi';
import dealerAPI from '../../services/dealerAPI';

const QUICK_LINKS = [
  { label: 'Browse Products', desc: 'View dealer catalog', path: '/dealer/products', icon: FiPackage },
  { label: 'My Orders',       desc: 'Order history',       path: '/dealer/orders',   icon: FiFileText },
  { label: 'Invoices',        desc: 'View all invoices',   path: '/dealer/finance/invoices',  icon: FiFile },
  { label: 'Payments',        desc: 'Payment records',     path: '/dealer/finance/payments',  icon: FiDollarSign },
  { label: 'Ledger',          desc: 'Account ledger',      path: '/dealer/finance/ledger',    icon: FiList },
];

export default function DealerSearch({ onClose }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await dealerAPI.get(
          `/dealer/products?search=${encodeURIComponent(query.trim())}&limit=6`
        );
        setResults(data.products || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  const go = useCallback((path) => {
    navigate(path);
    onClose();
  }, [navigate, onClose]);

  return (
    <div role="dialog" aria-label="Search" aria-modal="true">
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 59, background: 'rgba(0,0,0,0.35)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: '64px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 60, width: '100%', maxWidth: '560px', padding: '0 16px',
        boxSizing: 'border-box',
        fontFamily: 'var(--font-body, Poppins, sans-serif)',
      }}>
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md, 10px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}>
          {/* Input row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 16px', borderBottom: '1px solid var(--border)',
          }}>
            <FiSearch size={16} style={{ color: 'var(--text-4)', flexShrink: 0 }} aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Search products, orders, invoices…"
              aria-label="Search dealer portal"
              style={{
                flex: 1, border: 'none', outline: 'none', fontSize: '14px',
                background: 'transparent', color: 'var(--text)',
                fontFamily: 'var(--font-body, Poppins, sans-serif)',
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--text-4)', borderRadius: '4px' }}
                aria-label="Clear search"
              >
                <FiX size={14} />
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-4)' }}
              aria-label="Close search"
            >
              Esc
            </button>
          </div>

          {/* Body */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {query.trim() ? (
              loading ? (
                <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-4)' }}>
                  Searching…
                </div>
              ) : results.length === 0 ? (
                <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-4)' }}>
                  No products found for "{query}"
                </div>
              ) : (
                <>
                  <div style={{ padding: '10px 16px 4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-4)' }}>
                    Products
                  </div>
                  {results.map(p => (
                    <button
                      key={p._id}
                      onClick={() => go(`/dealer/products/${p.slug}`)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 16px', border: 'none', background: 'transparent',
                        cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <FiPackage size={14} style={{ color: 'var(--text-4)' }} aria-hidden="true" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '1px' }}>
                          {p.brand}{p.dealerPricing?.dealerPrice ? ` · ₹${p.dealerPricing.dealerPrice.toLocaleString('en-IN')}` : ''}
                        </div>
                      </div>
                      <FiArrowRight size={12} style={{ color: 'var(--text-5)', flexShrink: 0 }} aria-hidden="true" />
                    </button>
                  ))}
                  <div style={{ padding: '8px 16px 12px' }}>
                    <button
                      onClick={() => go('/dealer/products')}
                      style={{
                        width: '100%', padding: '8px', borderRadius: '7px',
                        border: '1px solid var(--border)', background: 'var(--bg)',
                        cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                        color: 'var(--accent)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--card)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
                    >
                      Browse full catalog →
                    </button>
                  </div>
                </>
              )
            ) : (
              <>
                <div style={{ padding: '10px 16px 4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-4)' }}>
                  Quick Access
                </div>
                {QUICK_LINKS.map(({ label, desc, path, icon: Icon }) => (
                  <button
                    key={path}
                    onClick={() => go(path)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 16px', border: 'none', background: 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: 'rgba(255,122,0,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={14} style={{ color: 'var(--accent)' }} aria-hidden="true" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-2)' }}>{label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-4)', marginTop: '1px' }}>{desc}</div>
                    </div>
                    <FiArrowRight size={12} style={{ color: 'var(--text-5)', flexShrink: 0 }} aria-hidden="true" />
                  </button>
                ))}
                <div style={{ height: '8px' }} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
