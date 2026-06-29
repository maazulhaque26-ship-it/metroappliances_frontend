import React from 'react';
import { DOMAINS } from './AdminDomainConfig';

export default function AdminDomainRail({ activeDomain, onSelect }) {
  return (
    <div
      role="navigation"
      aria-label="Domain navigation"
      className="flex flex-col items-center pt-3 pb-4 gap-1 flex-shrink-0 overflow-y-auto no-scrollbar"
      style={{ width: '48px', background: '#080808', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      {DOMAINS.map(({ id, label, icon: Icon }) => {
        const active = activeDomain === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            title={label}
            aria-label={label}
            aria-pressed={active}
            className="w-8 h-8 flex items-center justify-center flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            style={{
              borderRadius: '7px',
              background: active ? 'rgba(255,138,0,0.2)' : 'transparent',
              color: active ? 'var(--accent)' : 'rgba(255,255,255,0.3)',
              transition: 'background 0.12s, color 0.12s',
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
              }
            }}
          >
            <Icon size={15} strokeWidth={active ? 2.25 : 1.75} />
          </button>
        );
      })}
    </div>
  );
}
