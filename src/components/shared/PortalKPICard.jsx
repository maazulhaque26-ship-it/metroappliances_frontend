import React from 'react';
import { Link } from 'react-router-dom';

const focusStyle = {
  boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))',
};

const PortalKPICard = React.memo(function PortalKPICard({
  label, value, sub, icon: Icon, color = 'var(--accent)', to,
}) {
  const body = (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md, 10px)',
      padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      height: '100%', boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{
          fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--text-4)', lineHeight: 1.4,
        }}>
          {label}
        </span>
        {Icon && (
          <div aria-hidden="true" style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: `${color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={14} style={{ color }} strokeWidth={2} />
          </div>
        )}
      </div>
      <div style={{
        fontSize: '26px', fontWeight: 800, color, lineHeight: 1,
        fontFamily: 'var(--font-numbers, var(--font-display, Poppins, sans-serif))',
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '11px', color: 'var(--text-5, var(--text-4))' }}>{sub}</div>
      )}
    </div>
  );

  if (to) {
    const linkLabel = [label, value, sub].filter(Boolean).join(': ');
    return (
      <Link
        to={to}
        aria-label={linkLabel}
        style={{ textDecoration: 'none', display: 'block' }}
        onMouseEnter={e => {
          const card = e.currentTarget.firstChild;
          card.style.boxShadow = focusStyle.boxShadow;
          card.style.borderColor = `${color}40`;
        }}
        onMouseLeave={e => {
          const card = e.currentTarget.firstChild;
          card.style.boxShadow = '';
          card.style.borderColor = 'var(--border)';
        }}
        onFocus={e => {
          const card = e.currentTarget.firstChild;
          card.style.boxShadow = focusStyle.boxShadow;
          card.style.borderColor = `${color}40`;
        }}
        onBlur={e => {
          const card = e.currentTarget.firstChild;
          card.style.boxShadow = '';
          card.style.borderColor = 'var(--border)';
        }}
      >
        {body}
      </Link>
    );
  }

  return body;
});

export default PortalKPICard;
