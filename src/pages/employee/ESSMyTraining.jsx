import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiAward, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';
import { essGetTraining } from '../../services/employeeSelfServiceAPI';

const ENROLLMENT_STYLE = {
  enrolled:  { bg: '#EFF6FF', color: '#1D4ED8', label: 'Enrolled' },
  completed: { bg: '#D1FAE5', color: '#065F46', label: 'Completed' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
};

function EnrollmentIcon({ status }) {
  if (status === 'completed') return <FiCheckCircle size={15} aria-hidden="true" />;
  if (status === 'cancelled') return <FiX          size={15} aria-hidden="true" />;
  return <FiClock size={15} aria-hidden="true" />;
}

export default function ESSMyTraining() {
  const navigate = useNavigate();
  const { token } = useSelector(s => s.employeeAuth);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!token) { navigate('/employee/login'); return; }
    essGetTraining()
      .then(r => setData(r.data.data || r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load training data'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-4,#9CA3AF)', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>Loading…</div>;
  if (error)   return <div style={{ padding: '40px', color: '#EF4444', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>{error}</div>;

  const enrollments    = data?.enrollments    || [];
  const certifications = data?.certifications || [];

  return (
    <div style={{ padding: '28px', fontFamily: 'var(--font-body,Poppins,sans-serif)' }}>

      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text,#111)', margin: 0 }}>My Training</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-4,#9CA3AF)', marginTop: '4px', marginBottom: 0 }}>
          View enrolled training sessions and completed certifications.
        </p>
      </div>

      {/* Enrolled sessions */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <FiBook size={15} style={{ color: 'var(--accent,#FF7A00)' }} aria-hidden="true" />
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text,#111)' }}>
            Enrolled Sessions ({enrollments.length})
          </span>
        </div>

        {enrollments.length === 0 ? (
          <div style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg,#F9FAFB)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <FiBook size={18} style={{ color: 'var(--text-4,#9CA3AF)' }} aria-hidden="true" />
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-4,#9CA3AF)' }}>No training enrollments found</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {enrollments.map(e => {
              const bs = ENROLLMENT_STYLE[e.status] || { bg: '#F3F4F6', color: '#374151', label: e.status };
              return (
                <div key={e._id} style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)', borderRadius: '12px', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '9px', background: bs.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: bs.color }}>
                        <EnrollmentIcon status={e.status} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text,#111)', marginBottom: '4px' }}>
                          {e.session?.course?.title || 'Training Session'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-4,#9CA3AF)' }}>
                          {e.session?.sessionCode}
                          {e.session?.startDate ? ` · ${new Date(e.session.startDate).toLocaleDateString('en-IN')}` : ''}
                        </div>
                        {e.certificateIssued && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
                            <FiAward size={12} aria-hidden="true" /> Certificate issued
                          </div>
                        )}
                      </div>
                    </div>
                    <span style={{ background: bs.bg, color: bs.color, padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                      {bs.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certifications */}
      {certifications.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <FiAward size={15} style={{ color: '#10B981' }} aria-hidden="true" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text,#111)' }}>
              Certifications ({certifications.length})
            </span>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {certifications.map(c => (
              <div key={c._id} style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '9px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiAward size={17} style={{ color: '#16A34A' }} aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#14532D' }}>{c.course?.title || 'Certification'}</div>
                  <div style={{ fontSize: '12px', color: '#166534', marginTop: '3px' }}>
                    Issued: {c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN') : '—'}
                    {c.expiryDate ? ` · Expires: ${new Date(c.expiryDate).toLocaleDateString('en-IN')}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
