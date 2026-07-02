import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiList, FiCheckCircle, FiClock, FiStar,
  FiToggleLeft, FiToggleRight, FiChevronRight, FiMapPin, FiUser, FiPhone,
} from 'react-icons/fi';
import { fetchEngineerMe } from '../../redux/slices/engineerAuthSlice';
import PortalKPICard from '../../components/shared/PortalKPICard';
import StatusBadge from '../../components/shared/StatusBadge';
import engineerAPI from '../../services/engineerAPI';

const QUICK_ACTIONS = [
  { label: 'All Jobs',    to: '/engineer/jobs',    icon: FiList,    color: '#059669', bg: '#ECFDF5' },
  { label: 'Route Plan',  to: '/engineer/route',   icon: FiMapPin,  color: '#3B82F6', bg: '#EFF6FF' },
  { label: 'My Profile',  to: '/engineer/profile', icon: FiUser,    color: '#8B5CF6', bg: '#F5F3FF' },
];

export default function EngineerDashboard() {
  const dispatch = useDispatch();
  const { engineer } = useSelector(s => s.engineerAuth);
  const [dash, setDash]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(() => {
    engineerAPI.get('/engineer/dashboard')
      .then(r => setDash(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      await engineerAPI.put('/engineer/auth/availability', { isAvailable: !engineer?.isAvailable });
      dispatch(fetchEngineerMe());
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 48, textAlign: 'center', color: '#6B7280', fontFamily: 'Poppins, sans-serif', fontSize: 13 }}>
      Loading…
    </div>
  );

  const stats    = dash?.stats    || {};
  const todayJobs = dash?.todayJobs || [];

  return (
    <div style={{ padding: '24px 24px 80px', fontFamily: 'Poppins, sans-serif', maxWidth: 900 }}>

      {/* Welcome strip */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>
            Welcome back, {engineer?.name?.split(' ')[0] || 'Engineer'}
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Installation Engineer Dashboard</p>
        </div>
        <button onClick={toggleAvailability} disabled={toggling}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: engineer?.isAvailable ? '#D1FAE5' : '#FEE2E2', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, color: engineer?.isAvailable ? '#065F46' : '#991B1B', flexShrink: 0 }}>
          {engineer?.isAvailable ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
          {engineer?.isAvailable ? 'Available' : 'Unavailable'}
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: 14, marginBottom: 28 }}>
        <PortalKPICard icon={<FiList size={20} />}        color="#3B82F6" label="Active Jobs"     value={stats.active || 0}               to="/engineer/jobs" />
        <PortalKPICard icon={<FiClock size={20} />}       color="#F59E0B" label="Today's Jobs"    value={stats.todayCount || 0}           to="/engineer/jobs" />
        <PortalKPICard icon={<FiCheckCircle size={20} />} color="#10B981" label="Total Completed" value={engineer?.totalInstallations || 0} to="/engineer/jobs" />
        <PortalKPICard icon={<FiStar size={20} />}        color="#8B5CF6" label="Rating"
          value={engineer?.rating?.count ? `${engineer.rating.average}/5` : 'N/A'}
          sub={engineer?.rating?.count ? `${engineer.rating.count} reviews` : 'No reviews yet'}
          to="/engineer/profile" />
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
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: '#F0FDF4', borderRadius: 10, textDecoration: 'none', color: '#16A34A', fontWeight: 600, fontSize: 13, border: '1px solid #16a34a22' }}>
            <FiPhone size={15} />Call Customer
          </a>
        </div>
      </div>

      {/* Today's Schedule */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>Today's Schedule</h3>
          <Link to="/engineer/jobs" style={{ fontSize: 12, color: '#059669', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
        </div>
        {todayJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: '#9CA3AF', fontSize: 13 }}>No jobs scheduled for today</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayJobs.map(job => (
              <Link key={job._id} to={`/engineer/jobs/${job._id}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 14px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#059669'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{job.requestNumber}</span>
                      <StatusBadge status={job.status} />
                    </div>
                    <div style={{ fontSize: 12, color: '#374151', marginTop: 3 }}>{job.productName} · {job.customer?.name}</div>
                    {job.installationAddress?.city && (
                      <span style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
                        <FiMapPin size={10} />{job.installationAddress.city}
                      </span>
                    )}
                  </div>
                  <FiChevronRight size={16} color="#9CA3AF" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
