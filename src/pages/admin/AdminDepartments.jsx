import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/hrmsAPI';

const EMPTY = { name:'', description:'', budget:'' };
const s = { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'7px 10px', fontSize:12.5, color:'var(--text)', fontFamily:'Poppins, sans-serif', width:'100%', boxSizing:'border-box' };
const Label = ({ children }) => <label style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', display:'block', marginBottom:4 }}>{children}</label>;

export default function AdminDepartments() {
  const [depts, setDepts]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchDepartments();
      setDepts(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew  = () => { setEditing(null); setForm(EMPTY); setErr(''); setShowModal(true); };
  const openEdit = (d) => { setEditing(d._id); setForm({ name:d.name, description:d.description||'', budget:d.budget||'' }); setErr(''); setShowModal(true); };
  const close    = () => { setShowModal(false); setEditing(null); setForm(EMPTY); setErr(''); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      if (editing) await updateDepartment(editing, form);
      else         await createDepartment(form);
      close(); load();
    } catch (e) { setErr(e?.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    await deleteDepartment(id).catch(() => {});
    load();
  };

  return (
    <div style={{ fontFamily:'Poppins, sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Departments</h1>
          <p style={{ fontSize:12, color:'var(--text-4)', margin:0 }}>{total} departments</p>
        </div>
        <button onClick={openNew} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:13 }}>
          <FiPlus size={14} /> Add Department
        </button>
      </div>

      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
          <thead>
            <tr style={{ borderBottom:'2px solid var(--border)', background:'var(--bg)' }}>
              {['Code','Name','Head Count','Budget','Active','Actions'].map(h => (
                <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, fontSize:11, textTransform:'uppercase', color:'var(--text-4)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={6} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>Loading…</td></tr>
              : depts.length === 0
                ? <tr><td colSpan={6} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>No departments found</td></tr>
                : depts.map(d => (
                    <tr key={d._id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'9px 12px', fontFamily:'monospace', fontSize:11, color:'var(--accent)' }}>{d.deptCode}</td>
                      <td style={{ padding:'9px 12px', fontWeight:600 }}>{d.name}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{d.headCount || 0}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{d.budget ? `₹${Number(d.budget).toLocaleString('en-IN')}` : '—'}</td>
                      <td style={{ padding:'9px 12px' }}>
                        <span style={{ padding:'2px 8px', borderRadius:999, background:d.isActive?'#22c55e20':'#ef444420', color:d.isActive?'#22c55e':'#ef4444', fontWeight:700, fontSize:10 }}>{d.isActive?'Active':'Inactive'}</span>
                      </td>
                      <td style={{ padding:'9px 12px' }}>
                        <div style={{ display:'flex', gap:8 }}>
                          <button onClick={() => openEdit(d)} style={{ background:'none', border:'none', cursor:'pointer', color:'#3b82f6' }}><FiEdit2 size={13} /></button>
                          <button onClick={() => handleDelete(d._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}><FiTrash2 size={13} /></button>
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
          <div style={{ background:'var(--card)', borderRadius:'var(--radius-md)', padding:'1.5rem', width:'100%', maxWidth:440 }}>
            <h2 style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>{editing ? 'Edit' : 'New'} Department</h2>
            {err && <p style={{ color:'#ef4444', fontSize:12, marginBottom:10 }}>{err}</p>}
            <form onSubmit={handleSave}>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div><Label>Name *</Label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required style={s} /></div>
                <div><Label>Description</Label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2} style={s} /></div>
                <div><Label>Budget (₹)</Label><input type="number" value={form.budget} onChange={e=>setForm(p=>({...p,budget:e.target.value}))} style={s} /></div>
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
