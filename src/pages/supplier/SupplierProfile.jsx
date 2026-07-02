import React, { useEffect, useState, useCallback } from 'react';
import { FiUser, FiPhone, FiMail, FiSave } from 'react-icons/fi';
import supplierAPI   from '../../services/supplierAPI';
import SectionHeader from '../../components/shared/SectionHeader';
import LoadingState  from '../../components/shared/LoadingState';
import { toast } from 'react-toastify';

export default function SupplierProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({ name: '', phone: '' });

  useEffect(() => {
    supplierAPI.get('/supplier/profile')
      .then(r => {
        setProfile(r.data.data);
        setForm({ name: r.data.data.name || '', phone: r.data.data.phone || '' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await supplierAPI.put('/supplier/profile', form);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  }, [form]);

  if (loading) return <LoadingState message="Loading profile…" />;

  return (
    <div className="p-6 space-y-5" style={{ maxWidth: 560 }}>
      <SectionHeader title="My Profile" subtitle="Update your contact details" />

      {/* Identity card */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--card,#fff)', border: '1px solid var(--border,#E5E7EB)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: '#FF7A00', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FiUser size={26} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text,#111827)' }}>{profile?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-4,#6B7280)', marginTop: 2 }}>{profile?.email}</div>
          </div>
        </div>

        {/* Read-only email */}
        <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border,#F3F4F6)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>
            <FiMail size={11} />Email (cannot be changed)
          </div>
          <div style={{ fontSize: 13, color: 'var(--text,#111827)' }}>{profile?.email}</div>
        </div>

        {/* Editable form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#9CA3AF', marginBottom: 6, fontWeight: 600 }}>
              <FiUser size={11} />Name
            </label>
            <input type="text" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'var(--border,#E5E7EB)', background: 'var(--bg,#F9FAFB)', color: 'var(--text,#111827)', fontFamily: 'Poppins, sans-serif' }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#9CA3AF', marginBottom: 6, fontWeight: 600 }}>
              <FiPhone size={11} />Phone
            </label>
            <input type="tel" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ borderColor: 'var(--border,#E5E7EB)', background: 'var(--bg,#F9FAFB)', color: 'var(--text,#111827)', fontFamily: 'Poppins, sans-serif' }}
            />
          </div>
          <button type="submit" disabled={saving}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 0', borderRadius: 12, background: saving ? '#FDA06A' : '#FF7A00', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Poppins, sans-serif', transition: 'background 0.15s' }}>
            <FiSave size={15} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
