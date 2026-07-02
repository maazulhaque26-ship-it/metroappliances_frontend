import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  FiBriefcase, FiCheckCircle, FiStar, FiUsers,
  FiClock, FiMapPin, FiChevronRight, FiPhone, FiAlertCircle,
} from 'react-icons/fi';
import PortalKPICard from '../../components/shared/PortalKPICard';
import StatusBadge from '../../components/shared/StatusBadge';
import technicianAPI from '../../services/technicianAPI';

const QUICK_ACTIONS = [
  { label: 'View Jobs',    to: '/technician/jobs',    icon: FiBriefcase, color: '#3B82F6', bg: '#EFF6FF' },
  { label: 'My Profile',  to: '/technician/profile',  icon: FiUsers,     color: '#8B5CF6', bg: '#F5F3FF' },
];

export default function TechnicianDashboard() {
  const { technician } = useSelector(s => s.technicianAuth);
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    technicianAPI.get('/technician/jobs?limit=5')
      .then(r => setJobs(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const activeJobs    = jobs.filter(j => !['completed','closed','cancelled'].includes(j.status)).length;
  const completedJobs = jobs.filter(j => ['completed','closed'].includes(j.status)).length;
  const urgentJobs    = jobs.filter(j => j.priority === 'urgent').length;

  return (
    <div style={{ padding: '24px 24px 80px', fontFamily: 'Poppins, sans-serif', maxWidth: 900 }}>

      {/* Welcome strip */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
          Welcome back, {technician?.name?.split(' ')[0] || 'Technician'}
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
          ID: {technician?.employeeId} · Workload: {technician?.currentWorkload}/{technician?.maxWorkload}
          {technician?.availability?.isAvailable
            ? <span style={{ marginLeft: 10, color: '#10B981', fontWeight: 600 }}>● Available</span>
            : <span style={{ marginLeft: 10, color: '#9CA3AF', fontWeight: 600 }}>● Unavailable</span>}
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        <PortalKPICard icon={<FiBriefcase size={20} />} color="#3B82F6" label="Active Jobs"
          value={activeJobs} to="/technician/jobs" />
        <PortalKPICard icon={<FiCheckCircle size={20} />} color="#10B981" label="Completed"
          value={completedJobs} to="/technician/jobs" />
        <PortalKPICard icon={<FiStar size={20} />} color="#F59E0B" label="Rating"
          value={`${technician?.rating?.average?.toFixed(1) || '0.0'}/5`}
          sub={`${technician?.rating?.count || 0} reviews`} to="/technician/profile" />
        <PortalKPICard icon={<FiAlertCircle size={20} />} color="#EF4444" label="Urgent"
          value={urgentJobs} to="/technician/jobs" />
      </div>

      {/* Quick Actions */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #E5E7EB', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {QUICK_ACTIONS.map(a => {
            const Icon = a.icon;
            return (
              <Link key={a.label} to={a.to}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: a.bg, borderRadius: 10, textDecoration: 'none', color: a.color, fontWeight: 600, fontSize: 13, border: `1px solid ${a.color}22` }}>
                <Icon size={15} />{a.label}
              </Link>
            );
          })}
          <a href={`tel:`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#ECFDF5', borderRadius: 10, textDecoration: 'none', color: '#059669', fontWeight: 600, fontSize: 13, border: '1px solid #05966922' }}>
            <FiPhone size={15} />Call Customer
          </a>
        </div>
      </div>

      {/* Recent Jobs */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Recent Jobs</h3>
          <Link to="/technician/jobs" style={{ fontSize: 12, color: '#3B82F6', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF', fontSize: 13 }}>No jobs assigned yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {jobs.map(job => (
              <Link key={job._id} to={`/technician/jobs/${job._id}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 14px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F6'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{job.ticketNumber}</span>
                      <StatusBadge status={job.status} />
                      <StatusBadge status={job.priority} />
                    </div>
                    <div style={{ fontSize: 12, color: '#374151', marginTop: 3 }}>{job.customer?.name} · {job.category}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                      {job.scheduledAt && (
                        <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <FiClock size={10} />{new Date(job.scheduledAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {job.serviceAddress?.city && (
                        <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <FiMapPin size={10} />{job.serviceAddress.city}
                        </span>
                      )}
                    </div>
                  </div>
                  <FiChevronRight size={16} color="#9CA3AF" flexShrink={0} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
