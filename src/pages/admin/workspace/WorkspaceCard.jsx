import React from 'react';

const WorkspaceCard = React.memo(function WorkspaceCard({
  children, className = '', style = {}, onClick, hover = true,
  padding = 'p-5',
}) {
  const base = {
    background: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    ...style,
  };

  if (!hover || !onClick) {
    return (
      <div
        className={`${padding} ${className}`}
        style={base}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={`${padding} ${className} cursor-pointer transition-all duration-150`}
      style={base}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {children}
    </div>
  );
});

export default WorkspaceCard;
