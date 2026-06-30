import React from 'react';

const WorkspaceSection = React.memo(function WorkspaceSection({
  title, subtitle, action, children, id,
}) {
  return (
    <section aria-labelledby={id ? `ws-${id}` : undefined}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            id={id ? `ws-${id}` : undefined}
            className="text-[13px] font-bold"
            style={{ color: 'var(--text)', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-4)' }}>{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">{action}</div>
        )}
      </div>
      {children}
    </section>
  );
});

export default WorkspaceSection;
