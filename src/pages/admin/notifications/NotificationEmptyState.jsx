import React from 'react';
import { FiBell } from 'react-icons/fi';

export default function NotificationEmptyState({
  title = 'All caught up',
  body = 'No notifications match your current filter.',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-14 h-14 flex items-center justify-center rounded-full mb-4"
        style={{ background: 'var(--bg)', border: '2px solid var(--border)' }}
        aria-hidden="true"
      >
        <FiBell size={22} style={{ color: 'var(--text-5)' }} />
      </div>
      <p
        className="text-[14px] font-semibold mb-1.5"
        style={{ color: 'var(--text-2)', fontFamily: 'var(--font-display)' }}
      >
        {title}
      </p>
      <p
        className="text-[12px] leading-relaxed max-w-[220px]"
        style={{ color: 'var(--text-4)' }}
      >
        {body}
      </p>
    </div>
  );
}
