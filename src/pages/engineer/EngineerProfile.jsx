import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiUser, FiToggleLeft, FiToggleRight, FiStar, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { fetchEngineerMe } from '../../redux/slices/engineerAuthSlice';
import engineerAPI from '../../services/engineerAPI';

export default function EngineerProfile() {
  const dispatch = useDispatch();
  const { engineer } = useSelector(s => s.engineerAuth);
  const [toggling, setToggling] = useState(false);
  const [msg, setMsg]           = useState('');

  const toggleAvailability = useCallback(async () => {
    setToggling(true);
    try {
      await engineerAPI.put('/engineer/auth/availability', { isAvailable: !engineer?.isAvailable });
      await dispatch(fetchEngineerMe());
      setMsg('Availability updated');
      setTimeout(() => setMsg(''), 2000);
    } catch (e) {
      setMsg('Failed to update');
    } finally {
      setToggling(false);
    }
  }, [dispatch, engineer]);

  if (!engineer) return null;

  const isAvailable = engineer.isAvailable;

  return (
    <div style={{ padding: '24px 24px 80px', fontFamily: 'Poppins, sans-serif', maxWidth: 640 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 24 }}>My Profile</h1>

      {msg && (
        <div style={{ background: '#D1FAE5', color: '#065F46', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
          {msg}
        </div>
      )}

      {/* Identity card */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #E5E7EB', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, background: '#064E3B', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FiUser size={28} color="#6EE7B7" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{engineer.name}</div>
            {engineer.employeeId && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>ID: {engineer.employeeId}</div>}
            <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#D1FAE5', color: '#065F46', textTransform: 'capitalize' }}>
              {engineer.status}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {[
            { icon: FiMail,  label: 'Email', value: engineer.email },
            { icon: FiPhone, label: 'Phone', value: engineer.phone },
            { icon: FiStar,  label: 'Rating', value: engineer.rating?.count ? `${engineer.rating.average}/5 (${engineer.rating.count} reviews)` : 'No ratings yet' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ padding: '12px 0', borderBottom: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#9CA3AF' }}>
                <Icon size={11} />{label}
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
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{engineer.currentWorkload || 0}/{engineer.maxWorkload || 6}</span>
        </div>
        <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#059669', borderRadius: 4, width: `${Math.min(100, ((engineer.currentWorkload || 0) / (engineer.maxWorkload || 6)) * 100)}%`, transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>Total installations: {engineer.totalInstallations || 0}</div>
      </div>

      {/* Availability toggle */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #E5E7EB', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Availability</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>Toggle to receive new installation assignments</div>
        </div>
        <button onClick={toggleAvailability} disabled={toggling}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: isAvailable ? '#D1FAE5' : '#FEE2E2', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13, color: isAvailable ? '#065F46' : '#991B1B', opacity: toggling ? 0.7 : 1 }}>
          {isAvailable ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
          {isAvailable ? 'Available' : 'Unavailable'}
        </button>
      </div>

      {/* Skills */}
      {engineer.skills?.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #E5E7EB', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Skills</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {engineer.skills.map(s => (
              <span key={s} style={{ padding: '5px 12px', background: '#D1FAE5', color: '#065F46', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Territory */}
      {(engineer.territory?.cities?.length > 0) && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
            <FiMapPin size={14} color="#6B7280" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Service Territory</span>
          </div>
          {engineer.territory.cities?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {engineer.territory.cities.map(c => (
                <span key={c} style={{ padding: '4px 10px', background: '#ECFDF5', color: '#065F46', borderRadius: 12, fontSize: 12, fontWeight: 500 }}>{c}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
