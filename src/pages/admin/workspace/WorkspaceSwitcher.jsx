import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiLayers, FiChevronDown, FiCheck, FiRotateCcw } from 'react-icons/fi';
import { usePreviewState } from '../registry';

/**
 * WorkspaceSwitcher — header dropdown that lets SuperAdmin / Admin preview
 * any of the 18 available role workspaces without touching authentication.
 *
 * Renders null for all other roles so it has zero impact on their layout.
 * Persistence: localStorage key 'ma_erp_workspace_preview' (managed by AdminLayout).
 */

const SWITCHABLE_WORKSPACES = [
  { id: 'super_admin',   label: 'Super Admin'   },
  { id: 'admin',         label: 'Admin'         },
  { id: 'executive',     label: 'Executive'     },
  { id: 'finance',       label: 'Finance'       },
  { id: 'accounts',      label: 'Accounts'      },
  { id: 'sales',         label: 'Sales'         },
  { id: 'crm',           label: 'CRM'           },
  { id: 'warehouse',     label: 'Warehouse'     },
  { id: 'inventory',     label: 'Inventory'     },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'projects',      label: 'Projects'      },
  { id: 'hr',            label: 'HR'            },
  { id: 'payroll',       label: 'Payroll'       },
  { id: 'dealer',        label: 'Dealer'        },
  { id: 'employee',      label: 'Employee'      },
  { id: 'support',       label: 'Support'       },
  { id: 'ai_user',       label: 'AI'            },
  { id: 'bi_user',       label: 'BI'            },
];

export default function WorkspaceSwitcher() {
  const { previewRoleId, onSetPreview, actualRoleId, isPreviewActive } = usePreviewState();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const liveRef      = useRef(null);
  const triggerRef   = useRef(null);

  // Only visible for SuperAdmin / Admin actual roles
  if (actualRoleId !== 'super_admin' && actualRoleId !== 'admin') return null;

  const effectiveId    = previewRoleId ?? actualRoleId;
  const currentLabel   = SWITCHABLE_WORKSPACES.find(w => w.id === effectiveId)?.label ?? 'Admin';
  const actualLabel    = SWITCHABLE_WORKSPACES.find(w => w.id === actualRoleId)?.label ?? actualRoleId;

  // Close on outside click — restore focus to trigger
  useEffect(() => {
    const close = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // Escape + Arrow key navigation in listbox
  useEffect(() => {
    if (!open) return;
    const handler = e => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const options = Array.from(
          containerRef.current?.querySelectorAll('[role="option"]') || []
        );
        if (!options.length) return;
        const curr = document.activeElement;
        const idx  = options.indexOf(curr);
        if (e.key === 'ArrowDown') {
          const next = options[idx + 1] ?? options[0];
          next.focus();
        } else {
          const prev = options[idx - 1] ?? options[options.length - 1];
          prev.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const announce = useCallback((msg) => {
    if (liveRef.current) {
      liveRef.current.textContent = '';
      // Small timeout ensures screen readers re-read even if text is same
      setTimeout(() => { if (liveRef.current) liveRef.current.textContent = msg; }, 50);
    }
  }, []);

  const handleSelect = useCallback((roleId) => {
    const isActual = roleId === actualRoleId;
    const target   = SWITCHABLE_WORKSPACES.find(w => w.id === roleId)?.label ?? roleId;
    onSetPreview?.(isActual ? null : roleId);
    setOpen(false);
    triggerRef.current?.focus();
    announce(isActual ? `Returned to ${target} workspace` : `Workspace preview: ${target}`);
  }, [actualRoleId, onSetPreview, announce]);

  const handleReset = useCallback(() => {
    onSetPreview?.(null);
    setOpen(false);
    triggerRef.current?.focus();
    announce(`Returned to ${actualLabel} workspace`);
  }, [onSetPreview, actualLabel, announce]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Hidden live region for accessibility announcements */}
      <div
        ref={liveRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}
      />

      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 transition-all flex-shrink-0"
        style={{
          background: isPreviewActive ? 'rgba(255,122,0,0.08)' : 'var(--bg)',
          border:     isPreviewActive ? '1px solid rgba(255,122,0,0.30)' : '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          color: isPreviewActive ? 'var(--accent)' : 'var(--text-3)',
        }}
        aria-label={`Workspace: ${currentLabel}. Click to switch workspace preview`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onMouseEnter={e => {
          if (!isPreviewActive) {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--text)';
          }
        }}
        onMouseLeave={e => {
          if (!isPreviewActive) {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-3)';
          }
        }}
      >
        <FiLayers size={13} strokeWidth={1.75} aria-hidden="true" />
        <span className="hidden lg:inline text-[11px] font-semibold">{currentLabel}</span>
        {isPreviewActive && (
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: 'var(--accent)' }}
            aria-hidden="true"
          />
        )}
        <FiChevronDown
          size={11}
          strokeWidth={2}
          aria-hidden="true"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 mt-1.5 overflow-hidden"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 50,
            width: '296px',
          }}
          role="listbox"
          aria-label="Available workspaces"
        >
          {/* Panel header */}
          <div
            className="px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em]"
              style={{ color: 'var(--text-4)' }}
            >
              Switch Workspace
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-5)' }}>
              Preview any role — no auth changes
            </p>
          </div>

          {/* 2-column workspace grid */}
          <div
            className="grid grid-cols-2"
            style={{ gap: '1px', background: 'var(--border)', padding: '1px' }}
          >
            {SWITCHABLE_WORKSPACES.map(w => {
              const isSelected = w.id === effectiveId;
              const isActual   = w.id === actualRoleId;
              return (
                <button
                  key={w.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(w.id)}
                  className="flex items-center justify-between px-3 py-2.5 text-left transition-colors"
                  style={{
                    background: isSelected ? 'rgba(255,122,0,0.07)' : 'var(--card)',
                    color: isSelected ? 'var(--accent)' : 'var(--text-2)',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--card)';
                  }}
                >
                  <span className="text-[12px] font-semibold">{w.label}</span>
                  <span className="flex items-center gap-1 flex-shrink-0">
                    {isActual && !isSelected && (
                      <span
                        className="text-[9px] font-bold px-1 py-0.5"
                        style={{
                          color: 'var(--text-5)',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 3,
                        }}
                      >
                        You
                      </span>
                    )}
                    {isActual && isSelected && (
                      <span
                        className="text-[9px] font-bold px-1 py-0.5"
                        style={{
                          color: 'var(--accent)',
                          background: 'rgba(255,122,0,0.08)',
                          border: '1px solid rgba(255,122,0,0.2)',
                          borderRadius: 3,
                        }}
                      >
                        Active
                      </span>
                    )}
                    {isSelected && !isActual && (
                      <FiCheck size={12} strokeWidth={2.5} aria-hidden="true" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Reset footer — only while a preview is active */}
          {isPreviewActive && (
            <div
              className="px-3 py-2.5"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[11.5px] font-semibold transition-all"
                style={{
                  color: 'var(--text-2)',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}
                aria-label={`Return to ${actualLabel} workspace`}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.borderColor = 'rgba(255,122,0,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <FiRotateCcw size={12} strokeWidth={2} aria-hidden="true" />
                Return to {actualLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
