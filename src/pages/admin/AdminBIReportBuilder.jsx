import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchReports, createReport, updateReport, deleteReport, generateReport } from '../../services/biAPI';

const REPORT_TYPES = ['custom','board_pack','management_summary','department_scorecard','kpi_report','trend_report','operational','financial'];
const MODULES = ['sales','finance','hr','manufacturing','procurement','service','projects','assets','warehouse','crm'];

const INITIAL = { name: '', reportType: 'custom', modules: [], periodType: 'monthly', isActive: true, isPublic: false, schedule: { enabled: false, frequency: 'monthly', emailTo: '' } };

export default function AdminBIReportBuilder() {
  const [reports,    setReports]    = useState([]);
  const [form,       setForm]       = useState(INITIAL);
  const [editId,     setEditId]     = useState(null);
  const [showForm,   setShowForm]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState(null);

  const load = () => {
    setLoading(true);
    fetchReports().then(r => setReports(r.data?.data || r.data || [])).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      schedule: { ...form.schedule, emailTo: form.schedule.emailTo ? form.schedule.emailTo.split(',').map(s => s.trim()) : [] },
    };
    try {
      if (editId) {
        await updateReport(editId, payload);
      } else {
        await createReport(payload);
      }
      setShowForm(false); setEditId(null); setForm(INITIAL); load();
    } catch (e) { console.error(e); }
  };

  const handleEdit = (r) => {
    setForm({ ...r, schedule: { ...r.schedule, emailTo: (r.schedule?.emailTo || []).join(', ') } });
    setEditId(r._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report config?')) return;
    await deleteReport(id); load();
  };

  const handleGenerate = async (id, name) => {
    setGenerating(id);
    try {
      await generateReport(id);
      alert(`Report "${name}" generation queued!`);
      load();
    } catch { alert('Failed to generate report'); }
    finally { setGenerating(null); }
  };

  const toggleModule = (m) => {
    setForm(f => ({ ...f, modules: f.modules.includes(m) ? f.modules.filter(x => x !== m) : [...f.modules, m] }));
  };

  return (
    <AdminLayout>
      <div style={{ padding: '24px', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111', margin: 0 }}>Report Builder</h1>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0' }}>Create, schedule and manage BI reports</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(INITIAL); }}
            style={{ padding: '9px 18px', background: '#FF7A00', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            + New Report
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>
              {editId ? 'Edit Report' : 'New Report'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Type</label>
                <select value={form.reportType} onChange={e => setForm(f => ({ ...f, reportType: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: '#fff', boxSizing: 'border-box' }}>
                  {REPORT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Period Type</label>
                <select value={form.periodType} onChange={e => setForm(f => ({ ...f, periodType: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: '#fff', boxSizing: 'border-box' }}>
                  {['monthly','quarterly','annual','custom'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Schedule Email To (comma-separated)</label>
                <input value={form.schedule.emailTo} onChange={e => setForm(f => ({ ...f, schedule: { ...f.schedule, emailTo: e.target.value } }))}
                  placeholder="ceo@company.com, board@company.com"
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Modules</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {MODULES.map(m => (
                  <button key={m} type="button" onClick={() => toggleModule(m)}
                    style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', background: form.modules.includes(m) ? '#FF7A00' : '#fff', color: form.modules.includes(m) ? '#fff' : '#374151', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPublic} onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))} />
                Public
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.schedule.enabled} onChange={e => setForm(f => ({ ...f, schedule: { ...f.schedule, enabled: e.target.checked } }))} />
                Schedule enabled
              </label>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" style={{ padding: '8px 18px', background: '#FF7A00', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                {editId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                style={{ padding: '8px 18px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Loading reports…</div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Name','Type','Modules','Generated','Status','Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>No reports. Create one above.</td></tr>
                ) : reports.map(r => (
                  <tr key={r._id} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#111' }}>{r.name}</td>
                    <td style={{ padding: '10px 14px', color: '#374151', textTransform: 'capitalize' }}>{r.reportType?.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '10px 14px', color: '#6B7280', fontSize: '11px' }}>{(r.modules || []).join(', ') || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#6B7280' }}>{r.generatedCount || 0}x</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: r.isActive ? '#D1FAE5' : '#F3F4F6', color: r.isActive ? '#059669' : '#9CA3AF' }}>
                        {r.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleGenerate(r._id, r.name)} disabled={generating === r._id}
                          style={{ fontSize: '11px', padding: '4px 8px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>
                          {generating === r._id ? '…' : 'Run'}
                        </button>
                        <button onClick={() => handleEdit(r)}
                          style={{ fontSize: '11px', padding: '4px 8px', background: '#F59E0B', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(r._id)}
                          style={{ fontSize: '11px', padding: '4px 8px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
