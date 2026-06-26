import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchRecruitmentSettings, updateRecruitmentSettings } from '../../services/recruitmentAPI';

export default function AdminRecruitmentSettings() {
  const [form, setForm]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchRecruitmentSettings()
      .then(r => setForm(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Load failed'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true); setSuccess(false);
    try {
      await updateRecruitmentSettings(form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) { alert(e.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (loading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error)   return <AdminLayout><ErrorState message={error} /></AdminLayout>;
  if (!form)   return null;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recruitment Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Configure recruitment SLAs and system preferences</p>
          </div>
          <button onClick={save} disabled={saving}
            className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>

        {success && (
          <div className="px-4 py-3 bg-green-50 text-green-700 rounded-lg text-sm">Settings saved successfully.</div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800 border-b pb-2">SLA Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['slaScreeningDays',  'Screening SLA (days)'],
              ['slaInterviewDays',  'Interview SLA (days)'],
              ['slaOfferDays',      'Offer SLA (days)'],
              ['offerValidityDays', 'Offer Validity (days)'],
              ['autoRejectDays',    'Auto-Reject After (days)'],
            ].map(([k, l]) => (
              <div key={k}>
                <label className="text-xs font-medium text-gray-600">{l}</label>
                <input type="number" min={1} value={form[k] ?? ''} onChange={e => set(k, Number(e.target.value))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
          </div>

          <h2 className="font-semibold text-gray-800 border-b pb-2 pt-2">Features</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['requireBGV',           'Require Background Verification'],
              ['requireOnboarding',    'Require Onboarding Checklist'],
              ['emailNotifications',   'Email Notifications'],
            ].map(([k, l]) => (
              <div key={k} className="flex items-center">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={form[k] ?? false} onChange={e => set(k, e.target.checked)} className="rounded" />
                  {l}
                </label>
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-gray-600">Offer Approval Levels</label>
              <input type="number" min={1} max={5} value={form.offerApprovalLevels ?? 1} onChange={e => set('offerApprovalLevels', Number(e.target.value))}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <h2 className="font-semibold text-gray-800 border-b pb-2 pt-2">Reminders & Integrations</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600">Interview Reminder (hours before)</label>
              <input type="number" min={1} value={form.interviewReminderHours ?? 24} onChange={e => set('interviewReminderHours', Number(e.target.value))}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Default BGV Vendor</label>
              <input value={form.bgvVendor ?? ''} onChange={e => set('bgvVendor', e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
