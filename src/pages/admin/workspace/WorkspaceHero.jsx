import React, { useEffect, useState } from 'react';
import { FiSun, FiSunrise, FiMoon, FiZap } from 'react-icons/fi';

function getGreeting(hour) {
  if (hour < 6)  return { text: 'Good Night',    icon: FiMoon,    color: '#6D28D9' };
  if (hour < 12) return { text: 'Good Morning',  icon: FiSunrise, color: '#D97706' };
  if (hour < 17) return { text: 'Good Afternoon', icon: FiSun,   color: 'var(--accent)' };
  if (hour < 21) return { text: 'Good Evening',  icon: FiSun,    color: '#7C3AED' };
  return            { text: 'Good Night',         icon: FiMoon,   color: '#6D28D9' };
}

const WORKSPACE = { name: 'Metro Appliances ERP', env: 'Production', version: 'v1.0.1' };

const WorkspaceHero = React.memo(function WorkspaceHero({ user }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const hour = now.getHours();
  const greeting = getGreeting(hour);
  const GreetIcon = greeting.icon;

  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '28px 32px',
      }}
      role="banner"
      aria-label="Workspace welcome"
    >
      {/* Subtle accent gradient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse at 80% 50%, rgba(255,122,0,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">

        {/* Left: greeting + user */}
        <div className="flex items-start gap-4 min-w-0">
          {/* Avatar */}
          <div
            className="w-12 h-12 flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
            style={{ background: 'var(--accent)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-display)' }}
            aria-hidden="true"
          >
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <GreetIcon size={14} style={{ color: greeting.color, flexShrink: 0 }} aria-hidden="true" />
              <span
                className="text-[11.5px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: greeting.color }}
              >
                {greeting.text}
              </span>
            </div>
            <h1
              className="text-[22px] font-bold leading-tight truncate"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}
            >
              {user?.name || 'Admin'}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5"
                style={{
                  color: 'var(--accent)',
                  background: 'rgba(255,122,0,0.08)',
                  border: '1px solid rgba(255,122,0,0.18)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {user?.role?.replace('_', ' ') || 'Admin'}
              </span>
              <span style={{ color: 'var(--text-5)', fontSize: 10 }}>·</span>
              <span className="text-[11px]" style={{ color: 'var(--text-4)' }}>{WORKSPACE.name}</span>
            </div>
          </div>
        </div>

        {/* Right: date/time + workspace badge */}
        <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
          <div className="text-right">
            <p
              className="text-[26px] font-bold leading-none tabular-nums"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-numbers)', letterSpacing: '-0.03em' }}
              aria-live="polite"
              aria-label={`Current time: ${timeStr}`}
            >
              {timeStr}
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-4)' }}>{dateStr}</p>
          </div>

          {/* Workspace badge */}
          <div
            className="flex items-center gap-2 px-3 py-1.5"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
            }}
          >
            <FiZap size={10} style={{ color: 'var(--accent)' }} aria-hidden="true" />
            <span className="text-[10px] font-bold" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-display)' }}>
              {WORKSPACE.env}
            </span>
            <span className="text-[9px]" style={{ color: 'var(--text-5)' }}>/</span>
            <span className="text-[10px] font-medium" style={{ color: 'var(--text-4)' }}>{WORKSPACE.version}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default WorkspaceHero;
