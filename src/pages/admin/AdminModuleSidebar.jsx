import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';

export default function AdminModuleSidebar({ groups, isActive, onNavigate }) {
  const findActiveGroup = () => {
    const hit = groups.find(g => g.items.some(i => isActive(i.path)));
    return hit?.label ?? groups[0]?.label ?? null;
  };

  const [openGroup, setOpenGroup] = useState(findActiveGroup);

  useEffect(() => {
    setOpenGroup(findActiveGroup());
  }, [groups]);

  return (
    <nav
      aria-label="Module navigation"
      className="flex-1 px-2 py-3 overflow-y-auto no-scrollbar"
    >
      {groups.map(group => {
        const isOpen = openGroup === group.label;
        const hasActive = group.items.some(i => isActive(i.path));

        return (
          <div key={group.label} className="mb-0.5">
            <button
              onClick={() => setOpenGroup(p => p === group.label ? null : group.label)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-[0.13em]"
              style={{ color: hasActive ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.2)', transition: 'background 0.1s, color 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = hasActive ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.2)'; }}
            >
              <span className="truncate">{group.label}</span>
              <FiChevronDown
                size={10}
                style={{
                  flexShrink: 0,
                  marginLeft: '4px',
                  opacity: 0.4,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.18s ease',
                }}
              />
            </button>

            {isOpen && (
              <div className="mt-0.5 mb-1">
                {group.items.map(({ label, path, icon: Icon }) => {
                  const active = isActive(path);
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={onNavigate}
                      className="flex items-center gap-2.5 pl-2.5 pr-2 py-[7px] text-[12px]"
                      style={{
                        color: active ? '#ffffff' : 'rgba(255,255,255,0.42)',
                        background: active ? 'rgba(255,255,255,0.09)' : 'transparent',
                        borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                        borderRadius: '0 6px 6px 0',
                        fontWeight: active ? 600 : 400,
                        letterSpacing: '0.005em',
                        transition: 'background 0.1s, color 0.1s',
                      }}
                      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.72)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
                      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'rgba(255,255,255,0.42)'; e.currentTarget.style.background = 'transparent'; } }}
                    >
                      <Icon
                        size={13}
                        strokeWidth={active ? 2.25 : 1.75}
                        style={{ color: active ? 'var(--accent)' : 'inherit', flexShrink: 0 }}
                      />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
