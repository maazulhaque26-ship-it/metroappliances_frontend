import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiUser, FiToggleLeft, FiToggleRight, FiStar, FiMapPin, FiPhone, FiMail, FiBriefcase } from 'react-icons/fi';
import technicianAPI from '../../services/technicianAPI';
import { fetchTechnicianMe } from '../../redux/slices/technicianAuthSlice';

export default function TechnicianProfile() {
  const dispatch = useDispatch();
  const { technician } = useSelector(s => s.technicianAuth);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState('');

  const toggleAvailability = useCallback(async () => {
    setSaving(true);
    try {
      await technicianAPI.put('/technician/auth/availability', {
        isAvailable: !technician?.availability?.isAvailable,
      });
      await dispatch(fetchTechnicianMe());
      setMsg('Availability updated');
    } catch (e) { setMsg('Error updating availability'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  }, [dispatch, technician]);

  if (!technician) return null;

  const isAvailable = technician.availability?.isAvailable;

  return (
    <div style={{ padding: '24px 24px 80px', fontFamily: 'Poppins, sans-serif', maxWidth: 640 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 24 }}>My Profile</h1>

      {msg && (
        <div role="status" style={{ background: '#ECFDF5', color: '#065F46', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
          {msg}
        </div>
      )}

      {/* Identity card */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #E5E7EB', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, background: '#1E3A5F', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FiUser size={28} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{technician.name}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>ID: {technician.employeeId}</div>
            <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#EFF6FF', color: '#1D4ED8', textTransform: 'capitalize' }}>
              {technician.status}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {[
            { icon: FiMail,      label: 'Email',      value: technician.email },
            { icon: FiPhone,     label: 'Phone',      value: technician.phone },
            { icon: FiBriefcase, label: 'Experience', value: `${technician.experienceYears || 0} years` },
            { icon: FiStar,      label: 'Rating',     value: `${technician.rating?.average?.toFixed(1) || '0.0'}/5 (${technician.rating?.count || 0} reviews)` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ padding: '12px 0', borderBottom: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#9CA3AF' }}>
                <Icon size={11} aria-hidden="true" />{label}
              </div>
              <div style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Workload bar */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #E5E7EB', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Current Workload</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{technician.currentWorkload}/{technician.maxWorkload}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={technician.currentWorkload || 0}
          aria-valuemin={0}
          aria-valuemax={technician.maxWorkload || 1}
          aria-label="Current workload"
          style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}
        >
          <div style={{ height: '100%', background: '#3B82F6', borderRadius: 4, width: `${Math.min(100, ((technician.currentWorkload || 0) / (technician.maxWorkload || 1)) * 100)}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Availability toggle */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #E5E7EB', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Availability</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
            {isAvailable ? 'You are available for new jobs' : 'You are marked as unavailable'}
          </div>
        </div>
        <button onClick={toggleAvailability} disabled={saving}
          aria-pressed={isAvailable}
          aria-label={isAvailable ? 'Set yourself as unavailable' : 'Set yourself as available'}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: isAvailable ? '#D1FAE5' : '#FEE2E2', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, color: isAvailable ? '#065F46' : '#991B1B', opacity: saving ? 0.7 : 1 }}>
          {isAvailable ? <FiToggleRight size={20} aria-hidden="true" /> : <FiToggleLeft size={20} aria-hidden="true" />}
          {isAvailable ? 'Available' : 'Unavailable'}
        </button>
      </div>

      {/* Skills */}
      {technician.skills?.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #E5E7EB', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Skills</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {technician.skills.map(s => (
              <span key={s} style={{ padding: '5px 12px', background: '#EFF6FF', color: '#1D4ED8', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Territory */}
      {technician.territory?.cities?.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <FiMapPin size={14} color="#6B7280" aria-hidden="true" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Service Territory</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {technician.territory.cities.map(c => (
              <span key={c} style={{ padding: '4px 10px', background: '#F3F4F6', color: '#374151', borderRadius: 12, fontSize: 12, fontWeight: 500 }}>{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
