import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchAISettings, updateAISetting, seedAISettings, fetchAIModels, createAIModel, deleteAIModel } from '../../services/aiAPI';

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 20 };
const btn  = (c = '#3B82F6') => ({ background: c, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 });

const CAT_COLOR = { algorithm: '#3B82F6', threshold: '#EA580C', schedule: '#059669', notification: '#7C3AED', general: '#6B7280' };

export default function AdminAIPredictionSettings() {
  const [tab,      setTab]     = useState('settings');
  const [settings, setSettings]= useState([]);
  const [models,   setModels]  = useState([]);
  const [loading,  setLoading] = useState(true);
  const [editing,  setEditing] = useState(null);
  const [editVal,  setEditVal] = useState('');
  const [msg,      setMsg]     = useState('');
  const [showModelForm, setShowModelForm] = useState(false);
  const [modelForm, setModelForm] = useState({ name: '', forecastType: 'sales', algorithm: 'linear_regression', description: '', trainingPeriods: 12 });

  const load = () => {
    setLoading(true);
    Promise.all([fetchAISettings(), fetchAIModels()])
      .then(([s, m]) => {
        setSettings(s.data.data || []);
        setModels(m.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const seed = async () => {
    const r = await seedAISettings().catch(() => null);
    if (r) { setMsg(`✓ Seeded ${r.data.data?.seeded || 0} default settings`); load(); }
    else setMsg('✗ Seed failed');
  };

  const startEdit = (s) => { setEditing(s.settingKey); setEditVal(JSON.stringify(s.settingValue)); };

  const saveEdit = async (key) => {
    let val;
    try { val = JSON.parse(editVal); } catch { val = editVal; }
    await updateAISetting(key, { settingValue: val }).catch(() => {});
    setEditing(null);
    setMsg('✓ Setting updated');
    load();
  };

  const createModel = async () => {
    if (!modelForm.name) { setMsg('Model name is required'); return; }
    await createAIModel({ ...modelForm, trainingPeriods: Number(modelForm.trainingPeriods) }).catch(() => {});
    setShowModelForm(false);
    setMsg('✓ Forecast model created');
    load();
  };

  const removeModel = async (id) => {
    if (!window.confirm('Delete this model?')) return;
    await deleteAIModel(id).catch(() => {});
    load();
  };

  const cats = [...new Set(settings.map(s => s.category))];
  const settingsByCat = cats.reduce((acc, c) => { acc[c] = settings.filter(s => s.category === c); return acc; }, {});

  return (
    <AdminLayout>
      <div style={{ padding: '28px 32px', fontFamily: 'Poppins, sans-serif', maxWidth: 1400 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>AI Prediction Settings</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>Configure AI algorithms, thresholds, schedules, and forecast models</p>

        {msg && <div style={{ padding: '10px 16px', borderRadius: 8, background: msg.startsWith('✓') ? '#DCFCE7' : '#FEE2E2', color: msg.startsWith('✓') ? '#16A34A' : '#DC2626', marginBottom: 16, fontSize: 13 }}>{msg}</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F3F4F6', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {['settings','forecast-models'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '7px 20px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#1F2937' : '#6B7280', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', textTransform: 'capitalize' }}>
              {t.replace('-',' ')}
            </button>
          ))}
        </div>

        {loading ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>Loading...</p> : tab === 'settings' ? (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button onClick={seed} style={btn('#6B7280')}>Seed Default Settings</button>
            </div>

            {Object.entries(settingsByCat).map(([cat, sArr]) => (
              <div key={cat} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: CAT_COLOR[cat] || '#9CA3AF', display: 'inline-block' }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#374151', margin: 0, textTransform: 'capitalize' }}>{cat} Settings</h3>
                </div>
                {sArr.map(s => (
                  <div key={s.settingKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1F2937', fontFamily: 'monospace' }}>{s.settingKey}</div>
                      {s.description && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{s.description}</div>}
                    </div>
                    {editing === s.settingKey ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input value={editVal} onChange={e => setEditVal(e.target.value)}
                          style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #3B82F6', fontSize: 13, width: 180 }} />
                        <button onClick={() => saveEdit(s.settingKey)} style={{ ...btn(), padding: '5px 12px' }}>Save</button>
                        <button onClick={() => setEditing(null)} style={{ ...btn('#9CA3AF'), padding: '5px 12px' }}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1F2937', background: '#F3F4F6', padding: '3px 10px', borderRadius: 6 }}>
                          {typeof s.settingValue === 'boolean' ? (s.settingValue ? 'true' : 'false') : String(s.settingValue)}
                        </span>
                        <button onClick={() => startEdit(s)} style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12, color: '#6B7280' }}>Edit</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {settings.length === 0 && (
              <div style={{ ...card, textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#9CA3AF', fontSize: 14 }}>No settings found.</p>
                <button onClick={seed} style={{ ...btn(), marginTop: 12 }}>Seed Default Settings</button>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button onClick={() => setShowModelForm(f => !f)} style={btn('#1F2937')}>+ Add Forecast Model</button>
            </div>

            {showModelForm && (
              <div style={card}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 14 }}>New Forecast Model</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { label: 'Name *', key: 'name', type: 'text' },
                    { label: 'Description', key: 'description', type: 'text' },
                    { label: 'Training Periods', key: 'trainingPeriods', type: 'number' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{f.label}</label>
                      <input type={f.type} value={modelForm[f.key]} onChange={e => setModelForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  {[
                    { label: 'Forecast Type', key: 'forecastType', opts: ['sales','demand','inventory','production','cashflow','revenue','expense','workforce','maintenance','warranty','project'] },
                    { label: 'Algorithm', key: 'algorithm', opts: ['linear_regression','exponential_smoothing','arima','neural_network','ensemble'] },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{f.label}</label>
                      <select value={modelForm[f.key]} onChange={e => setModelForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, background: '#fff', boxSizing: 'border-box' }}>
                        {f.opts.map(o => <option key={o} value={o}>{o.replace(/_/g,' ')}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={createModel} style={btn()}>Create Model</button>
                  <button onClick={() => setShowModelForm(false)} style={btn('#6B7280')}>Cancel</button>
                </div>
              </div>
            )}

            <div style={card}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Forecast Models ({models.length})</h3>
              {models.length === 0
                ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>No forecast models configured.</p>
                : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                          {['Code','Name','Type','Algorithm','Training Periods','Active','Accuracy','Last Trained',''].map(h => (
                            <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {models.map(m => (
                          <tr key={m._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#9CA3AF' }}>{m.modelCode}</td>
                            <td style={{ padding: '10px 14px', fontWeight: 600 }}>{m.name}</td>
                            <td style={{ padding: '10px 14px', textTransform: 'capitalize' }}>{m.forecastType}</td>
                            <td style={{ padding: '10px 14px', color: '#6B7280' }}>{m.algorithm?.replace(/_/g,' ')}</td>
                            <td style={{ padding: '10px 14px' }}>{m.trainingPeriods} mo</td>
                            <td style={{ padding: '10px 14px' }}><span style={{ background: m.isActive ? '#DCFCE7' : '#F3F4F6', color: m.isActive ? '#16A34A' : '#9CA3AF', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{m.isActive ? 'Active' : 'Inactive'}</span></td>
                            <td style={{ padding: '10px 14px', color: '#6B7280' }}>{m.accuracy != null ? `${m.accuracy?.toFixed(1)}%` : '-'}</td>
                            <td style={{ padding: '10px 14px', color: '#9CA3AF' }}>{m.lastTrained ? new Date(m.lastTrained).toLocaleDateString() : '-'}</td>
                            <td style={{ padding: '10px 14px' }}>
                              <button onClick={() => removeModel(m._id)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 12 }}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              }
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
