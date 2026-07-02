import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiMapPin, FiChevronRight, FiPhone } from 'react-icons/fi';
import StatusBadge from '../../components/shared/StatusBadge';
import Pagination from '../../components/shared/Pagination';
import technicianAPI from '../../services/technicianAPI';
import { usePagination } from '../../hooks/usePagination';

const ACTIVE_STATUSES = ['assigned','accepted','travelling','reached','diagnosis','repair','testing','awaiting_confirmation'];
const DONE_STATUSES   = ['completed','closed'];

const PRIORITY_COLOR = { urgent: '#EF4444', high: '#F59E0B', normal: '#6B7280', low: '#9CA3AF' };
const PRIORITY_BG    = { urgent: '#FEF2F2', high: '#FFFBEB', normal: '#F9FAFB', low: '#F9FAFB' };

export default function TechnicianJobs() {
  const [tab, setTab]       = useState('active');
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const { page, setPage, total, setTotal, limit } = usePagination();

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit });
    const statuses = tab === 'active' ? ACTIVE_STATUSES : DONE_STATUSES;
    statuses.forEach(s => params.append('status', s));
    technicianAPI.get(`/technician/jobs?${params}`)
      .then(r => { setItems(r.data.data || []); setTotal(r.data.total || 0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab, page, limit]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: '24px 24px 80px', fontFamily: 'Poppins, sans-serif' }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>My Jobs</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{total} job{total !== 1 ? 's' : ''} found</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #E5E7EB' }}>
        {[['active','Active'], ['done','Completed']].map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setPage(1); }}
            style={{
              padding: '10px 22px', border: 'none', background: 'none', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: tab === key ? 700 : 400,
              color: tab === key ? '#3B82F6' : '#6B7280',
              borderBottom: tab === key ? '2px solid #3B82F6' : '2px solid transparent',
              marginBottom: -2,
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF', fontSize: 13 }}>
          No {tab === 'active' ? 'active' : 'completed'} jobs
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(job => {
            const pColor = PRIORITY_COLOR[job.priority] || '#6B7280';
            const pBg    = PRIORITY_BG[job.priority]   || '#F9FAFB';
            return (
              <Link key={job._id} to={`/technician/jobs/${job._id}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid #E5E7EB', borderLeft: `4px solid ${pColor}`, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{job.ticketNumber}</span>
                      <StatusBadge status={job.status} />
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: pBg, color: pColor, textTransform: 'capitalize' }}>
                        {job.priority}
                      </span>
                      {job.isUnderWarranty && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#D1FAE5', color: '#065F46' }}>WARRANTY</span>
                      )}
                    </div>
                    <FiChevronRight size={16} color="#9CA3AF" style={{ flexShrink: 0, marginTop: 2 }} />
                  </div>

                  {/* Customer / category */}
                  <div style={{ fontSize: 13, color: '#374151', marginTop: 8, fontWeight: 500 }}>
                    {job.customer?.name} — {job.category}
                  </div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {job.scheduledAt && (
                      <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiClock size={11} />
                        {new Date(job.scheduledAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    {job.serviceAddress?.city && (
                      <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiMapPin size={11} />{job.serviceAddress.city}
                      </span>
                    )}
                    {job.customer?.phone && (
                      <a href={`tel:${job.customer.phone}`} onClick={e => e.stopPropagation()}
                        style={{ fontSize: 11, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontWeight: 600 }}>
                        <FiPhone size={11} />{job.customer.phone}
                      </a>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
      </div>
    </div>
  );
}
