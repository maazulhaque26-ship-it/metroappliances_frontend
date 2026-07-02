import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

export default function MetricCard({ title, value, change, changeLabel, icon: Icon, accent = '#FF7A00', prefix = '', suffix = '', style }) {
  const changeNum = parseFloat(change);
  const isUp      = changeNum > 0;
  const isDown    = changeNum < 0;
  const ChangeIcon  = isUp ? FiTrendingUp : isDown ? FiTrendingDown : FiMinus;
  const changeColor = isUp ? '#10B981' : isDown ? '#EF4444' : '#9CA3AF';
  const changeText  = isUp ? `up ${changeNum}%` : isDown ? `down ${Math.abs(changeNum)}%` : `no change`;

  return (
    <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '14px', padding: '20px', borderTop: `3px solid ${accent}`, fontFamily: 'var(--font-body, Poppins, sans-serif)', ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-4,#9CA3AF)' }}>{title}</div>
        {Icon && (
          <div aria-hidden="true" style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} style={{ color: accent }} />
          </div>
        )}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text,#111)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '8px' }}>
        {prefix}{value}{suffix}
      </div>
      {change != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: changeColor, fontWeight: 600 }}>
          <ChangeIcon size={12} aria-hidden="true" />
          <span aria-label={`${changeText} ${changeLabel || 'vs last month'}`}>
            {isUp ? '+' : ''}{changeNum}% {changeLabel || 'vs last month'}
          </span>
        </div>
      )}
    </div>
  );
}
