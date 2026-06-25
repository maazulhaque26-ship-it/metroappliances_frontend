import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiCheck, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { fetchProbations, createProbation, confirmProbation, extendProbation, deleteProbation, fetchEmployees } from '../../services/hrmsAPI';

const STATUS_COLORS = { active:'#f97316', extended:'#a855f7', confirmed:'#22c55e', terminated:'#ef4444' };
const EMPTY = { employee:'', startDate:'', endDate:'', durationMonths:3 };
const s = { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'7px 10px', fontSize:12.5, color:'var(--text)', fontFamily:'Poppins, sans-serif', width:'100%', boxSizing:'border-box' };
const Label = ({ children }) => <label style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', display:'block', marginBottom:4 }}>{children}</label>;

export default function AdminProbation() {
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [extendModal, setExtendModal] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [extForm, setExtForm] = useState({ extensionMonths:1, extensionReason:'' });
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const r = await fetchProbations(params);
      setRows(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetchEmployees({ limit:200 }).then(r => setEmployees(r.data.data||[])).catch(()=>{}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try { await createProbation(form); setShowModal(false); setForm(EMPTY); load(); }
    catch (e) { setErr(e?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleConfirm = async (id) => { await confirmProbation(id).catch(() => {}); load(); };
  const handleExtend  = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try { await extendProbation(extendModal, extForm); setExtendModal(null); setExtForm({ extensionMonths:1, extensionReason:'' }); load(); }
    catch (e) { setErr(e?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id) => { if (!window.confirm('Delete?')) return; await deleteProbation(id).catch(()=>{}); load(); };

  return (
    <div style={{ fontFamily:'Poppins, sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Probation Management</h1>
          <p style={{ fontSize:12, color:'var(--text-4)', margin:0 }}>{total} probation records</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:13 }}>
          <FiPlus size={14} /> Add Probation
        </button>
      </div>

      <div style={{ marginBottom:14 }}>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ ...s, width:'auto' }}>
          <option value="">All Status</option>
          {['active','extended','confirmed','terminated'].map(v=><option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
          <thead>
            <tr style={{ borderBottom:'2px solid var(--border)', background:'var(--bg)' }}>
              {['Probation #','Employee','Start','End','Duration','Rating','Status','Actions'].map(h=>(
                <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, fontSize:11, textTransform:'uppercase', color:'var(--text-4)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>Loading…</td></tr>
              : rows.length === 0
                ? <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>No probation records</td></tr>
                : rows.map(r => (
                    <tr key={r._id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'9px 12px', fontFamily:'monospace', fontSize:11, color:'var(--accent)' }}>{r.probationNumber}</td>
                      <td style={{ padding:'9px 12px', fontWeight:600 }}>{r.employee?.displayName || r.employee?.employeeCode || '—'}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{r.startDate ? new Date(r.startDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{r.endDate ? new Date(r.endDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{r.durationMonths} mo{r.extensionMonths ? ` +${r.extensionMonths}` : ''}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{r.performanceRating ? `${r.performanceRating}/5` : '—'}</td>
                      <td style={{ padding:'9px 12px' }}>
                        <span style={{ padding:'2px 8px', borderRadius:999, background:`${STATUS_COLORS[r.status]||'#6b7280'}20`, color:STATUS_COLORS[r.status]||'#6b7280', fontWeight:700, fontSize:10, textTransform:'uppercase' }}>{r.status}</span>
                      </td>
                      <td style={{ padding:'9px 12px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          {r.status === 'active' && (
                            <>
                              <button onClick={() => handleConfirm(r._id)} title="Confirm" style={{ display:'flex', alignItems:'center', gap:3, padding:'3px 8px', background:'#22c55e', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontSize:11, fontWeight:700 }}><FiCheck size={10} /> Confirm</button>
                              <button onClick={() => { setExtendModal(r._id); setErr(''); }} title="Extend" style={{ display:'flex', alignItems:'center', gap:3, padding:'3px 8px', background:'#a855f7', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontSize:11, fontWeight:700 }}><FiRefreshCw size={10} /> Extend</button>
                            </>
                          )}
                          <button onClick={() => handleDelete(r._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}><FiTrash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
            }
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'var(--card)', borderRadius:'var(--radius-md)', padding:'1.5rem', width:'100%', maxWidth:420 }}>
            <h2 style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>Add Probation</h2>
            {err && <p style={{ color:'#ef4444', fontSize:12, marginBottom:10 }}>{err}</p>}
            <form onSubmit={handleCreate}>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div><Label>Employee *</Label>
                  <select value={form.employee} onChange={e=>setForm(p=>({...p,employee:e.target.value}))} required style={s}>
                    <option value="">— Select —</option>
                    {employees.map(e=><option key={e._id} value={e._id}>{e.displayName||`${e.firstName} ${e.lastName}`} ({e.employeeCode})</option>)}
                  </select>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <div><Label>Start Date *</Label><input type="date" value={form.startDate} onChange={e=>setForm(p=>({...p,startDate:e.target.value}))} required style={s} /></div>
                  <div><Label>End Date *</Label><input type="date" value={form.endDate} onChange={e=>setForm(p=>({...p,endDate:e.target.value}))} required style={s} /></div>
                </div>
                <div><Label>Duration (months)</Label><input type="number" min={1} max={12} value={form.durationMonths} onChange={e=>setForm(p=>({...p,durationMonths:e.target.value}))} style={s} /></div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY); setErr(''); }} style={{ padding:'7px 16px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--bg)', cursor:'pointer', fontSize:12.5 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:'7px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12.5 }}>{saving?'Saving…':'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {extendModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'var(--card)', borderRadius:'var(--radius-md)', padding:'1.5rem', width:'100%', maxWidth:380 }}>
            <h2 style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>Extend Probation</h2>
            {err && <p style={{ color:'#ef4444', fontSize:12, marginBottom:10 }}>{err}</p>}
            <form onSubmit={handleExtend}>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div><Label>Extension (months) *</Label><input type="number" min={1} max={12} value={extForm.extensionMonths} onChange={e=>setExtForm(p=>({...p,extensionMonths:e.target.value}))} required style={s} /></div>
                <div><Label>Reason *</Label><textarea value={extForm.extensionReason} onChange={e=>setExtForm(p=>({...p,extensionReason:e.target.value}))} required rows={2} style={s} /></div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => { setExtendModal(null); setErr(''); }} style={{ padding:'7px 16px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--bg)', cursor:'pointer', fontSize:12.5 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:'7px 16px', background:'#a855f7', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12.5 }}>{saving?'Saving…':'Extend'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
