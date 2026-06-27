import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUserCheck } from 'react-icons/fi';
import { fetchEmployees, createEmployee, deleteEmployee, confirmEmployee, fetchDepartments } from '../../services/hrmsAPI';

const STATUS_COLORS = {
  active:'#22c55e', probation:'#f97316', on_notice:'#a855f7',
  terminated:'#ef4444', resigned:'#ef4444', inactive:'#6b7280',
  on_leave:'#3b82f6', retired:'#D4AF37', absconded:'#7f1d1d', confirmed:'#22c55e'
};
const EMP_TYPE_LABELS = { full_time:'Full Time', part_time:'Part Time', contract:'Contract', intern:'Intern', consultant:'Consultant', temporary:'Temporary' };
const STATUS_LIST = ['active','probation','on_notice','terminated','resigned','inactive','on_leave','retired','absconded'];

const EMPTY = { firstName:'', lastName:'', workEmail:'', mobile:'', department:'', designation:'', businessUnit:'', location:'', employmentType:'full_time', joiningDate:'', ctc:'', basicSalary:'' };

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('');
  const [dept, setDept]           = useState('');
  const [depts, setDepts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState('');

  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (status) params.status = status;
      if (dept)   params.department = dept;
      const r = await fetchEmployees(params);
      setEmployees(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page, search, status, dept]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetchDepartments().then(r => setDepts(r.data.data || [])).catch(() => {});
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      await createEmployee(form);
      setShowModal(false); setForm(EMPTY); load();
    } catch (e) { setErr(e?.response?.data?.message || 'Failed to create employee'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    await deleteEmployee(id).catch(() => {});
    load();
  };

  const handleConfirm = async (id) => {
    await confirmEmployee(id).catch(() => {});
    load();
  };

  const inp = (f) => ({ value: form[f] || '', onChange: e => setForm(p => ({ ...p, [f]: e.target.value })) });
  const s = { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'6px 10px', fontSize:12.5, color:'var(--text)', fontFamily:'Poppins, sans-serif' };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div style={{ fontFamily:'Poppins, sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Employees</h1>
          <p style={{ fontSize:12, color:'var(--text-4)', margin:0 }}>{total} total employees</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:13 }}>
          <FiPlus size={14} /> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 200px' }}>
          <FiSearch size={12} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'var(--text-4)' }} />
          <input placeholder="Search name, email, code…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ ...s, paddingLeft:28, width:'100%', boxSizing:'border-box' }} />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={s}>
          <option value="">All Status</option>
          {STATUS_LIST.map(st => <option key={st} value={st}>{st.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
        </select>
        <select value={dept} onChange={e => { setDept(e.target.value); setPage(1); }} style={s}>
          <option value="">All Departments</option>
          {depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
          <thead>
            <tr style={{ borderBottom:'2px solid var(--border)', background:'var(--bg)' }}>
              {['Code','Name','Email','Department','Designation','Type','Status','Actions'].map(h => (
                <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, fontSize:11, textTransform:'uppercase', color:'var(--text-4)', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>Loading…</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={8} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>No employees found</td></tr>
            ) : employees.map(emp => (
              <tr key={emp._id} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'9px 12px', fontFamily:'monospace', fontSize:11, color:'var(--accent)' }}>{emp.employeeCode}</td>
                <td style={{ padding:'9px 12px', fontWeight:600 }}>{emp.displayName || `${emp.firstName} ${emp.lastName}`}</td>
                <td style={{ padding:'9px 12px', color:'var(--text-4)', fontSize:11 }}>{emp.workEmail}</td>
                <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{emp.department?.name || '—'}</td>
                <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{emp.designation?.title || '—'}</td>
                <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{EMP_TYPE_LABELS[emp.employmentType] || emp.employmentType}</td>
                <td style={{ padding:'9px 12px' }}>
                  <span style={{ padding:'2px 8px', borderRadius:999, background:`${STATUS_COLORS[emp.status] || '#6b7280'}20`, color:STATUS_COLORS[emp.status] || '#6b7280', fontWeight:700, fontSize:10, textTransform:'uppercase' }}>{emp.status?.replace(/_/g,' ')}</span>
                </td>
                <td style={{ padding:'9px 12px' }}>
                  <div style={{ display:'flex', gap:6 }}>
                    <Link to={`/admin/hr/employees/${emp._id}`} style={{ color:'#3b82f6', fontSize:13 }} title="View"><FiEdit2 size={13} /></Link>
                    {emp.status === 'probation' && (
                      <button onClick={() => handleConfirm(emp._id)} title="Confirm" style={{ background:'none', border:'none', cursor:'pointer', color:'#22c55e', padding:0 }}><FiUserCheck size={13} /></button>
                    )}
                    <button onClick={() => handleDelete(emp._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', padding:0 }}><FiTrash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:14 }}>
          <button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{ padding:'5px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', cursor:'pointer', background:'var(--bg)', fontSize:12 }}>Prev</button>
          <span style={{ padding:'5px 12px', fontSize:12, color:'var(--text-4)' }}>{page} / {pages}</span>
          <button disabled={page===pages} onClick={()=>setPage(p=>p+1)} style={{ padding:'5px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', cursor:'pointer', background:'var(--bg)', fontSize:12 }}>Next</button>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'var(--card)', borderRadius:'var(--radius-md)', padding:'1.5rem', width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto' }}>
            <h2 style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>New Employee</h2>
            {err && <p style={{ color:'#ef4444', fontSize:12, marginBottom:10 }}>{err}</p>}
            <form onSubmit={handleCreate}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['firstName','First Name'],['lastName','Last Name'],['workEmail','Work Email'],['mobile','Mobile']].map(([f,l]) => (
                  <div key={f}>
                    <label style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', display:'block', marginBottom:4 }}>{l} *</label>
                    <input {...inp(f)} required style={{ ...s, width:'100%', boxSizing:'border-box' }} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', display:'block', marginBottom:4 }}>Employment Type</label>
                  <select {...inp('employmentType')} style={{ ...s, width:'100%', boxSizing:'border-box' }}>
                    {Object.entries(EMP_TYPE_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', display:'block', marginBottom:4 }}>Joining Date *</label>
                  <input type="date" {...inp('joiningDate')} required style={{ ...s, width:'100%', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', display:'block', marginBottom:4 }}>Department</label>
                  <select {...inp('department')} style={{ ...s, width:'100%', boxSizing:'border-box' }}>
                    <option value="">— Select —</option>
                    {depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                {[['ctc','CTC (₹)'],['basicSalary','Basic Salary (₹)']].map(([f,l]) => (
                  <div key={f}>
                    <label style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', display:'block', marginBottom:4 }}>{l}</label>
                    <input type="number" {...inp(f)} style={{ ...s, width:'100%', boxSizing:'border-box' }} />
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:8, marginTop:18, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => { setShowModal(false); setForm(EMPTY); setErr(''); }} style={{ padding:'7px 16px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--bg)', cursor:'pointer', fontSize:12.5 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:'7px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12.5 }}>{saving ? 'Saving…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
