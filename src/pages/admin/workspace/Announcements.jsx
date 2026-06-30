import React from 'react';
import { FiRadio, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import WorkspaceSection from './WorkspaceSection';

const ANNOUNCEMENTS = [
  {
    id: 1,
    type: 'info',
    title: 'Q3 Targets Published',
    body: 'Finance team has published Q3 revenue targets. Review in CFO Dashboard.',
    time: 'Today',
    icon: FiInfo,
    color: '#2563EB',
  },
  {
    id: 2,
    type: 'success',
    title: 'System Backup Complete',
    body: 'Automated database backup completed successfully at 02:00 AM.',
    time: 'Today',
    icon: FiCheckCircle,
    color: '#16A34A',
  },
  {
    id: 3,
    type: 'warning',
    title: 'Maintenance Window',
    body: 'Scheduled downtime on Sunday 02:00–04:00 AM for system upgrades.',
    time: 'This week',
    icon: FiAlertCircle,
    color: 'var(--accent)',
  },
];

const Announcements = React.memo(function Announcements() {
  return (
    <WorkspaceSection
      id="announcements"
      title="Announcements"
      subtitle="Company-wide updates"
      action={
        <div
          className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
          style={{ color: 'var(--text-4)' }}
        >
          <FiRadio size={10} aria-hidden="true" />
          {ANNOUNCEMENTS.length} new
        </div>
      }
    >
      <div
        className="overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
        role="list"
        aria-label="Announcements"
      >
        {ANNOUNCEMENTS.map((item, idx) => {
          const Icon = item.icon;
          const isLast = idx === ANNOUNCEMENTS.length - 1;
          return (
            <div
              key={item.id}
              role="listitem"
              className="flex items-start gap-3 px-4 py-3.5"
              style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}
            >
              <div
                className="w-7 h-7 flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `color-mix(in srgb, ${item.color} 8%, transparent)`, borderRadius: '50%', border: `1px solid color-mix(in srgb, ${item.color} 18%, transparent)` }}
                aria-hidden="true"
              >
                <Icon size={12} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12.5px] font-semibold" style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                    {item.title}
                  </p>
                  <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-5)' }}>{item.time}</span>
                </div>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-4)' }}>{item.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </WorkspaceSection>
  );
});

export default Announcements;
