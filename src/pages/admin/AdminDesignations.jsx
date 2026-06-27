import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { fetchDesignations, createDesignation, updateDesignation, deleteDesignation, fetchDepartments } from '../../services/hrmsAPI';

const EMPTY = { title:'', level:'', grade:'', department:'', minSalary:'', maxSalary:'' };
const s = { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'7px 10px', fontSize:12.5, color:'var(--text)', fontFamily:'Poppins, sans-serif', width:'100%', boxSizing:'border-box' };
const Label = ({ children }) => <label style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', display:'block', marginBottom:4 }}>{children}</label>;

export default function AdminDesignations() {
  const [rows, setRows]       = useState([]);
  const [depts, setDepts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, d] = await Promise.all([fetchDesignations(), fetchDepartments()]);
      setRows(r.data.data || []);
      setDepts(d.data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew  = () => { setEditing(null); setForm(EMPTY); setErr(''); setShowModal(true); };
  const openEdit = (r) => { setEditing(r._id); setForm({ title:r.title, level:r.level||'', grade:r.grade||'', department:r.department?._id||'', minSalary:r.minSalary||'', maxSalary:r.maxSalary||'' }); setErr(''); setShowModal(true); };
  const close    = () => { setShowModal(false); setEditing(null); setForm(EMPTY); setErr(''); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      if (editing) await updateDesignation(editing, form);
      else         await createDesignation(form);
      close(); load();
    } catch (e) { setErr(e?.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this designation?')) return;
    await deleteDesignation(id).catch(() => {});
    load();
  };

  return (
    <div style={{ fontFamily:'Poppins, sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Designations</h1>
          <p style={{ fontSize:12, color:'var(--text-4)', margin:0 }}>{rows.length} designations</p>
        </div>
        <button onClick={openNew} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:13 }}>
          <FiPlus size={14} /> Add Designation
        </button>
      </div>

      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
          <thead>
            <tr style={{ borderBottom:'2px solid var(--border)', background:'var(--bg)' }}>
              {['Code','Title','Level','Grade','Department','Salary Range','Active','Actions'].map(h => (
                <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, fontSize:11, textTransform:'uppercase', color:'var(--text-4)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>Loading…</td></tr>
              : rows.length === 0
                ? <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>No designations found</td></tr>
                : rows.map(r => (
                    <tr key={r._id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'9px 12px', fontFamily:'monospace', fontSize:11, color:'var(--accent)' }}>{r.designationCode}</td>
                      <td style={{ padding:'9px 12px', fontWeight:600 }}>{r.title}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{r.level || '—'}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{r.grade || '—'}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{r.department?.name || '—'}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)', fontSize:11 }}>
                        {r.minSalary && r.maxSalary ? `₹${Number(r.minSalary).toLocaleString('en-IN')} – ₹${Number(r.maxSalary).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding:'9px 12px' }}>
                        <span style={{ padding:'2px 8px', borderRadius:999, background:r.isActive?'#22c55e20':'#ef444420', color:r.isActive?'#22c55e':'#ef4444', fontWeight:700, fontSize:10 }}>{r.isActive?'Active':'Inactive'}</span>
                      </td>
                      <td style={{ padding:'9px 12px' }}>
                        <div style={{ display:'flex', gap:8 }}>
                          <button onClick={() => openEdit(r)} style={{ background:'none', border:'none', cursor:'pointer', color:'#3b82f6' }}><FiEdit2 size={13} /></button>
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
          <div style={{ background:'var(--card)', borderRadius:'var(--radius-md)', padding:'1.5rem', width:'100%', maxWidth:480 }}>
            <h2 style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>{editing ? 'Edit' : 'New'} Designation</h2>
            {err && <p style={{ color:'#ef4444', fontSize:12, marginBottom:10 }}>{err}</p>}
            <form onSubmit={handleSave}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={{ gridColumn:'1/-1' }}><Label>Title *</Label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required style={s} /></div>
                <div><Label>Level</Label><input value={form.level} onChange={e=>setForm(p=>({...p,level:e.target.value}))} style={s} placeholder="e.g. L3" /></div>
                <div><Label>Grade</Label><input value={form.grade} onChange={e=>setForm(p=>({...p,grade:e.target.value}))} style={s} placeholder="e.g. G3" /></div>
                <div style={{ gridColumn:'1/-1' }}>
                  <Label>Department</Label>
                  <select value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))} style={s}>
                    <option value="">— Select —</option>
                    {depts.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div><Label>Min Salary (₹)</Label><input type="number" value={form.minSalary} onChange={e=>setForm(p=>({...p,minSalary:e.target.value}))} style={s} /></div>
                <div><Label>Max Salary (₹)</Label><input type="number" value={form.maxSalary} onChange={e=>setForm(p=>({...p,maxSalary:e.target.value}))} style={s} /></div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'flex-end' }}>
                <button type="button" onClick={close} style={{ padding:'7px 16px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--bg)', cursor:'pointer', fontSize:12.5 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:'7px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12.5 }}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
