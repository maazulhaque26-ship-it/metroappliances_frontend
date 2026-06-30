import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiArrowRight, FiGrid } from 'react-icons/fi';
import { SEARCH_INDEX } from '../search/SearchRegistry';
import WorkspaceSection from './WorkspaceSection';
import WorkspaceCard from './WorkspaceCard';

function readRecentPages() {
  try { return JSON.parse(localStorage.getItem('ma_erp_recent_pages')) || []; } catch { return []; }
}

const ContinueWorking = React.memo(function ContinueWorking() {
  const navigate = useNavigate();

  const pages = useMemo(() => {
    const raw = readRecentPages().slice(0, 6);
    return raw.map(p => {
      const match = SEARCH_INDEX.find(x => x.path === p.path);
      return { ...p, icon: match?.icon || FiGrid, group: match?.group || '' };
    });
  }, []);

  if (pages.length === 0) {
    return (
      <WorkspaceSection
        id="continue"
        title="Continue Working"
        subtitle="Your recently visited pages will appear here"
      >
        <div
          className="flex items-center justify-center py-10 text-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
        >
          <div>
            <FiClock size={24} style={{ color: 'var(--text-5)', margin: '0 auto 8px' }} aria-hidden="true" />
            <p className="text-[12px]" style={{ color: 'var(--text-4)' }}>Navigate some pages to see them here</p>
          </div>
        </div>
      </WorkspaceSection>
    );
  }

  return (
    <WorkspaceSection
      id="continue"
      title="Continue Working"
      subtitle={`${pages.length} recently visited page${pages.length !== 1 ? 's' : ''}`}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" role="list" aria-label="Recently visited pages">
        {pages.map(page => {
          const Icon = page.icon;
          return (
            <div key={page.path} role="listitem">
              <WorkspaceCard
                onClick={() => navigate(page.path)}
                padding="p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
                    aria-hidden="true"
                  >
                    <Icon size={14} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold truncate" style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                      {page.label}
                    </p>
                    {page.group && (
                      <p className="text-[10px] truncate mt-0.5" style={{ color: 'var(--text-4)' }}>{page.group}</p>
                    )}
                  </div>
                  <FiArrowRight size={12} style={{ color: 'var(--text-5)', flexShrink: 0 }} aria-hidden="true" />
                </div>
              </WorkspaceCard>
            </div>
          );
        })}
      </div>
    </WorkspaceSection>
  );
});

export default ContinueWorking;
