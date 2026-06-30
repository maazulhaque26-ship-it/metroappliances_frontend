import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiInbox } from 'react-icons/fi';
import { COUNTER_PATHS, GROUP_SECTIONS } from './AdminDomainConfig';

export default function AdminModuleSidebar({ groups, isActive, onNavigate, pathname }) {
  const navRef = useRef(null);

  // Stable per-domain key: length + first label is unique across all 11 domains
  const storageKey = `ux-sb:${groups.length}:${groups[0]?.label ?? ''}`;

  const getActiveGroup = () =>
    groups.find(g => g.items.some(i => isActive(i.path)))?.label ?? null;

  const [openGroup, setOpenGroup] = useState(() => {
    const active = getActiveGroup();
    if (active) return active;
    try {
      const s = sessionStorage.getItem(storageKey);
      if (s && groups.some(g => g.label === s)) return s;
    } catch {}
    return groups[0]?.label ?? null;
  });

  // Ref so effects can read openGroup without creating stale-closure deps
  const openGroupRef = useRef(openGroup);
  openGroupRef.current = openGroup;

  // Domain switch → reset to active group, or last session-stored, or first
  useEffect(() => {
    const active = getActiveGroup();
    if (active) { setOpenGroup(active); return; }
    try {
      const s = sessionStorage.getItem(storageKey);
      if (s && groups.some(g => g.label === s)) { setOpenGroup(s); return; }
    } catch {}
    setOpenGroup(groups[0]?.label ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  // Route change within same domain → auto-open group containing the active page
  useEffect(() => {
    const active = getActiveGroup();
    if (active && active !== openGroupRef.current) setOpenGroup(active);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleGroup = (label) => {
    setOpenGroup(prev => {
      const next = prev === label ? null : label;
      try { if (next) sessionStorage.setItem(storageKey, next); } catch {}
      return next;
    });
  };

  // Arrow keys move focus across visible buttons + links; Escape blurs
  const handleKeyDown = (e) => {
    if (!['ArrowDown', 'ArrowUp', 'Escape'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Escape') { document.activeElement?.blur(); return; }
    const nav = navRef.current;
    if (!nav) return;
    const focusable = Array.from(
      nav.querySelectorAll('button, a[href]:not([tabindex="-1"])')
    );
    const idx = focusable.indexOf(document.activeElement);
    (e.key === 'ArrowDown'
      ? focusable[Math.min(idx + 1, focusable.length - 1)]
      : focusable[Math.max(idx - 1, 0)]
    )?.focus();
  };

  // Empty state — shown when RBAC filters out all modules for this domain
  if (groups.length === 0) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center px-5 py-12"
        role="status"
        aria-label="No modules available in this domain"
      >
        <div
          className="w-10 h-10 flex items-center justify-center rounded-xl mb-3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <FiInbox size={18} aria-hidden="true" style={{ color: 'rgba(255,255,255,0.18)' }} />
        </div>
        <p className="text-[11px] font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
          No modules available
        </p>
        <p
          className="text-[10px] leading-relaxed text-center"
          style={{ color: 'rgba(255,255,255,0.1)', maxWidth: '130px' }}
        >
          Access will appear here when permissions are configured
        </p>
      </div>
    );
  }

  return (
    <nav
      ref={navRef}
      aria-label="Module navigation"
      className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-2 py-3"
      onKeyDown={handleKeyDown}
    >
      {groups.map(group => {
        const isOpen    = openGroup === group.label;
        const hasActive = group.items.some(i => isActive(i.path));
        const sectionSpecs = GROUP_SECTIONS[group.label] ?? [];
        const panelId  = `sbp-${group.label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
        const headerId = `sbh-${group.label.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;

        return (
          <div key={group.label} className="mb-px">

            {/* Accordion group header */}
            <button
              id={headerId}
              onClick={() => toggleGroup(group.label)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="w-full flex items-center justify-between px-2.5 py-[7px] text-[10px] font-bold uppercase tracking-[0.13em] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-400/50"
              style={{
                color: hasActive ? 'rgba(255,163,40,0.9)' : 'rgba(255,255,255,0.22)',
                background: 'transparent',
                borderLeft: `2px solid ${hasActive ? 'rgba(255,138,0,0.65)' : 'transparent'}`,
                borderRadius: hasActive ? '0 4px 4px 0' : '4px',
                transition: 'color 0.12s, background 0.12s',
              }}
              onMouseEnter={e => {
                if (!hasActive) {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={e => {
                if (!hasActive) {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.22)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span className="truncate">{group.label}</span>
              <FiChevronDown
                size={10}
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  marginLeft: 4,
                  opacity: hasActive ? 0.6 : 0.3,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
            </button>

            {/* Animated panel — CSS grid-row trick for smooth height with no JS measurement */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.22s cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <div
                style={{ overflow: 'hidden' }}
                {...(!isOpen && { 'aria-hidden': 'true' })}
              >
                <div className="pb-1">
                  {group.items.map(({ label, path, icon: Icon }) => {
                    const active      = isActive(path);
                    const sectionSpec = sectionSpecs.find(s => s.startPath === path);
                    const showCounter = COUNTER_PATHS.has(path);

                    return (
                      <React.Fragment key={path}>

                        {/* Section label divider */}
                        {sectionSpec && (
                          <div
                            className="flex items-center gap-2 mx-2 pt-3 pb-1"
                            aria-hidden="true"
                          >
                            <span
                              className="text-[8px] font-bold uppercase tracking-[0.16em] whitespace-nowrap"
                              style={{ color: 'rgba(255,255,255,0.16)' }}
                            >
                              {sectionSpec.label}
                            </span>
                            <div
                              className="flex-1 h-px"
                              style={{ background: 'rgba(255,255,255,0.05)' }}
                            />
                          </div>
                        )}

                        {/* Navigation link */}
                        <Link
                          to={path}
                          onClick={onNavigate}
                          tabIndex={isOpen ? 0 : -1}
                          aria-current={active ? 'page' : undefined}
                          className="flex items-center gap-2.5 pl-2.5 pr-2 py-[6px] text-[12px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-orange-400/50"
                          style={{
                            color: active ? '#fff' : 'rgba(255,255,255,0.42)',
                            background: active ? 'rgba(255,255,255,0.09)' : 'transparent',
                            borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                            borderRadius: '0 6px 6px 0',
                            fontWeight: active ? 600 : 400,
                            transition: 'background 0.1s, color 0.1s',
                          }}
                          onMouseEnter={e => {
                            if (!active) {
                              e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!active) {
                              e.currentTarget.style.color = 'rgba(255,255,255,0.42)';
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <Icon
                            size={13}
                            strokeWidth={active ? 2.2 : 1.75}
                            aria-hidden="true"
                            style={{ color: active ? 'var(--accent)' : 'inherit', flexShrink: 0 }}
                          />
                          <span className="truncate flex-1 min-w-0">{label}</span>
                          {/* Counter badge placeholder — invisible, reserves layout space for future real-time counts */}
                          {showCounter && (
                            <span
                              aria-hidden="true"
                              style={{
                                flexShrink: 0,
                                display: 'inline-block',
                                width: '16px',
                                height: '14px',
                                borderRadius: '7px',
                                border: '1px solid rgba(255,255,255,0.08)',
                                visibility: 'hidden',
                              }}
                            />
                          )}
                        </Link>

                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        );
      })}
    </nav>
  );
}
