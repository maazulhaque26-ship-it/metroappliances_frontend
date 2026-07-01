import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiClock, FiCalendar, FiDollarSign, FiTrendingUp, FiBook, FiStar,
  FiBell, FiMessageSquare, FiArrowRight, FiCheckCircle,
} from 'react-icons/fi';
import { essGetDashboard } from '../../services/employeeSelfServiceAPI';
import PortalKPICard from '../../components/shared/PortalKPICard';

const QUICK_ACTIONS = [
  { label: 'Attendance',    to: '/employee/attendance',    icon: FiClock,         color: '#10B981' },
  { label: 'Apply Leave',   to: '/employee/leave',         icon: FiCalendar,      color: '#3B82F6' },
  { label: 'My Payslips',   to: '/employee/payslips',      icon: FiDollarSign,    color: '#FF7A00' },
  { label: 'Performance',   to: '/employee/performance',   icon: FiTrendingUp,    color: '#8B5CF6' },
  { label: 'My Training',   to: '/employee/training',      icon: FiBook,          color: '#06B6D4' },
  { label: 'Feedback',      to: '/employee/feedback',      icon: FiMessageSquare, color: '#F59E0B' },
];

export default function ESSDashboard() {
  const navigate = useNavigate();
  const { employee, token } = useSelector(s => s.employeeAuth);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!token) { navigate('/employee/login'); return; }
    essGetDashboard()
      .then(r => setData(r.data.data || r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (!token) return null;

  const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n || 0);
  const displayName = employee?.name || employee?.firstName || 'Employee';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding: '28px', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>

      {/* Hero greeting */}
      <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '14px', padding: '24px 28px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text,#111)', margin: 0 }}>
            {greeting}, {displayName}!
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-4,#9CA3AF)', marginTop: '6px', marginBottom: 0 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {employee?.department && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Department</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text,#111)', marginTop: '2px' }}>{employee.department}</div>
          </div>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-4,#9CA3AF)', fontSize: '14px' }}>
          Loading your dashboard…
        </div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '14px 18px', color: '#EF4444', fontSize: '13px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* KPI grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <PortalKPICard
              label="Days Present (MTD)"
              value={data?.attendance?.daysPresent ?? 0}
              sub={`of ${data?.attendance?.workingDays ?? 0} working days`}
              icon={FiClock}
              color="#10B981"
              to="/employee/attendance"
            />
            <PortalKPICard
              label="Leave Balance"
              value={data?.leaveBalance?.total ?? 0}
              sub="available days"
              icon={FiCalendar}
              color="#3B82F6"
              to="/employee/leave"
            />
            <PortalKPICard
              label="Latest Net Pay"
              value={data?.latestPayslip?.netPay ? `₹${fmt(data.latestPayslip.netPay)}` : '—'}
              sub={data?.latestPayslip?.period || 'No payslip yet'}
              icon={FiDollarSign}
              color="var(--accent,#FF7A00)"
              to="/employee/payslips"
            />
            <PortalKPICard
              label="Active Goals"
              value={data?.performance?.activeGoals ?? 0}
              sub="in progress"
              icon={FiTrendingUp}
              color="#8B5CF6"
              to="/employee/performance"
            />
            <PortalKPICard
              label="Training Enrolled"
              value={data?.training?.enrolled ?? 0}
              sub="sessions"
              icon={FiBook}
              color="#06B6D4"
              to="/employee/training"
            />
            <PortalKPICard
              label="Recognitions"
              value={data?.recognitions ?? 0}
              sub="received"
              icon={FiStar}
              color="#F59E0B"
              to="/employee/recognition"
            />
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-4,#9CA3AF)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Quick Actions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
              {QUICK_ACTIONS.map(({ label, to, icon: Icon, color }) => (
                <Link
                  key={to}
                  to={to}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border,#E5E7EB)', textDecoration: 'none', background: 'var(--bg,#F9FAFB)', transition: 'box-shadow 0.15s, border-color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)'; e.currentTarget.style.borderColor = color; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border,#E5E7EB)'; }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: '7px', background: color + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={14} style={{ color }} aria-hidden="true" />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text,#111)' }}>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Announcements */}
          {(data?.announcements || []).length > 0 && (
            <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border,#E5E7EB)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiBell size={15} style={{ color: 'var(--accent,#FF7A00)' }} aria-hidden="true" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text,#111)' }}>Recent Announcements</span>
                </div>
                <Link
                  to="/employee/announcements"
                  style={{ fontSize: '12px', color: 'var(--accent,#FF7A00)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  View all <FiArrowRight size={12} aria-hidden="true" />
                </Link>
              </div>
              {data.announcements.slice(0, 5).map((a, i, arr) => (
                <div
                  key={i}
                  style={{ padding: '12px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--border,#E5E7EB)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiCheckCircle size={14} style={{ color: '#10B981', flexShrink: 0 }} aria-hidden="true" />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text,#111)' }}>{a.title}</div>
                      {a.category && <div style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)', marginTop: '1px' }}>{a.category}</div>}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-4,#9CA3AF)', flexShrink: 0 }}>
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
