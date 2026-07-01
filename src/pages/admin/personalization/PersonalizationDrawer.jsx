import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiSliders, FiRotateCcw, FiMonitor, FiSun, FiMoon } from 'react-icons/fi';
import {
  getLayout, setLayout, getThemePref, applyTheme,
  resetFavorites, resetShortcuts, resetRecent, resetLayout, resetAll,
} from './personalizationStore';
import ImportExportSettings from './ImportExportSettings';

const LAYOUTS = [
  { key: 'compact',     label: 'Compact',     desc: 'Tighter spacing for more content'   },
  { key: 'comfortable', label: 'Comfortable',  desc: 'Balanced — default view'            },
  { key: 'expanded',    label: 'Expanded',     desc: 'Generous spacing, easier reading'   },
];
const THEMES = [
  { key: 'light',  label: 'Light',  icon: FiSun     },
  { key: 'dark',   label: 'Dark',   icon: FiMoon    },
  { key: 'system', label: 'System', icon: FiMonitor },
];
const RESETS = [
  { key: 'favorites', label: 'Reset Favorites',  fn: resetFavorites, color: '#EA580C' },
  { key: 'shortcuts', label: 'Reset Shortcuts',  fn: resetShortcuts, color: '#7C3AED' },
  { key: 'recent',    label: 'Clear Recent',     fn: resetRecent,    color: '#2563EB' },
  { key: 'layout',    label: 'Reset Layout',     fn: resetLayout,    color: '#059669' },
  { key: 'all',       label: 'Reset Everything', fn: resetAll,       color: '#DC2626' },
];

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-4)' }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export default function PersonalizationDrawer({ open, onClose }) {
  const [layout, setLayoutState] = useState(getLayout);
  const [theme,  setThemeState]  = useState(getThemePref);
  const [confirmReset, setConfirmReset] = useState(null);
  const panelRef = useRef(null);

  // Sync state if changed externally
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.key === 'layout') setLayoutState(e.detail.value);
      if (e.detail?.key === 'theme')  setThemeState(e.detail.value);
    };
    window.addEventListener('ma:personalization', handler);
    return () => window.removeEventListener('ma:personalization', handler);
  }, []);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Focus on open
  useEffect(() => {
    if (open) setTimeout(() => panelRef.current?.querySelector('button')?.focus(), 50);
    if (!open) setConfirmReset(null);
  }, [open]);

  const handleLayout = (val) => { setLayoutState(val); setLayout(val); };
  const handleTheme  = (val) => { setThemeState(val);  applyTheme(val); };

  const handleReset = (r) => {
    if (confirmReset === r.key) {
      r.fn();
      setConfirmReset(null);
    } else {
      setConfirmReset(r.key);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0" style={{ zIndex: 65 }} role="dialog" aria-modal="true" aria-label="Personalization">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute right-0 inset-y-0 flex flex-col w-full max-w-[400px] overflow-y-auto"
        style={{
          background: 'var(--card)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0 sticky top-0"
          style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)', zIndex: 1 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-xl"
              style={{ background: 'rgba(255,122,0,0.08)', border: '1px solid rgba(255,122,0,0.16)' }}
              aria-hidden="true"
            >
              <FiSliders size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="text-[14px] font-bold" style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                Personalization
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>Customize your workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded transition-colors"
            style={{ color: 'var(--text-4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-4)'; }}
            aria-label="Close personalization"
          >
            <FiX size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 space-y-7">

          {/* Workspace Layout */}
          <Section title="Workspace Layout">
            <div className="space-y-2">
              {LAYOUTS.map(l => (
                <label
                  key={l.key}
                  className="flex items-start gap-3 p-3 cursor-pointer transition-colors"
                  style={{
                    background: layout === l.key ? 'rgba(255,122,0,0.05)' : 'var(--bg)',
                    border: `1px solid ${layout === l.key ? 'rgba(255,122,0,0.3)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <input
                    type="radio"
                    name="workspace-layout"
                    value={l.key}
                    checked={layout === l.key}
                    onChange={() => handleLayout(l.key)}
                    className="mt-0.5 flex-shrink-0"
                    style={{ accentColor: 'var(--accent)' }}
                    aria-label={l.label}
                  />
                  <div>
                    <p className="text-[12.5px] font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                      {l.label}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>{l.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </Section>

          {/* Theme */}
          <Section title="Theme Preference">
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map(t => {
                const Icon = t.icon;
                const active = theme === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => handleTheme(t.key)}
                    className="flex flex-col items-center gap-2 p-3 transition-all"
                    style={{
                      background: active ? 'rgba(255,122,0,0.07)' : 'var(--bg)',
                      border: `1px solid ${active ? 'rgba(255,122,0,0.35)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                    }}
                    aria-pressed={active}
                    aria-label={`${t.label} theme`}
                  >
                    <Icon
                      size={18}
                      style={{ color: active ? 'var(--accent)' : 'var(--text-4)' }}
                      aria-hidden="true"
                    />
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }}
                    >
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10.5px] mt-2" style={{ color: 'var(--text-5)' }}>
              System automatically follows your OS preference.
            </p>
          </Section>

          {/* Export / Import */}
          <Section title="Export & Import">
            <ImportExportSettings />
          </Section>

          {/* Resets */}
          <Section title="Reset Options">
            <div className="space-y-2">
              {RESETS.map(r => {
                const confirming = confirmReset === r.key;
                return (
                  <button
                    key={r.key}
                    onClick={() => handleReset(r)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-[12px] font-semibold transition-colors"
                    style={{
                      border: `1px solid ${confirming ? r.color : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      background: confirming ? `color-mix(in srgb, ${r.color} 8%, transparent)` : 'var(--bg)',
                      color: confirming ? r.color : 'var(--text-2)',
                    }}
                    aria-label={confirming ? `Confirm: ${r.label}` : r.label}
                    onMouseEnter={e => { if (!confirming) { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.color = r.color; }}}
                    onMouseLeave={e => { if (!confirming) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}}
                  >
                    <FiRotateCcw size={13} style={{ color: 'inherit', flexShrink: 0 }} aria-hidden="true" />
                    <span className="flex-1">{r.label}</span>
                    {confirming && (
                      <span className="text-[10px] font-bold uppercase tracking-wide">Click again to confirm</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[10.5px] mt-2" style={{ color: 'var(--text-5)' }}>
              Reset Everything restores all defaults. This cannot be undone.
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}
