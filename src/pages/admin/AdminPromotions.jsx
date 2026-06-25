import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import { fetchPromotions, createPromotion, approvePromotion, rejectPromotion, deletePromotion, fetchEmployees, fetchDesignations, fetchDepartments } from '../../services/hrmsAPI';

const STATUS_COLORS = { pending:'#f97316', approved:'#22c55e', rejected:'#ef4444' };
const PRO_TYPES = ['merit','time_bound','spot','lateral'];
const EMPTY = { employee:'', effectiveDate:'', fromDesignation:'', toDesignation:'', fromDepartment:'', toDepartment:'', fromCtc:'', toCtc:'', fromBasic:'', toBasic:'', promotionType:'merit', reason:'' };
const s = { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'7px 10px', fontSize:12.5, color:'var(--text)', fontFamily:'Poppins, sans-serif', width:'100%', boxSizing:'border-box' };
const Label = ({ children }) => <label style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', display:'block', marginBottom:4 }}>{children}</label>;

export default function AdminPromotions() {
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [employees, setEmployees] = useState([]);
  const [desigs, setDesigs]   = useState([]);
  const [depts, setDepts]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const r = await fetchPromotions(params);
      setRows(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    Promise.allSettled([fetchEmployees({limit:200}), fetchDesignations(), fetchDepartments()]).then(([e,d,dep]) => {
      if (e.status==='fulfilled') setEmployees(e.value.data.data||[]);
      if (d.status==='fulfilled') setDesigs(d.value.data.data||[]);
      if (dep.status==='fulfilled') setDepts(dep.value.data.data||[]);
    });
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const payload = { ...form };
      Object.keys(payload).forEach(k => { if (!payload[k]) delete payload[k]; });
      await createPromotion(payload);
      setShowModal(false); setForm(EMPTY); load();
    } catch (e) { setErr(e?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleApprove = async (id) => { await approvePromotion(id).catch(() => {}); load(); };
  const handleReject  = async (id) => { await rejectPromotion(id).catch(() => {}); load(); };
  const handleDelete  = async (id) => { if (!window.confirm('Delete?')) return; await deletePromotion(id).catch(() => {}); load(); };

  return (
    <div style={{ fontFamily:'Poppins, sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Promotions</h1>
          <p style={{ fontSize:12, color:'var(--text-4)', margin:0 }}>{total} promotions</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:13 }}>
          <FiPlus size={14} /> Create Promotion
        </button>
      </div>

      <div style={{ marginBottom:14 }}>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ ...s, width:'auto' }}>
          <option value="">All Status</option>
          {['pending','approved','rejected'].map(v=><option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
          <thead>
            <tr style={{ borderBottom:'2px solid var(--border)', background:'var(--bg)' }}>
              {['Promo #','Employee','Type','Effective Date','From','To','CTC Change','Status','Actions'].map(h=>(
                <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, fontSize:11, textTransform:'uppercase', color:'var(--text-4)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={9} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>Loading…</td></tr>
              : rows.length === 0
                ? <tr><td colSpan={9} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>No promotions</td></tr>
                : rows.map(r => (
                    <tr key={r._id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'9px 12px', fontFamily:'monospace', fontSize:11, color:'var(--accent)' }}>{r.promotionNumber}</td>
                      <td style={{ padding:'9px 12px', fontWeight:600 }}>{r.employee?.displayName || r.employee?.employeeCode || '—'}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)', textTransform:'capitalize' }}>{r.promotionType?.replace(/_/g,' ')}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{r.effectiveDate ? new Date(r.effectiveDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{r.fromDesignation?.title || '—'}</td>
                      <td style={{ padding:'9px 12px', fontWeight:600, color:'#22c55e' }}>{r.toDesignation?.title || '—'}</td>
                      <td style={{ padding:'9px 12px', color:r.incrementPct > 0 ? '#22c55e' : 'var(--text-4)', fontSize:11 }}>
                        {r.fromCtc && r.toCtc ? `+${r.incrementPct?.toFixed(1)}%` : '—'}
                      </td>
                      <td style={{ padding:'9px 12px' }}>
                        <span style={{ padding:'2px 8px', borderRadius:999, background:`${STATUS_COLORS[r.status]||'#6b7280'}20`, color:STATUS_COLORS[r.status]||'#6b7280', fontWeight:700, fontSize:10, textTransform:'uppercase' }}>{r.status}</span>
                      </td>
                      <td style={{ padding:'9px 12px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          {r.status === 'pending' && (
                            <>
                              <button onClick={() => handleApprove(r._id)} style={{ display:'flex', alignItems:'center', gap:3, padding:'3px 8px', background:'#22c55e', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontSize:11, fontWeight:700 }}><FiCheck size={10} /> Approve</button>
                              <button onClick={() => handleReject(r._id)} style={{ display:'flex', alignItems:'center', gap:3, padding:'3px 8px', background:'#ef4444', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontSize:11, fontWeight:700 }}><FiX size={10} /> Reject</button>
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

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'var(--card)', borderRadius:'var(--radius-md)', padding:'1.5rem', width:'100%', maxWidth:540, maxHeight:'90vh', overflowY:'auto' }}>
            <h2 style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>Create Promotion</h2>
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
                  <Label>Promotion Type</Label>
                  <select value={form.promotionType} onChange={e=>setForm(p=>({...p,promotionType:e.target.value}))} style={s}>
                    {PRO_TYPES.map(v=><option key={v} value={v}>{v.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <div><Label>Effective Date *</Label><input type="date" value={form.effectiveDate} onChange={e=>setForm(p=>({...p,effectiveDate:e.target.value}))} required style={s} /></div>
                <div><Label>From Designation</Label>
                  <select value={form.fromDesignation} onChange={e=>setForm(p=>({...p,fromDesignation:e.target.value}))} style={s}>
                    <option value="">—</option>{desigs.map(d=><option key={d._id} value={d._id}>{d.title}</option>)}
                  </select>
                </div>
                <div><Label>To Designation</Label>
                  <select value={form.toDesignation} onChange={e=>setForm(p=>({...p,toDesignation:e.target.value}))} style={s}>
                    <option value="">—</option>{desigs.map(d=><option key={d._id} value={d._id}>{d.title}</option>)}
                  </select>
                </div>
                {[['fromCtc','From CTC (₹)'],['toCtc','To CTC (₹)'],['fromBasic','From Basic (₹)'],['toBasic','To Basic (₹)']].map(([f,l]) => (
                  <div key={f}><Label>{l}</Label><input type="number" value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={s} /></div>
                ))}
                <div style={{ gridColumn:'1/-1' }}><Label>Reason</Label><textarea value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))} rows={2} style={s} /></div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY); setErr(''); }} style={{ padding:'7px 16px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--bg)', cursor:'pointer', fontSize:12.5 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:'7px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12.5 }}>{saving?'Saving…':'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
