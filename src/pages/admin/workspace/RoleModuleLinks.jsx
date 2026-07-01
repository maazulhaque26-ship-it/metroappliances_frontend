import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationScope } from '../registry';
import { NAV_GROUPS } from '../AdminNavConfig';
import WorkspaceSection from './WorkspaceSection';

/**
 * RoleModuleLinks — shows quick-access cards for the role's nav-scoped modules.
 * Driven by NavigationRegistry: one card per relevant nav group (first item = group landing).
 * Returns null for full-access workspaces (no scope restrictions) since
 * FavoriteModules already serves that purpose.
 */
export default function RoleModuleLinks() {
  const navigate = useNavigate();
  const navScope = useNavigationScope();

  const modules = useMemo(() => {
    // Full workspace: no scope restrictions — don't add redundant shortcuts
    if (navScope.groups.length === 0 && navScope.domains.length === 0) return [];

    const relevantGroups = navScope.groups.length > 0
      ? NAV_GROUPS.filter(g => navScope.groups.includes(g.label))
      : NAV_GROUPS;

    return relevantGroups
      .map(g => g.items[0])   // first item = group landing / dashboard
      .filter(Boolean)
      .slice(0, 12);
  }, [navScope]);

  if (modules.length === 0) return null;

  return (
    <WorkspaceSection
      id="role-modules"
      title="Quick Access"
      subtitle="Your workspace modules"
    >
      <div className="grid grid-cols-2 gap-2" role="list" aria-label="Module shortcuts">
        {modules.map(({ label, path, icon: Icon }) => (
          <div key={path} role="listitem">
            <button
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-2.5 px-3 py-3 text-left transition-all duration-150"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-display)',
              }}
              aria-label={`Go to ${label}`}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg)';
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--card)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div
                className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(255,122,0,0.07)',
                  border: '1px solid rgba(255,122,0,0.15)',
                  borderRadius: 'var(--radius-sm)',
                }}
                aria-hidden="true"
              >
                <Icon size={13} style={{ color: 'var(--accent)' }} />
              </div>
              <span className="text-[11.5px] font-semibold truncate" style={{ color: 'var(--text)' }}>
                {label}
              </span>
            </button>
          </div>
        ))}
      </div>
    </WorkspaceSection>
  );
}
