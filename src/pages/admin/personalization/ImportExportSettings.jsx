import React, { useRef, useState } from 'react';
import { FiDownload, FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { exportPersonalization, importPersonalization } from './personalizationStore';

export default function ImportExportSettings() {
  const fileRef = useRef(null);
  const [status, setStatus] = useState(null); // 'exported' | 'imported' | 'error'

  const handleExport = () => {
    try {
      const data = exportPersonalization();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `erp-personalization-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('exported');
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const ok = importPersonalization(data);
        setStatus(ok ? 'imported' : 'error');
      } catch {
        setStatus('error');
      }
      setTimeout(() => setStatus(null), 3500);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[12px] font-semibold transition-colors"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-2)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
          aria-label="Export personalization settings as JSON"
        >
          <FiDownload size={13} aria-hidden="true" />
          Export JSON
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-[12px] font-semibold transition-colors"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-2)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
          aria-label="Import personalization settings from JSON file"
        >
          <FiUpload size={13} aria-hidden="true" />
          Import JSON
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {status && (
        <div
          className="flex items-center gap-2 px-3 py-2 text-[11px] font-medium"
          style={{
            background: status === 'error' ? 'rgba(239,68,68,0.07)' : 'rgba(22,163,74,0.07)',
            border: `1px solid ${status === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(22,163,74,0.2)'}`,
            borderRadius: 'var(--radius-sm)',
            color: status === 'error' ? '#DC2626' : '#15803D',
          }}
          role="status"
          aria-live="polite"
        >
          {status === 'error'
            ? <><FiAlertCircle size={12} /><span>Invalid file or export failed.</span></>
            : status === 'exported'
            ? <><FiCheck size={12} /><span>Settings exported successfully.</span></>
            : <><FiCheck size={12} /><span>Settings imported. Refresh to see all changes.</span></>
          }
        </div>
      )}
    </div>
  );
}
