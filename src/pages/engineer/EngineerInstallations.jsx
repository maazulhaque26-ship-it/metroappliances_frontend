import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiList, FiChevronRight, FiMapPin, FiClock, FiCalendar, FiX } from 'react-icons/fi';
import StatusBadge from '../../components/shared/StatusBadge';
import engineerAPI from '../../services/engineerAPI';

const STATUS_TABS = [
  { label: 'All',         value: '' },
  { label: 'Assigned',    value: 'assigned' },
  { label: 'Travelling',  value: 'travelling' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed',   value: 'completed' },
];

export default function EngineerInstallations() {
  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeTab)  params.set('status', activeTab);
    if (dateFilter) params.set('date', dateFilter);
    engineerAPI.get(`/engineer/jobs?${params}`)
      .then(r => setJobs(r.data.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, [activeTab, dateFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: '24px 24px 80px', fontFamily: 'Poppins, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>My Installation Jobs</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_TABS.map(t => (
            <button key={t.value} onClick={() => setActiveTab(t.value)}
              style={{
                padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                background: activeTab === t.value ? '#059669' : '#F3F4F6',
                color: activeTab === t.value ? '#fff' : '#374151',
                transition: 'all 0.15s',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FiCalendar size={13} color="#9CA3AF" style={{ position: 'absolute', left: 10, pointerEvents: 'none' }} />
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              style={{ paddingLeft: 30, paddingRight: 10, paddingTop: 7, paddingBottom: 7, border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 12, fontFamily: 'inherit', color: '#374151', background: '#fff' }} />
          </div>
          {dateFilter && (
            <button onClick={() => setDateFilter('')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
              <FiX size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 56, color: '#9CA3AF' }}>
          <FiList size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 13 }}>No jobs found for selected filters</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {jobs.map(job => (
            <Link key={job._id} to={`/engineer/jobs/${job._id}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderLeft: '4px solid #059669', borderRadius: 12, padding: '16px 18px', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{job.requestNumber}</span>
                    <StatusBadge status={job.status} />
                    {job.priority && job.priority !== 'normal' && <StatusBadge status={job.priority} />}
                  </div>
                  <FiChevronRight size={16} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 2 }} />
                </div>

                {/* Product / category */}
                <div style={{ fontSize: 13, color: '#374151', marginTop: 8, fontWeight: 500 }}>
                  {job.productName} · {job.category}
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{job.customer?.name}</span>
                  {job.installationAddress?.city && (
                    <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiMapPin size={11} />{job.installationAddress.city}
                    </span>
                  )}
                  {job.scheduledAt && (
                    <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiClock size={11} />{new Date(job.scheduledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
