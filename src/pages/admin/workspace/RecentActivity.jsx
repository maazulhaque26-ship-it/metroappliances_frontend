import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiSearch, FiGrid } from 'react-icons/fi';
import { SEARCH_INDEX } from '../search/SearchRegistry';
import WorkspaceSection from './WorkspaceSection';

function readStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
}

const RecentActivity = React.memo(function RecentActivity() {
  const navigate = useNavigate();

  const items = useMemo(() => {
    const pages = readStorage('ma_erp_recent_pages').slice(0, 6).map(p => {
      const match = SEARCH_INDEX.find(x => x.path === p.path);
      return { type: 'page', label: p.label, path: p.path, icon: match?.icon || FiGrid };
    });
    const searches = readStorage('ma_erp_recent_searches').slice(0, 4).map(s => ({
      type: 'search', label: s, path: null, icon: FiSearch,
    }));

    // Interleave: pages then searches
    return [...pages, ...searches].slice(0, 10);
  }, []);

  if (items.length === 0) {
    return (
      <WorkspaceSection id="activity" title="Recent Activity" subtitle="Your actions will appear here">
        <div
          className="py-8 text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
        >
          <FiClock size={20} style={{ color: 'var(--text-5)', margin: '0 auto 8px' }} aria-hidden="true" />
          <p className="text-[11px]" style={{ color: 'var(--text-4)' }}>No activity recorded yet</p>
        </div>
      </WorkspaceSection>
    );
  }

  return (
    <WorkspaceSection id="activity" title="Recent Activity" subtitle="Pages visited & searches">
      <div
        className="overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
        role="list"
        aria-label="Recent activity"
      >
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isLast = idx === items.length - 1;
          return (
            <div
              key={`${item.type}-${item.label}-${idx}`}
              role="listitem"
              className="flex items-center gap-3 px-4 py-2.5 transition-colors"
              style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center flex-shrink-0" aria-hidden="true">
                <div
                  className="w-6 h-6 flex items-center justify-center"
                  style={{
                    background: item.type === 'page' ? 'rgba(255,122,0,0.07)' : 'rgba(37,99,235,0.07)',
                    border: `1px solid ${item.type === 'page' ? 'rgba(255,122,0,0.18)' : 'rgba(37,99,235,0.18)'}`,
                    borderRadius: '50%',
                  }}
                >
                  <Icon size={10} style={{ color: item.type === 'page' ? 'var(--accent)' : '#2563EB' }} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                {item.type === 'page' && item.path ? (
                  <button
                    onClick={() => navigate(item.path)}
                    className="text-[12px] font-medium text-left hover:underline truncate block w-full"
                    style={{ color: 'var(--text-2)' }}
                    aria-label={`Navigate to ${item.label}`}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="text-[12px] font-medium truncate block" style={{ color: 'var(--text-3)' }}>
                    Searched: "{item.label}"
                  </span>
                )}
              </div>

              <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-5)' }}>
                {item.type === 'page' ? 'Visited' : 'Searched'}
              </span>
            </div>
          );
        })}
      </div>
    </WorkspaceSection>
  );
});

export default RecentActivity;
