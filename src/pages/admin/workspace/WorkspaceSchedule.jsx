import React, { useMemo } from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';
import WorkspaceSection from './WorkspaceSection';

function getScheduleItems(now) {
  const h = (n) => {
    const t = new Date(now);
    t.setHours(n, 0, 0, 0);
    return t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return [
    { id: 1, title: 'Morning Stand-up',     time: `${h(9)} – ${h(9)} + 30m`,  type: 'meeting',  color: '#2563EB', done: now.getHours() > 9 },
    { id: 2, title: 'Inventory Review',     time: `${h(11)} – ${h(12)}`,       type: 'review',   color: 'var(--accent)', done: now.getHours() > 12 },
    { id: 3, title: 'Finance Team Sync',    time: `${h(14)} – ${h(15)}`,       type: 'meeting',  color: '#16A34A', done: now.getHours() > 15 },
    { id: 4, title: 'End-of-Day Report',    time: `${h(17)} – ${h(17)} + 30m`, type: 'task',     color: '#7C3AED', done: now.getHours() > 17 },
  ];
}

const WorkspaceSchedule = React.memo(function WorkspaceSchedule() {
  const now = useMemo(() => new Date(), []);
  const items = useMemo(() => getScheduleItems(now), [now]);

  return (
    <WorkspaceSection
      id="schedule"
      title="Today's Schedule"
      subtitle={now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
      action={
        <FiCalendar size={13} style={{ color: 'var(--text-4)' }} aria-hidden="true" />
      }
    >
      <div
        className="overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
        role="list"
        aria-label="Today's schedule"
      >
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <div
              key={item.id}
              role="listitem"
              className="flex items-start gap-3 px-4 py-3"
              style={{
                borderBottom: isLast ? 'none' : '1px solid var(--border)',
                opacity: item.done ? 0.45 : 1,
              }}
            >
              {/* Color bar */}
              <div
                className="w-1 self-stretch rounded-full flex-shrink-0"
                style={{ background: item.color, minHeight: 36 }}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[12.5px] font-semibold"
                  style={{
                    color: 'var(--text)',
                    textDecoration: item.done ? 'line-through' : 'none',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {item.title}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <FiClock size={9} style={{ color: 'var(--text-5)' }} aria-hidden="true" />
                  <span className="text-[10.5px]" style={{ color: 'var(--text-4)' }}>{item.time}</span>
                  {item.done && (
                    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 ml-1" style={{ color: '#15803D', background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.18)', borderRadius: 3 }}>
                      Done
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </WorkspaceSection>
  );
});

export default WorkspaceSchedule;
