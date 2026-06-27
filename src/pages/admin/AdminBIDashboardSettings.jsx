import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import {
  fetchKPITargets, createKPITarget, updateKPITarget, deleteKPITarget,
  fetchAlerts, createAlert, updateAlert, deleteAlert, toggleAlert,
  fetchBookmarks, deleteBookmark, setDefaultBookmark,
} from '../../services/biAPI';

const KPI_NAMES = ['revenue','revenue_mtd','headcount','otif','oee','service_sla','project_completion','vendor_otif','training_completion','inventory_turns','customer_satisfaction','open_orders','open_service','active_projects','open_pos','active_production','open_maintenance','active_assets','pending_invoices','document_count'];
const MODULES   = ['enterprise','sales','manufacturing','hr','finance','supply_chain','procurement','service','projects'];
const INITIAL_TARGET = { kpiName: 'revenue', period: '', targetValue: '', periodType: 'monthly', module: 'enterprise', stretchTarget: '', minimumTarget: '', unit: '' };
const INITIAL_ALERT  = { name: '', kpiName: 'revenue', condition: 'below', threshold: '', severity: 'warning', notifyVia: ['socket'], emailTo: '' };

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{ padding: '8px 16px', borderRadius: '8px', border: active ? 'none' : '1px solid #E5E7EB', background: active ? '#FF7A00' : '#fff', color: active ? '#fff' : '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
      {label}
    </button>
  );
}

export default function AdminBIDashboardSettings() {
  const [activeTab, setActiveTab] = useState('targets');

  // KPI Targets
  const [targets,   setTargets]   = useState([]);
  const [tForm,     setTForm]     = useState(INITIAL_TARGET);
  const [tEditId,   setTEditId]   = useState(null);
  const [tLoading,  setTLoading]  = useState(false);

  // Alerts
  const [alerts,    setAlerts]    = useState([]);
  const [aForm,     setAForm]     = useState(INITIAL_ALERT);
  const [aEditId,   setAEditId]   = useState(null);
  const [aLoading,  setALoading]  = useState(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState([]);
  const [bLoading,  setBLoading]  = useState(false);

  useEffect(() => {
    if (activeTab === 'targets' && !targets.length) {
      setTLoading(true);
      fetchKPITargets().then(r => setTargets(r.data?.data || r.data || [])).catch(console.error).finally(() => setTLoading(false));
    }
    if (activeTab === 'alerts' && !alerts.length) {
      setALoading(true);
      fetchAlerts().then(r => setAlerts(r.data?.data || r.data || [])).catch(console.error).finally(() => setALoading(false));
    }
    if (activeTab === 'bookmarks' && !bookmarks.length) {
      setBLoading(true);
      fetchBookmarks().then(r => setBookmarks(r.data?.data || r.data || [])).catch(console.error).finally(() => setBLoading(false));
    }
  }, [activeTab]);

  const reloadTargets = () => fetchKPITargets().then(r => setTargets(r.data?.data || r.data || []));
  const reloadAlerts  = () => fetchAlerts().then(r => setAlerts(r.data?.data || r.data || []));
  const reloadBookmarks = () => fetchBookmarks().then(r => setBookmarks(r.data?.data || r.data || []));

  const handleTargetSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...tForm, targetValue: Number(tForm.targetValue), stretchTarget: tForm.stretchTarget ? Number(tForm.stretchTarget) : undefined, minimumTarget: tForm.minimumTarget ? Number(tForm.minimumTarget) : undefined };
    try {
      if (tEditId) await updateKPITarget(tEditId, payload);
      else await createKPITarget(payload);
      setTForm(INITIAL_TARGET); setTEditId(null); await reloadTargets();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleAlertSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...aForm, threshold: Number(aForm.threshold), emailTo: aForm.emailTo ? aForm.emailTo.split(',').map(s => s.trim()) : [] };
    try {
      if (aEditId) await updateAlert(aEditId, payload);
      else await createAlert(payload);
      setAForm(INITIAL_ALERT); setAEditId(null); await reloadAlerts();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const S = { label: { fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }, input: { width: '100%', padding: '8px 10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' } };

  return (
    <AdminLayout>
      <div style={{ padding: '24px', fontFamily: 'var(--font-body, Poppins, sans-serif)' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111', margin: 0 }}>BI Settings</h1>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '4px 0 0' }}>KPI targets · Alert rules · Bookmarks</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <Tab label="KPI Targets"  active={activeTab === 'targets'}   onClick={() => setActiveTab('targets')} />
          <Tab label="Alert Rules"  active={activeTab === 'alerts'}    onClick={() => setActiveTab('alerts')} />
          <Tab label="Bookmarks"    active={activeTab === 'bookmarks'} onClick={() => setActiveTab('bookmarks')} />
        </div>

        {/* ── KPI Targets ─────────────────────────────────────────────────── */}
        {activeTab === 'targets' && (
          <div>
            <form onSubmit={handleTargetSubmit} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>
                {tEditId ? 'Edit Target' : 'Add KPI Target'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={S.label}>KPI</label>
                  <select value={tForm.kpiName} onChange={e => setTForm(f => ({ ...f, kpiName: e.target.value }))} style={{ ...S.input, background: '#fff' }}>
                    {KPI_NAMES.map(n => <option key={n} value={n}>{n.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Period (YYYY-MM)</label>
                  <input required value={tForm.period} onChange={e => setTForm(f => ({ ...f, period: e.target.value }))} placeholder="2026-06" style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Target Value</label>
                  <input required type="number" value={tForm.targetValue} onChange={e => setTForm(f => ({ ...f, targetValue: e.target.value }))} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Module</label>
                  <select value={tForm.module} onChange={e => setTForm(f => ({ ...f, module: e.target.value }))} style={{ ...S.input, background: '#fff' }}>
                    {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Period Type</label>
                  <select value={tForm.periodType} onChange={e => setTForm(f => ({ ...f, periodType: e.target.value }))} style={{ ...S.input, background: '#fff' }}>
                    {['monthly','quarterly','annual'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Stretch Target</label>
                  <input type="number" value={tForm.stretchTarget} onChange={e => setTForm(f => ({ ...f, stretchTarget: e.target.value }))} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Minimum Target</label>
                  <input type="number" value={tForm.minimumTarget} onChange={e => setTForm(f => ({ ...f, minimumTarget: e.target.value }))} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Unit</label>
                  <input value={tForm.unit} onChange={e => setTForm(f => ({ ...f, unit: e.target.value }))} placeholder="₹ / % / count" style={S.input} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" style={{ padding: '8px 16px', background: '#FF7A00', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>{tEditId ? 'Update' : 'Add'}</button>
                {tEditId && <button type="button" onClick={() => { setTEditId(null); setTForm(INITIAL_TARGET); }} style={{ padding: '8px 16px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>}
              </div>
            </form>

            {tLoading ? <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>Loading…</div> : (
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['KPI','Period','Target','Module','Type','Actions'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {targets.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF' }}>No targets set</td></tr>
                    ) : targets.map(t => (
                      <tr key={t._id} style={{ borderTop: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>{t.kpiName?.replace(/_/g, ' ')}</td>
                        <td style={{ padding: '10px 14px', color: '#374151' }}>{t.period}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 700 }}>{t.targetValue?.toLocaleString()} {t.unit}</td>
                        <td style={{ padding: '10px 14px', color: '#6B7280' }}>{t.module}</td>
                        <td style={{ padding: '10px 14px', color: '#6B7280' }}>{t.periodType}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setTEditId(t._id); setTForm({ ...t, stretchTarget: t.stretchTarget || '', minimumTarget: t.minimumTarget || '', unit: t.unit || '' }); }} style={{ fontSize: '11px', padding: '4px 8px', background: '#F59E0B', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Edit</button>
                            <button onClick={async () => { if (window.confirm('Delete?')) { await deleteKPITarget(t._id); await reloadTargets(); } }} style={{ fontSize: '11px', padding: '4px 8px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Alert Rules ─────────────────────────────────────────────────── */}
        {activeTab === 'alerts' && (
          <div>
            <form onSubmit={handleAlertSubmit} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>{aEditId ? 'Edit Alert' : 'New Alert Rule'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={S.label}>Alert Name *</label>
                  <input required value={aForm.name} onChange={e => setAForm(f => ({ ...f, name: e.target.value }))} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>KPI</label>
                  <select value={aForm.kpiName} onChange={e => setAForm(f => ({ ...f, kpiName: e.target.value }))} style={{ ...S.input, background: '#fff' }}>
                    {KPI_NAMES.map(n => <option key={n} value={n}>{n.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Condition</label>
                  <select value={aForm.condition} onChange={e => setAForm(f => ({ ...f, condition: e.target.value }))} style={{ ...S.input, background: '#fff' }}>
                    {['above','below','equals','change_pct_up','change_pct_down'].map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Threshold *</label>
                  <input required type="number" value={aForm.threshold} onChange={e => setAForm(f => ({ ...f, threshold: e.target.value }))} style={S.input} />
                </div>
                <div>
                  <label style={S.label}>Severity</label>
                  <select value={aForm.severity} onChange={e => setAForm(f => ({ ...f, severity: e.target.value }))} style={{ ...S.input, background: '#fff' }}>
                    {['info','warning','critical'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Email To (comma-sep)</label>
                  <input value={aForm.emailTo} onChange={e => setAForm(f => ({ ...f, emailTo: e.target.value }))} placeholder="cfo@company.com" style={S.input} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" style={{ padding: '8px 16px', background: '#FF7A00', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>{aEditId ? 'Update' : 'Create'}</button>
                {aEditId && <button type="button" onClick={() => { setAEditId(null); setAForm(INITIAL_ALERT); }} style={{ padding: '8px 16px', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>}
              </div>
            </form>

            {aLoading ? <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>Loading…</div> : (
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['Name','KPI','Condition','Threshold','Severity','Active','Triggers','Actions'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.length === 0 ? (
                      <tr><td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF' }}>No alert rules</td></tr>
                    ) : alerts.map(a => {
                      const sc = { info: '#3B82F6', warning: '#F59E0B', critical: '#EF4444' };
                      return (
                        <tr key={a._id} style={{ borderTop: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 700 }}>{a.name}</td>
                          <td style={{ padding: '10px 14px' }}>{a.kpiName?.replace(/_/g, ' ')}</td>
                          <td style={{ padding: '10px 14px', color: '#374151' }}>{a.condition?.replace(/_/g, ' ')}</td>
                          <td style={{ padding: '10px 14px', fontWeight: 700 }}>{a.threshold}</td>
                          <td style={{ padding: '10px 14px' }}><span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: sc[a.severity] + '1A', color: sc[a.severity] }}>{a.severity}</span></td>
                          <td style={{ padding: '10px 14px' }}>
                            <button onClick={async () => { await toggleAlert(a._id); await reloadAlerts(); }} style={{ padding: '3px 10px', borderRadius: '6px', border: 'none', background: a.isActive ? '#D1FAE5' : '#F3F4F6', color: a.isActive ? '#059669' : '#9CA3AF', fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
                              {a.isActive ? 'ON' : 'OFF'}
                            </button>
                          </td>
                          <td style={{ padding: '10px 14px', color: '#6B7280' }}>{a.triggerCount}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => { setAEditId(a._id); setAForm({ ...a, emailTo: (a.emailTo || []).join(', ') }); }} style={{ fontSize: '11px', padding: '4px 8px', background: '#F59E0B', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Edit</button>
                              <button onClick={async () => { if (window.confirm('Delete?')) { await deleteAlert(a._id); await reloadAlerts(); } }} style={{ fontSize: '11px', padding: '4px 8px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>Del</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Bookmarks ───────────────────────────────────────────────────── */}
        {activeTab === 'bookmarks' && (
          <div>
            {bLoading ? <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>Loading…</div> : (
              bookmarks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px' }}>
                  No bookmarks. Bookmarks are created from BI pages.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {bookmarks.map(b => (
                    <div key={b._id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#111', fontSize: '13px' }}>{b.name}</div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{b.path}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {b.isDefault && <span style={{ fontSize: '11px', fontWeight: 700, background: '#D1FAE5', color: '#059669', padding: '2px 8px', borderRadius: '99px' }}>Default</span>}
                        <button onClick={async () => { await setDefaultBookmark(b._id); await reloadBookmarks(); }}
                          style={{ fontSize: '11px', padding: '4px 8px', background: '#3B82F6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>
                          Set Default
                        </button>
                        <button onClick={async () => { if (window.confirm('Delete bookmark?')) { await deleteBookmark(b._id); await reloadBookmarks(); } }}
                          style={{ fontSize: '11px', padding: '4px 8px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>
                          Del
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
