import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiTrash2, FiCheck, FiAlertCircle, FiSearch } from 'react-icons/fi';
import { fetchDocuments, fetchExpiringDocuments, createDocument, verifyDocument, deleteDocument, fetchEmployees } from '../../services/hrmsAPI';

const DOC_TYPES = ['aadhar','pan','passport','offer_letter','appointment_letter','id_proof','address_proof','educational','experience','medical','nda','other'];
const EMPTY = { employee:'', docType:'aadhar', docName:'', fileUrl:'', issueDate:'', expiryDate:'', notes:'' };
const s = { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'7px 10px', fontSize:12.5, color:'var(--text)', fontFamily:'Poppins, sans-serif', width:'100%', boxSizing:'border-box' };
const Label = ({ children }) => <label style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', display:'block', marginBottom:4 }}>{children}</label>;

export default function AdminEmployeeDocuments() {
  const [docs, setDocs]       = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [tab, setTab]         = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]       = useState(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      const [d, e, emps] = await Promise.all([
        fetchDocuments(params),
        fetchExpiringDocuments({ days: 60 }),
        fetchEmployees({ limit: 200 }),
      ]);
      setDocs(d.data.data || []);
      setTotal(d.data.total || 0);
      setExpiring(e.data.data || []);
      setEmployees(emps.data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      await createDocument(form);
      setShowModal(false); setForm(EMPTY); load();
    } catch (e) { setErr(e?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleVerify = async (id) => {
    await verifyDocument(id).catch(() => {}); load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete document?')) return;
    await deleteDocument(id).catch(() => {}); load();
  };

  const filtered = (tab === 'expiring' ? expiring : docs).filter(d =>
    !search || (d.docName||'').toLowerCase().includes(search.toLowerCase()) ||
    (d.employee?.displayName||'').toLowerCase().includes(search.toLowerCase())
  );
  const pages = Math.ceil(total / LIMIT);

  return (
    <div style={{ fontFamily:'Poppins, sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Employee Documents</h1>
          <p style={{ fontSize:12, color:'var(--text-4)', margin:0 }}>{total} documents{expiring.length > 0 && ` · `}<span style={{ color:'#f97316' }}>{expiring.length > 0 && `${expiring.length} expiring in 60 days`}</span></p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:13 }}>
          <FiPlus size={14} /> Add Document
        </button>
      </div>

      {expiring.length > 0 && (
        <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f9731620', border:'1px solid #f97316', borderRadius:'var(--radius-sm)', padding:'10px 14px', marginBottom:14 }}>
          <FiAlertCircle size={14} color="#f97316" />
          <span style={{ fontSize:12.5, color:'#f97316', fontWeight:600 }}>{expiring.length} document(s) expiring within 60 days</span>
          <button onClick={() => setTab('expiring')} style={{ marginLeft:'auto', fontSize:11.5, color:'#f97316', background:'none', border:'1px solid #f97316', borderRadius:'var(--radius-sm)', padding:'3px 10px', cursor:'pointer', fontWeight:700 }}>View</button>
        </div>
      )}

      <div style={{ display:'flex', gap:4, borderBottom:'1px solid var(--border)', marginBottom:14 }}>
        {['all','expiring'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'8px 14px', border:'none', borderBottom:`2px solid ${tab===t?'var(--accent)':'transparent'}`, background:'none', cursor:'pointer', fontSize:12.5, fontWeight:tab===t?700:500, color:tab===t?'var(--accent)':'var(--text-4)', fontFamily:'Poppins, sans-serif', textTransform:'capitalize' }}>{t === 'expiring' ? `Expiring (${expiring.length})` : 'All Documents'}</button>
        ))}
      </div>

      <div style={{ position:'relative', marginBottom:12 }}>
        <FiSearch size={12} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'var(--text-4)' }} />
        <input placeholder="Search by name or employee…" value={search} onChange={e=>setSearch(e.target.value)} style={{ ...s, paddingLeft:28 }} />
      </div>

      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
          <thead>
            <tr style={{ borderBottom:'2px solid var(--border)', background:'var(--bg)' }}>
              {['Employee','Document','Type','Issue Date','Expiry','Verified','Actions'].map(h=>(
                <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, fontSize:11, textTransform:'uppercase', color:'var(--text-4)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={7} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>Loading…</td></tr>
              : filtered.length === 0
                ? <tr><td colSpan={7} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>No documents</td></tr>
                : filtered.map(d => (
                    <tr key={d._id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'9px 12px', fontWeight:600 }}>{d.employee?.displayName || d.employee?.employeeCode || '—'}</td>
                      <td style={{ padding:'9px 12px' }}>{d.docName || '—'}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)', textTransform:'uppercase', fontSize:10.5 }}>{d.docType}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{d.issueDate ? new Date(d.issueDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td style={{ padding:'9px 12px', color: d.expiryDate && new Date(d.expiryDate) < new Date(Date.now() + 60*24*60*60*1000) ? '#f97316' : 'var(--text-4)' }}>
                        {d.expiryDate ? new Date(d.expiryDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ padding:'9px 12px' }}>
                        {d.isVerified
                          ? <span style={{ display:'flex', alignItems:'center', gap:4, color:'#22c55e', fontSize:11, fontWeight:700 }}><FiCheck size={11} /> Verified</span>
                          : <span style={{ color:'var(--text-4)', fontSize:11 }}>Pending</span>
                        }
                      </td>
                      <td style={{ padding:'9px 12px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          {!d.isVerified && (
                            <button onClick={() => handleVerify(d._id)} title="Verify" style={{ display:'flex', alignItems:'center', gap:3, padding:'3px 8px', background:'#22c55e', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontSize:11, fontWeight:700 }}>
                              <FiCheck size={10} /> Verify
                            </button>
                          )}
                          <button onClick={() => handleDelete(d._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}><FiTrash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
            }
          </tbody>
        </table>
      </div>

      {tab === 'all' && pages > 1 && (
        <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:14 }}>
          <button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{ padding:'5px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', cursor:'pointer', background:'var(--bg)', fontSize:12 }}>Prev</button>
          <span style={{ padding:'5px 12px', fontSize:12, color:'var(--text-4)' }}>{page} / {pages}</span>
          <button disabled={page===pages} onClick={()=>setPage(p=>p+1)} style={{ padding:'5px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', cursor:'pointer', background:'var(--bg)', fontSize:12 }}>Next</button>
        </div>
      )}

      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'var(--card)', borderRadius:'var(--radius-md)', padding:'1.5rem', width:'100%', maxWidth:480 }}>
            <h2 style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>Add Document</h2>
            {err && <p style={{ color:'#ef4444', fontSize:12, marginBottom:10 }}>{err}</p>}
            <form onSubmit={handleCreate}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <Label>Employee *</Label>
                  <select value={form.employee} onChange={e=>setForm(p=>({...p,employee:e.target.value}))} required style={s}>
                    <option value="">— Select Employee —</option>
                    {employees.map(e=><option key={e._id} value={e._id}>{e.displayName || `${e.firstName} ${e.lastName}`} ({e.employeeCode})</option>)}
                  </select>
                </div>
                <div>
                  <Label>Document Type</Label>
                  <select value={form.docType} onChange={e=>setForm(p=>({...p,docType:e.target.value}))} style={s}>
                    {DOC_TYPES.map(t=><option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <div><Label>Document Name</Label><input value={form.docName} onChange={e=>setForm(p=>({...p,docName:e.target.value}))} style={s} /></div>
                <div><Label>File URL</Label><input value={form.fileUrl} onChange={e=>setForm(p=>({...p,fileUrl:e.target.value}))} style={s} /></div>
                <div><Label>Issue Date</Label><input type="date" value={form.issueDate} onChange={e=>setForm(p=>({...p,issueDate:e.target.value}))} style={s} /></div>
                <div><Label>Expiry Date</Label><input type="date" value={form.expiryDate} onChange={e=>setForm(p=>({...p,expiryDate:e.target.value}))} style={s} /></div>
                <div style={{ gridColumn:'1/-1' }}><Label>Notes</Label><textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={2} style={s} /></div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY); setErr(''); }} style={{ padding:'7px 16px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--bg)', cursor:'pointer', fontSize:12.5 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:'7px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12.5 }}>{saving?'Saving…':'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
