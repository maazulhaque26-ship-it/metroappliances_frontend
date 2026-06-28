import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { fetchScenarios, createScenario, deleteScenario, compareScenarios } from '../../services/aiAPI';

const card = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 20 };
const btn  = (c = '#3B82F6') => ({ background: c, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 });

export default function AdminAIScenarioComparison() {
  const [scenarios, setScenarios]   = useState([]);
  const [selected,  setSelected]    = useState([]);
  const [comparison,setComparison]  = useState(null);
  const [loading,   setLoading]     = useState(true);
  const [showForm,  setShowForm]    = useState(false);
  const [form,      setForm]        = useState({ name: '', description: '', assumptions: '', adjustments: '' });
  const [msg,       setMsg]         = useState('');

  const load = () => {
    setLoading(true);
    fetchScenarios()
      .then(r => setScenarios(r.data.data?.data || r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    setComparison(null);
  };

  const compare = async () => {
    if (selected.length < 2) { setMsg('Select at least 2 scenarios to compare'); return; }
    const r = await compareScenarios(selected).catch(() => null);
    if (r) setComparison(r.data.data || r.data);
  };

  const create = async () => {
    if (!form.name.trim()) { setMsg('Name is required'); return; }
    let assumptions = {}, adjustments = {};
    try { assumptions = form.assumptions ? JSON.parse(form.assumptions) : {}; } catch { setMsg('Assumptions must be valid JSON'); return; }
    try { adjustments = form.adjustments ? JSON.parse(form.adjustments) : {}; } catch { setMsg('Adjustments must be valid JSON'); return; }
    await createScenario({ ...form, assumptions, adjustments }).catch(() => {});
    setForm({ name: '', description: '', assumptions: '', adjustments: '' });
    setShowForm(false);
    setMsg('✓ Scenario created');
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this scenario?')) return;
    await deleteScenario(id).catch(() => {});
    setSelected(s => s.filter(i => i !== id));
    load();
  };

  return (
    <AdminLayout>
      <div style={{ padding: '28px 32px', fontFamily: 'Poppins, sans-serif', maxWidth: 1400 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1F2937', marginBottom: 4 }}>Scenario Comparison</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 28 }}>Create and compare forecast scenarios to support decision-making</p>

        {msg && <div style={{ padding: '10px 16px', borderRadius: 8, background: msg.startsWith('✓') ? '#DCFCE7' : '#FEF9C3', color: msg.startsWith('✓') ? '#16A34A' : '#92400E', marginBottom: 16, fontSize: 13 }}>{msg}</div>}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button onClick={() => setShowForm(f => !f)} style={btn('#1F2937')}>+ New Scenario</button>
          {selected.length >= 2 && <button onClick={compare} style={btn('#7C3AED')}>Compare Selected ({selected.length})</button>}
        </div>

        {/* Create Form */}
        {showForm && (
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>New Scenario</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Name *', key: 'name', placeholder: 'e.g. Optimistic Growth Q3' },
                { label: 'Description', key: 'description', placeholder: 'Brief description...' },
                { label: 'Assumptions (JSON)', key: 'assumptions', placeholder: '{"marketGrowth": 10}' },
                { label: 'Adjustments (JSON)', key: 'adjustments', placeholder: '{"revenueFactor": 1.1}' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{f.label}</label>
                  <input
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', marginTop: 4, padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={create} style={btn()}>Create Scenario</button>
              <button onClick={() => setShowForm(false)} style={{ ...btn('#6B7280') }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Scenarios Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
          {loading
            ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>Loading...</p>
            : scenarios.length === 0
            ? <p style={{ color: '#9CA3AF', fontSize: 13 }}>No scenarios yet. Create one above.</p>
            : scenarios.map(sc => {
              const isSel = selected.includes(sc._id);
              return (
                <div key={sc._id} style={{ background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: `2px solid ${isSel ? '#7C3AED' : 'transparent'}`, cursor: 'pointer' }}
                  onClick={() => toggleSelect(sc._id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1F2937' }}>{sc.name}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{sc.scenarioCode}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {isSel && <span style={{ fontSize: 10, background: '#EDE9FE', color: '#7C3AED', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>Selected</span>}
                      <span style={{ fontSize: 10, background: '#F3F4F6', color: '#6B7280', padding: '2px 8px', borderRadius: 10 }}>{sc.status}</span>
                    </div>
                  </div>
                  {sc.description && <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 8px' }}>{sc.description}</p>}
                  {sc.assumptions && Object.keys(sc.assumptions).length > 0 && (
                    <div style={{ background: '#F9FAFB', borderRadius: 6, padding: '6px 10px', fontSize: 11, color: '#374151', marginBottom: 6 }}>
                      <strong>Assumptions:</strong> {Object.entries(sc.assumptions).map(([k,v]) => `${k}: ${v}`).join(', ')}
                    </div>
                  )}
                  <button onClick={e => { e.stopPropagation(); remove(sc._id); }}
                    style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: 12, padding: '4px 0', marginTop: 4 }}>Delete</button>
                </div>
              );
            })
          }
        </div>

        {/* Comparison Result */}
        {comparison && (
          <div style={card}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Comparison Results</h3>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparison.scenarios?.length || 2}, 1fr)`, gap: 16 }}>
              {(comparison.scenarios || []).map(sc => (
                <div key={sc._id} style={{ background: '#F5F3FF', borderRadius: 10, padding: 16, border: '1px solid #DDD6FE' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#5B21B6', marginBottom: 8 }}>{sc.name}</div>
                  {sc.assumptions && <div style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}><strong>Assumptions:</strong> {JSON.stringify(sc.assumptions, null, 0)}</div>}
                  {sc.adjustments && <div style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}><strong>Adjustments:</strong> {JSON.stringify(sc.adjustments, null, 0)}</div>}
                  {sc.results && <div style={{ fontSize: 12, color: '#374151' }}><strong>Results:</strong> {JSON.stringify(sc.results, null, 0)}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
