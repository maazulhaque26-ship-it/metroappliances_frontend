import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown } from 'react-icons/fi';
import { fetchExits, fetchExit, createExit, updateExit, deleteExit, fetchEmployees } from '../../services/hrmsAPI';

const STATUS_COLORS = { initiated:'#f97316', in_progress:'#3b82f6', completed:'#22c55e', cancelled:'#6b7280' };
const EXIT_TYPES = ['resignation','termination','retirement','absconding','contract_end','death','voluntary','involuntary'];
const SETTLE_STATUSES = ['pending','processed','paid'];
const EMPTY = { employee:'', exitType:'resignation', resignationDate:'', lastWorkingDay:'', noticePeriodDays:'', exitReason:'', settlementAmount:'' };
const s = { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'7px 10px', fontSize:12.5, color:'var(--text)', fontFamily:'Poppins, sans-serif', width:'100%', boxSizing:'border-box' };
const Label = ({ children }) => <label style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', display:'block', marginBottom:4 }}>{children}</label>;

function ClearanceCheck({ label, checked, onChange }) {
  return (
    <label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:12.5 }}>
      <input type="checkbox" checked={!!checked} onChange={e=>onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export default function AdminExits() {
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [employees, setEmployees] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId]   = useState(null);
  const [editData, setEditData] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const r = await fetchExits(params);
      setRows(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetchEmployees({ limit:200 }).then(r=>setEmployees(r.data.data||[])).catch(()=>{}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const payload = { ...form };
      Object.keys(payload).forEach(k => { if (!payload[k] && payload[k] !== 0) delete payload[k]; });
      await createExit(payload);
      setShowCreate(false); setForm(EMPTY); load();
    } catch (e) { setErr(e?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const openEdit = async (id) => {
    try {
      const r = await fetchExit(id);
      const d = r.data.data;
      setEditData({ itClearance:d.itClearance||false, adminClearance:d.adminClearance||false, financeClearance:d.financeClearance||false, hrClearance:d.hrClearance||false, status:d.status||'initiated', settlementAmount:d.settlementAmount||'', settlementStatus:d.settlementStatus||'pending', notes:d.notes||'' });
      setEditId(id);
    } catch { /* silent */ }
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try { await updateExit(editId, editData); setEditId(null); setEditData(null); load(); }
    catch (e) { setErr(e?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => { if (!window.confirm('Delete exit record?')) return; await deleteExit(id).catch(()=>{}); load(); };

  return (
    <div style={{ fontFamily:'Poppins, sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Exit Management</h1>
          <p style={{ fontSize:12, color:'var(--text-4)', margin:0 }}>{total} exit records</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:13 }}>
          <FiPlus size={14} /> Initiate Exit
        </button>
      </div>

      <div style={{ marginBottom:14 }}>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ ...s, width:'auto' }}>
          <option value="">All Status</option>
          {['initiated','in_progress','completed','cancelled'].map(v=><option key={v} value={v}>{v.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
          <thead>
            <tr style={{ borderBottom:'2px solid var(--border)', background:'var(--bg)' }}>
              {['Exit #','Employee','Type','Last Working Day','Clearances','Settlement','Status','Actions'].map(h=>(
                <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, fontSize:11, textTransform:'uppercase', color:'var(--text-4)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>Loading…</td></tr>
              : rows.length === 0
                ? <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>No exit records</td></tr>
                : rows.map(r => {
                    const clearances = [r.itClearance, r.adminClearance, r.financeClearance, r.hrClearance];
                    const cleared = clearances.filter(Boolean).length;
                    return (
                      <tr key={r._id} style={{ borderBottom:'1px solid var(--border)' }}>
                        <td style={{ padding:'9px 12px', fontFamily:'monospace', fontSize:11, color:'var(--accent)' }}>{r.exitNumber}</td>
                        <td style={{ padding:'9px 12px', fontWeight:600 }}>{r.employee?.displayName || r.employee?.employeeCode || '—'}</td>
                        <td style={{ padding:'9px 12px', color:'var(--text-4)', textTransform:'capitalize' }}>{r.exitType?.replace(/_/g,' ')}</td>
                        <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{r.lastWorkingDay ? new Date(r.lastWorkingDay).toLocaleDateString('en-IN') : '—'}</td>
                        <td style={{ padding:'9px 12px' }}>
                          <span style={{ padding:'2px 8px', borderRadius:999, background:cleared===4?'#22c55e20':'#f9731620', color:cleared===4?'#22c55e':'#f97316', fontWeight:700, fontSize:10 }}>{cleared}/4</span>
                        </td>
                        <td style={{ padding:'9px 12px', color:'var(--text-4)', fontSize:11 }}>
                          {r.settlementAmount ? `₹${Number(r.settlementAmount).toLocaleString('en-IN')} · ${r.settlementStatus}` : '—'}
                        </td>
                        <td style={{ padding:'9px 12px' }}>
                          <span style={{ padding:'2px 8px', borderRadius:999, background:`${STATUS_COLORS[r.status]||'#6b7280'}20`, color:STATUS_COLORS[r.status]||'#6b7280', fontWeight:700, fontSize:10, textTransform:'uppercase' }}>{r.status?.replace(/_/g,' ')}</span>
                        </td>
                        <td style={{ padding:'9px 12px' }}>
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={() => openEdit(r._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#3b82f6' }}><FiEdit2 size={13} /></button>
                            <button onClick={() => handleDelete(r._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}><FiTrash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
            }
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'var(--card)', borderRadius:'var(--radius-md)', padding:'1.5rem', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto' }}>
            <h2 style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>Initiate Exit</h2>
            {err && <p style={{ color:'#ef4444', fontSize:12, marginBottom:10 }}>{err}</p>}
            <form onSubmit={handleCreate}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <Label>Employee *</Label>
                  <select value={form.employee} onChange={e=>setForm(p=>({...p,employee:e.target.value}))} required style={s}>
                    <option value="">— Select —</option>
                    {employees.map(e=><option key={e._id} value={e._id}>{e.displayName||`${e.firstName} ${e.lastName}`} ({e.employeeCode})</option>)}
                  </select>
                </div>
                <div>
                  <Label>Exit Type</Label>
                  <select value={form.exitType} onChange={e=>setForm(p=>({...p,exitType:e.target.value}))} style={s}>
                    {EXIT_TYPES.map(v=><option key={v} value={v}>{v.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <div><Label>Last Working Day *</Label><input type="date" value={form.lastWorkingDay} onChange={e=>setForm(p=>({...p,lastWorkingDay:e.target.value}))} required style={s} /></div>
                <div><Label>Resignation Date</Label><input type="date" value={form.resignationDate} onChange={e=>setForm(p=>({...p,resignationDate:e.target.value}))} style={s} /></div>
                <div><Label>Notice Period (days)</Label><input type="number" value={form.noticePeriodDays} onChange={e=>setForm(p=>({...p,noticePeriodDays:e.target.value}))} style={s} /></div>
                <div><Label>Settlement Amount (₹)</Label><input type="number" value={form.settlementAmount} onChange={e=>setForm(p=>({...p,settlementAmount:e.target.value}))} style={s} /></div>
                <div style={{ gridColumn:'1/-1' }}><Label>Exit Reason</Label><textarea value={form.exitReason} onChange={e=>setForm(p=>({...p,exitReason:e.target.value}))} rows={2} style={s} /></div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => { setShowCreate(false); setForm(EMPTY); setErr(''); }} style={{ padding:'7px 16px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--bg)', cursor:'pointer', fontSize:12.5 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:'7px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12.5 }}>{saving?'Saving…':'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Clearance Modal */}
      {editId && editData && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'var(--card)', borderRadius:'var(--radius-md)', padding:'1.5rem', width:'100%', maxWidth:420 }}>
            <h2 style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>Update Exit / Clearance</h2>
            {err && <p style={{ color:'#ef4444', fontSize:12, marginBottom:10 }}>{err}</p>}
            <form onSubmit={handleUpdate}>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div>
                  <Label>Status</Label>
                  <select value={editData.status} onChange={e=>setEditData(p=>({...p,status:e.target.value}))} style={s}>
                    {['initiated','in_progress','completed','cancelled'].map(v=><option key={v} value={v}>{v.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Clearances</Label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginTop:6 }}>
                    <ClearanceCheck label="IT"      checked={editData.itClearance}      onChange={v=>setEditData(p=>({...p,itClearance:v}))} />
                    <ClearanceCheck label="Admin"   checked={editData.adminClearance}   onChange={v=>setEditData(p=>({...p,adminClearance:v}))} />
                    <ClearanceCheck label="Finance" checked={editData.financeClearance} onChange={v=>setEditData(p=>({...p,financeClearance:v}))} />
                    <ClearanceCheck label="HR"      checked={editData.hrClearance}      onChange={v=>setEditData(p=>({...p,hrClearance:v}))} />
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div><Label>Settlement Amount (₹)</Label><input type="number" value={editData.settlementAmount} onChange={e=>setEditData(p=>({...p,settlementAmount:e.target.value}))} style={s} /></div>
                  <div><Label>Settlement Status</Label>
                    <select value={editData.settlementStatus} onChange={e=>setEditData(p=>({...p,settlementStatus:e.target.value}))} style={s}>
                      {SETTLE_STATUSES.map(v=><option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div><Label>Notes</Label><textarea value={editData.notes} onChange={e=>setEditData(p=>({...p,notes:e.target.value}))} rows={2} style={s} /></div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => { setEditId(null); setEditData(null); setErr(''); }} style={{ padding:'7px 16px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--bg)', cursor:'pointer', fontSize:12.5 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:'7px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12.5 }}>{saving?'Saving…':'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
