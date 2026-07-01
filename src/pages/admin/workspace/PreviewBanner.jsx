import React from 'react';
import { FiEye, FiArrowLeft } from 'react-icons/fi';
import { usePreviewState } from '../registry';
import { getRoleById } from '../registry';

/**
 * PreviewBanner — amber strip shown below the header whenever a workspace
 * preview is active.  Provides one-click reset back to the actual role.
 * Renders null when no preview is active (zero DOM cost).
 */
export default function PreviewBanner() {
  const { previewRoleId, onSetPreview, actualRoleId, isPreviewActive } = usePreviewState();

  if (!isPreviewActive) return null;

  const previewRole = getRoleById(previewRoleId);
  const actualRole  = getRoleById(actualRoleId);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Workspace preview active: ${previewRole?.displayName ?? previewRoleId}`}
      className="flex items-center justify-between px-6 lg:px-10 py-2 flex-shrink-0 flex-wrap gap-2"
      style={{
        background: 'rgba(255,122,0,0.07)',
        borderBottom: '1px solid rgba(255,122,0,0.18)',
      }}
    >
      {/* Left: preview label */}
      <div className="flex items-center gap-2.5 min-w-0">
        <FiEye
          size={13}
          style={{ color: 'var(--accent)', flexShrink: 0 }}
          aria-hidden="true"
        />
        <span
          className="text-[10.5px] font-bold uppercase tracking-[0.12em] flex-shrink-0"
          style={{ color: 'var(--text-3)' }}
        >
          Workspace Preview
        </span>
        <span style={{ color: 'var(--text-5)', flexShrink: 0 }} aria-hidden="true">·</span>
        <span
          className="text-[11.5px] font-bold truncate"
          style={{ color: 'var(--accent)' }}
        >
          {previewRole?.displayName ?? previewRoleId}
        </span>
      </div>

      {/* Right: return to actual role */}
      <button
        onClick={() => onSetPreview?.(null)}
        className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold transition-all flex-shrink-0"
        style={{
          color: 'var(--text-2)',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
        }}
        aria-label={`Return to ${actualRole?.displayName ?? actualRoleId} workspace`}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--bg)';
          e.currentTarget.style.borderColor = 'rgba(255,122,0,0.35)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--card)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <FiArrowLeft size={11} strokeWidth={2} aria-hidden="true" />
        Return to {actualRole?.displayName ?? actualRoleId}
      </button>
    </div>
  );
}
