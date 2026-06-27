import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiCheck, FiLock } from 'react-icons/fi';
import {
  fetchEmployee, updateEmployee, confirmEmployee,
  fetchBankAccounts, createBankAccount, deleteBankAccount,
  fetchEmergencyContacts, createEmergencyContact, deleteEmergencyContact,
  fetchSkills, createSkill, deleteSkill,
  fetchCertifications, createCertification, deleteCertification,
  fetchNotes, createNote, deleteNote,
  fetchEmploymentHistory, createEmploymentHistory, deleteEmploymentHistory,
  fetchDocuments,
} from '../../services/hrmsAPI';

const TABS = ['Profile','Organization','Documents','Bank Accounts','Emergency Contacts','Skills','Certifications','Notes','History'];
const STATUS_COLORS = { active:'#22c55e', probation:'#f97316', on_notice:'#a855f7', terminated:'#ef4444', resigned:'#ef4444', inactive:'#6b7280', on_leave:'#3b82f6' };
const s = { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'7px 10px', fontSize:12.5, color:'var(--text)', fontFamily:'Poppins, sans-serif', width:'100%', boxSizing:'border-box' };
const Label = ({ children }) => <label style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', display:'block', marginBottom:4, textTransform:'uppercase' }}>{children}</label>;
const Field = ({ label, value }) => (
  <div>
    <Label>{label}</Label>
    <p style={{ fontSize:13, color:'var(--text)', margin:0, fontWeight:500 }}>{value || '—'}</p>
  </div>
);

function BtnAdd({ onClick }) {
  return (
    <button onClick={onClick} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12 }}>
      <FiPlus size={12} /> Add
    </button>
  );
}

export default function AdminEmployeeDetail() {
  const { id } = useParams();
  const [tab, setTab]       = useState('Profile');
  const [emp, setEmp]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({});
  const [err, setErr]         = useState('');
  const [msg, setMsg]         = useState('');

  // Sub-resource lists
  const [banks, setBanks]   = useState([]);
  const [contacts, setContacts] = useState([]);
  const [skills, setSkills]   = useState([]);
  const [certs, setCerts]     = useState([]);
  const [notes, setNotes]     = useState([]);
  const [history, setHistory] = useState([]);
  const [docs, setDocs]       = useState([]);

  // Quick-add forms
  const [bankForm, setBankForm] = useState({ accountHolder:'', bankName:'', accountNumber:'', ifscCode:'', accountType:'savings', branchName:'', isPrimary:false });
  const [contactForm, setContactForm] = useState({ name:'', relationship:'spouse', phone:'', altPhone:'', email:'', isPrimary:false });
  const [skillForm, setSkillForm] = useState({ skillName:'', skillCategory:'technical', proficiency:'beginner', yearsExperience:0 });
  const [certForm, setCertForm] = useState({ certName:'', issuingOrg:'', certNumber:'', issueDate:'', expiryDate:'' });
  const [noteForm, setNoteForm] = useState({ noteType:'general', title:'', content:'', isConfidential:false });
  const [histForm, setHistForm] = useState({ company:'', designation:'', department:'', startDate:'', endDate:'', ctc:'' });
  const [showBank, setShowBank] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showSkill, setShowSkill] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [showHist, setShowHist] = useState(false);

  const loadEmployee = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetchEmployee(id);
      const e = r.data.data;
      setEmp(e);
      setForm({
        firstName: e.firstName, lastName: e.lastName, middleName: e.middleName || '',
        displayName: e.displayName || '', personalEmail: e.personalEmail || '',
        workEmail: e.workEmail || '', phone: e.phone || '', mobile: e.mobile || '',
        dateOfBirth: e.dateOfBirth ? e.dateOfBirth.split('T')[0] : '',
        gender: e.gender || '', maritalStatus: e.maritalStatus || '',
        bloodGroup: e.bloodGroup || '', nationality: e.nationality || '',
        currentAddress: e.currentAddress || '', city: e.city || '',
        state: e.state || '', country: e.country || '', pincode: e.pincode || '',
        panNumber: e.panNumber || '', aadharNumber: e.aadharNumber || '',
        pfAccountNumber: e.pfAccountNumber || '', uanNumber: e.uanNumber || '',
        ctc: e.ctc || '', basicSalary: e.basicSalary || '',
        employmentType: e.employmentType || 'full_time',
        joiningDate: e.joiningDate ? e.joiningDate.split('T')[0] : '',
        confirmationDate: e.confirmationDate ? e.confirmationDate.split('T')[0] : '',
      });
    } catch { setErr('Failed to load employee'); }
    finally { setLoading(false); }
  }, [id]);

  const loadSubs = useCallback(async () => {
    const [b, c, sk, ce, n, h, d] = await Promise.allSettled([
      fetchBankAccounts(id), fetchEmergencyContacts(id), fetchSkills(id),
      fetchCertifications(id), fetchNotes(id), fetchEmploymentHistory(id),
      fetchDocuments({ employee: id }),
    ]);
    if (b.status==='fulfilled') setBanks(b.value.data.data || []);
    if (c.status==='fulfilled') setContacts(c.value.data.data || []);
    if (sk.status==='fulfilled') setSkills(sk.value.data.data || []);
    if (ce.status==='fulfilled') setCerts(ce.value.data.data || []);
    if (n.status==='fulfilled') setNotes(n.value.data.data || []);
    if (h.status==='fulfilled') setHistory(h.value.data.data || []);
    if (d.status==='fulfilled') setDocs(d.value.data.data || []);
  }, [id]);

  useEffect(() => { loadEmployee(); loadSubs(); }, [loadEmployee, loadSubs]);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr(''); setMsg('');
    try { await updateEmployee(id, form); setMsg('Saved successfully'); loadEmployee(); }
    catch (e) { setErr(e?.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleConfirm = async () => {
    await confirmEmployee(id).catch(() => {});
    setMsg('Employee confirmed'); loadEmployee();
  };

  const addSub = async (fn, loadFn, reset) => {
    try { await fn; loadFn(); reset(); }
    catch (e) { alert(e?.response?.data?.message || 'Failed'); }
  };

  const delSub = async (fn, loadFn) => {
    if (!window.confirm('Delete?')) return;
    await fn.catch(() => {}); loadFn();
  };

  const inp = (f, setter) => ({ value: form[f] ?? '', onChange: e => setter ? setter(p => ({...p, [f]:e.target.value})) : setForm(p => ({...p, [f]:e.target.value})) });

  if (loading) return <div style={{ padding:'2rem', color:'var(--text-4)', fontFamily:'Poppins, sans-serif' }}>Loading…</div>;
  if (!emp)    return <div style={{ padding:'2rem', color:'#ef4444', fontFamily:'Poppins, sans-serif' }}>{err || 'Employee not found'}</div>;

  const statusColor = STATUS_COLORS[emp.status] || '#6b7280';

  return (
    <div style={{ fontFamily:'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.25rem' }}>
        <Link to="/admin/hr/employees" style={{ color:'var(--text-4)', display:'flex' }}><FiArrowLeft size={18} /></Link>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <h1 style={{ fontSize:20, fontWeight:800, margin:0 }}>{emp.displayName || `${emp.firstName} ${emp.lastName}`}</h1>
            <span style={{ padding:'2px 10px', borderRadius:999, background:`${statusColor}20`, color:statusColor, fontWeight:700, fontSize:10, textTransform:'uppercase' }}>{emp.status?.replace(/_/g,' ')}</span>
          </div>
          <p style={{ fontSize:12, color:'var(--text-4)', margin:0 }}>{emp.employeeCode} · {emp.designation?.title || ''} {emp.department ? `· ${emp.department.name}` : ''}</p>
        </div>
        {emp.status === 'probation' && (
          <button onClick={handleConfirm} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'#22c55e', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12.5 }}>
            <FiCheck size={13} /> Confirm
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, borderBottom:'1px solid var(--border)', marginBottom:20, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'8px 14px', border:'none', borderBottom:`2px solid ${tab===t ? 'var(--accent)' : 'transparent'}`, background:'none', cursor:'pointer', fontSize:12.5, fontWeight:tab===t?700:500, color:tab===t?'var(--accent)':'var(--text-4)', whiteSpace:'nowrap', fontFamily:'Poppins, sans-serif' }}>{t}</button>
        ))}
      </div>

      {msg && <div style={{ background:'#22c55e20', border:'1px solid #22c55e', borderRadius:'var(--radius-sm)', padding:'8px 12px', marginBottom:12, color:'#22c55e', fontSize:12.5 }}>{msg}</div>}
      {err && <div style={{ background:'#ef444420', border:'1px solid #ef4444', borderRadius:'var(--radius-sm)', padding:'8px 12px', marginBottom:12, color:'#ef4444', fontSize:12.5 }}>{err}</div>}

      {/* Profile Tab */}
      {tab === 'Profile' && (
        <form onSubmit={handleSave}>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem', marginBottom:16 }}>
            <h3 style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Personal Information</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
              {[['firstName','First Name'],['middleName','Middle Name'],['lastName','Last Name'],['displayName','Display Name'],['dateOfBirth','Date of Birth'],['gender','Gender'],['maritalStatus','Marital Status'],['bloodGroup','Blood Group'],['nationality','Nationality']].map(([f,l]) => (
                <div key={f}>
                  <Label>{l}</Label>
                  {['gender','maritalStatus','bloodGroup'].includes(f)
                    ? <select value={form[f]||''} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={s}>
                        <option value="">—</option>
                        {f==='gender' && ['male','female','other','prefer_not_to_say'].map(v=><option key={v} value={v}>{v.replace(/_/g,' ')}</option>)}
                        {f==='maritalStatus' && ['single','married','divorced','widowed'].map(v=><option key={v} value={v}>{v}</option>)}
                        {f==='bloodGroup' && ['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(v=><option key={v} value={v}>{v}</option>)}
                      </select>
                    : <input type={f==='dateOfBirth'?'date':'text'} value={form[f]||''} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={s} />
                  }
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem', marginBottom:16 }}>
            <h3 style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Contact Information</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
              {[['personalEmail','Personal Email'],['workEmail','Work Email'],['phone','Phone'],['mobile','Mobile'],['currentAddress','Address'],['city','City'],['state','State'],['country','Country'],['pincode','Pincode']].map(([f,l]) => (
                <div key={f}>
                  <Label>{l}</Label>
                  <input value={form[f]||''} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={s} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem', marginBottom:16 }}>
            <h3 style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Employment & Payroll</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12 }}>
              <div>
                <Label>Employment Type</Label>
                <select value={form.employmentType||'full_time'} onChange={e=>setForm(p=>({...p,employmentType:e.target.value}))} style={s}>
                  {['full_time','part_time','contract','intern','consultant','temporary'].map(v=><option key={v} value={v}>{v.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              {[['joiningDate','Joining Date'],['confirmationDate','Confirmation Date']].map(([f,l]) => (
                <div key={f}>
                  <Label>{l}</Label>
                  <input type="date" value={form[f]||''} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={s} />
                </div>
              ))}
              {[['panNumber','PAN Number'],['aadharNumber','Aadhar Number'],['pfAccountNumber','PF Account'],['uanNumber','UAN Number'],['ctc','CTC (₹)'],['basicSalary','Basic Salary (₹)']].map(([f,l]) => (
                <div key={f}>
                  <Label>{l}</Label>
                  <input value={form[f]||''} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={s} />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:13 }}>
            <FiSave size={13} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      {/* Organization Tab */}
      {tab === 'Organization' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem' }}>
          <h3 style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Organizational Structure</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
            <Field label="Department"      value={emp.department?.name} />
            <Field label="Designation"     value={emp.designation?.title} />
            <Field label="Business Unit"   value={emp.businessUnit?.name} />
            <Field label="Cost Center"     value={emp.costCenter?.name} />
            <Field label="Location"        value={emp.location?.name} />
            <Field label="Reporting Manager" value={emp.reportingManager ? `${emp.reportingManager.firstName} ${emp.reportingManager.lastName}` : null} />
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {tab === 'Documents' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ fontSize:13, fontWeight:700, margin:0 }}>Documents</h3>
            <Link to={`/admin/hr/documents?employee=${id}`} style={{ fontSize:12, color:'var(--accent)' }}>Manage Documents →</Link>
          </div>
          {docs.length === 0
            ? <p style={{ color:'var(--text-4)', fontSize:12.5 }}>No documents</p>
            : <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
                <thead><tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Document','Type','Verified','Expiry'].map(h=><th key={h} style={{ padding:'6px 10px', textAlign:'left', fontWeight:700, fontSize:11, textTransform:'uppercase', color:'var(--text-4)' }}>{h}</th>)}
                </tr></thead>
                <tbody>{docs.map(d => (
                  <tr key={d._id} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'6px 10px' }}>{d.docName}</td>
                    <td style={{ padding:'6px 10px', color:'var(--text-4)' }}>{d.docType}</td>
                    <td style={{ padding:'6px 10px' }}>{d.isVerified ? <span style={{ color:'#22c55e' }}><FiCheck size={12} /></span> : <span style={{ color:'var(--text-4)' }}>—</span>}</td>
                    <td style={{ padding:'6px 10px', color:'var(--text-4)' }}>{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
          }
        </div>
      )}

      {/* Bank Accounts Tab */}
      {tab === 'Bank Accounts' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ fontSize:13, fontWeight:700, margin:0 }}>Bank Accounts</h3>
            <BtnAdd onClick={() => setShowBank(v=>!v)} />
          </div>
          {showBank && (
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'1rem', marginBottom:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
                {[['accountHolder','Account Holder'],['bankName','Bank Name'],['accountNumber','Account Number'],['ifscCode','IFSC Code'],['branchName','Branch Name']].map(([f,l]) => (
                  <div key={f}>
                    <Label>{l}</Label>
                    <input value={bankForm[f]||''} onChange={e=>setBankForm(p=>({...p,[f]:e.target.value}))} style={s} />
                  </div>
                ))}
                <div>
                  <Label>Account Type</Label>
                  <select value={bankForm.accountType} onChange={e=>setBankForm(p=>({...p,accountType:e.target.value}))} style={s}>
                    {['savings','current','salary'].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => addSub(createBankAccount(id, bankForm), loadSubs, () => setBankForm({ accountHolder:'', bankName:'', accountNumber:'', ifscCode:'', accountType:'savings', branchName:'', isPrimary:false }))} style={{ marginTop:10, padding:'6px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12 }}>Save Account</button>
            </div>
          )}
          {banks.length === 0 ? <p style={{ color:'var(--text-4)', fontSize:12.5 }}>No bank accounts</p>
            : banks.map(b => (
              <div key={b._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', marginBottom:6 }}>
                <div>
                  <p style={{ fontSize:12.5, fontWeight:700, margin:0 }}>{b.bankName} — {b.accountNumber}</p>
                  <p style={{ fontSize:11, color:'var(--text-4)', margin:0 }}>{b.ifscCode} · {b.accountType} {b.isPrimary && '· Primary'}</p>
                </div>
                <button onClick={() => delSub(deleteBankAccount(id, b._id), loadSubs)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}><FiTrash2 size={13} /></button>
              </div>
            ))
          }
        </div>
      )}

      {/* Emergency Contacts Tab */}
      {tab === 'Emergency Contacts' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ fontSize:13, fontWeight:700, margin:0 }}>Emergency Contacts</h3>
            <BtnAdd onClick={() => setShowContact(v=>!v)} />
          </div>
          {showContact && (
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'1rem', marginBottom:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
                <div><Label>Name</Label><input value={contactForm.name} onChange={e=>setContactForm(p=>({...p,name:e.target.value}))} style={s} /></div>
                <div><Label>Relationship</Label>
                  <select value={contactForm.relationship} onChange={e=>setContactForm(p=>({...p,relationship:e.target.value}))} style={s}>
                    {['spouse','parent','sibling','child','friend','other'].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div><Label>Phone</Label><input value={contactForm.phone} onChange={e=>setContactForm(p=>({...p,phone:e.target.value}))} style={s} /></div>
                <div><Label>Alt Phone</Label><input value={contactForm.altPhone} onChange={e=>setContactForm(p=>({...p,altPhone:e.target.value}))} style={s} /></div>
                <div><Label>Email</Label><input value={contactForm.email} onChange={e=>setContactForm(p=>({...p,email:e.target.value}))} style={s} /></div>
              </div>
              <button onClick={() => addSub(createEmergencyContact(id, contactForm), loadSubs, () => setContactForm({ name:'', relationship:'spouse', phone:'', altPhone:'', email:'', isPrimary:false }))} style={{ marginTop:10, padding:'6px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12 }}>Save Contact</button>
            </div>
          )}
          {contacts.map(c => (
            <div key={c._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', marginBottom:6 }}>
              <div>
                <p style={{ fontSize:12.5, fontWeight:700, margin:0 }}>{c.name} ({c.relationship})</p>
                <p style={{ fontSize:11, color:'var(--text-4)', margin:0 }}>{c.phone} {c.email && `· ${c.email}`}</p>
              </div>
              <button onClick={() => delSub(deleteEmergencyContact(id, c._id), loadSubs)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}><FiTrash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Skills Tab */}
      {tab === 'Skills' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ fontSize:13, fontWeight:700, margin:0 }}>Skills</h3>
            <BtnAdd onClick={() => setShowSkill(v=>!v)} />
          </div>
          {showSkill && (
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'1rem', marginBottom:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8 }}>
                <div><Label>Skill Name</Label><input value={skillForm.skillName} onChange={e=>setSkillForm(p=>({...p,skillName:e.target.value}))} style={s} /></div>
                <div><Label>Category</Label>
                  <select value={skillForm.skillCategory} onChange={e=>setSkillForm(p=>({...p,skillCategory:e.target.value}))} style={s}>
                    {['technical','functional','soft','language','domain','tool'].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div><Label>Proficiency</Label>
                  <select value={skillForm.proficiency} onChange={e=>setSkillForm(p=>({...p,proficiency:e.target.value}))} style={s}>
                    {['beginner','intermediate','advanced','expert'].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div><Label>Years Exp</Label><input type="number" value={skillForm.yearsExperience} onChange={e=>setSkillForm(p=>({...p,yearsExperience:e.target.value}))} style={s} /></div>
              </div>
              <button onClick={() => addSub(createSkill(id, skillForm), loadSubs, () => setSkillForm({ skillName:'', skillCategory:'technical', proficiency:'beginner', yearsExperience:0 }))} style={{ marginTop:10, padding:'6px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12 }}>Add Skill</button>
            </div>
          )}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {skills.map(sk => (
              <div key={sk._id} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 10px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)' }}>
                <span style={{ fontSize:12.5, fontWeight:600 }}>{sk.skillName}</span>
                <span style={{ fontSize:10, color:'var(--text-4)' }}>{sk.proficiency}</span>
                <button onClick={() => delSub(deleteSkill(id, sk._id), loadSubs)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', padding:0 }}><FiTrash2 size={11} /></button>
              </div>
            ))}
            {skills.length === 0 && <p style={{ color:'var(--text-4)', fontSize:12.5 }}>No skills added</p>}
          </div>
        </div>
      )}

      {/* Certifications Tab */}
      {tab === 'Certifications' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ fontSize:13, fontWeight:700, margin:0 }}>Certifications</h3>
            <BtnAdd onClick={() => setShowCert(v=>!v)} />
          </div>
          {showCert && (
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'1rem', marginBottom:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
                {[['certName','Cert Name'],['issuingOrg','Issuing Org'],['certNumber','Cert Number']].map(([f,l]) => (
                  <div key={f}><Label>{l}</Label><input value={certForm[f]} onChange={e=>setCertForm(p=>({...p,[f]:e.target.value}))} style={s} /></div>
                ))}
                {[['issueDate','Issue Date'],['expiryDate','Expiry Date']].map(([f,l]) => (
                  <div key={f}><Label>{l}</Label><input type="date" value={certForm[f]} onChange={e=>setCertForm(p=>({...p,[f]:e.target.value}))} style={s} /></div>
                ))}
              </div>
              <button onClick={() => addSub(createCertification(id, certForm), loadSubs, () => setCertForm({ certName:'', issuingOrg:'', certNumber:'', issueDate:'', expiryDate:'' }))} style={{ marginTop:10, padding:'6px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12 }}>Add Certification</button>
            </div>
          )}
          {certs.map(c => (
            <div key={c._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', marginBottom:6 }}>
              <div>
                <p style={{ fontSize:12.5, fontWeight:700, margin:0 }}>{c.certName}</p>
                <p style={{ fontSize:11, color:'var(--text-4)', margin:0 }}>{c.issuingOrg} {c.certNumber && `· ${c.certNumber}`} {c.expiryDate && `· Exp: ${new Date(c.expiryDate).toLocaleDateString('en-IN')}`}</p>
              </div>
              <button onClick={() => delSub(deleteCertification(id, c._id), loadSubs)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}><FiTrash2 size={13} /></button>
            </div>
          ))}
          {certs.length === 0 && <p style={{ color:'var(--text-4)', fontSize:12.5 }}>No certifications</p>}
        </div>
      )}

      {/* Notes Tab */}
      {tab === 'Notes' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ fontSize:13, fontWeight:700, margin:0 }}>Notes</h3>
            <BtnAdd onClick={() => setShowNote(v=>!v)} />
          </div>
          {showNote && (
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'1rem', marginBottom:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                <div><Label>Type</Label>
                  <select value={noteForm.noteType} onChange={e=>setNoteForm(p=>({...p,noteType:e.target.value}))} style={s}>
                    {['general','performance','disciplinary','appreciation','warning','medical','confidential'].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div><Label>Title</Label><input value={noteForm.title} onChange={e=>setNoteForm(p=>({...p,title:e.target.value}))} style={s} /></div>
              </div>
              <div style={{ marginTop:8 }}>
                <Label>Content</Label>
                <textarea value={noteForm.content} onChange={e=>setNoteForm(p=>({...p,content:e.target.value}))} rows={3} style={{ ...s }} />
              </div>
              <button onClick={() => addSub(createNote(id, noteForm), loadSubs, () => setNoteForm({ noteType:'general', title:'', content:'', isConfidential:false }))} style={{ marginTop:10, padding:'6px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12 }}>Save Note</button>
            </div>
          )}
          {notes.map(n => (
            <div key={n._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 12px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', marginBottom:8 }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:'var(--accent)' }}>{n.noteType}</span>
                  {n.isConfidential && <FiLock size={10} color="#a855f7" />}
                  <span style={{ fontSize:12.5, fontWeight:700 }}>{n.title}</span>
                </div>
                <p style={{ fontSize:12.5, color:'var(--text-4)', margin:0 }}>{n.content}</p>
                <p style={{ fontSize:10, color:'var(--text-4)', margin:'4px 0 0' }}>{new Date(n.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <button onClick={() => delSub(deleteNote(id, n._id), loadSubs)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}><FiTrash2 size={13} /></button>
            </div>
          ))}
          {notes.length === 0 && <p style={{ color:'var(--text-4)', fontSize:12.5 }}>No notes</p>}
        </div>
      )}

      {/* History Tab */}
      {tab === 'History' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ fontSize:13, fontWeight:700, margin:0 }}>Employment History</h3>
            <BtnAdd onClick={() => setShowHist(v=>!v)} />
          </div>
          {showHist && (
            <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'1rem', marginBottom:12 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8 }}>
                {[['company','Company'],['designation','Designation'],['department','Department']].map(([f,l]) => (
                  <div key={f}><Label>{l}</Label><input value={histForm[f]} onChange={e=>setHistForm(p=>({...p,[f]:e.target.value}))} style={s} /></div>
                ))}
                {[['startDate','Start Date'],['endDate','End Date']].map(([f,l]) => (
                  <div key={f}><Label>{l}</Label><input type="date" value={histForm[f]} onChange={e=>setHistForm(p=>({...p,[f]:e.target.value}))} style={s} /></div>
                ))}
                <div><Label>CTC (₹)</Label><input type="number" value={histForm.ctc} onChange={e=>setHistForm(p=>({...p,ctc:e.target.value}))} style={s} /></div>
              </div>
              <button onClick={() => addSub(createEmploymentHistory(id, histForm), loadSubs, () => setHistForm({ company:'', designation:'', department:'', startDate:'', endDate:'', ctc:'' }))} style={{ marginTop:10, padding:'6px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12 }}>Add History</button>
            </div>
          )}
          {history.map(h => (
            <div key={h._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', marginBottom:6 }}>
              <div>
                <p style={{ fontSize:12.5, fontWeight:700, margin:0 }}>{h.company} — {h.designation}</p>
                <p style={{ fontSize:11, color:'var(--text-4)', margin:0 }}>
                  {h.startDate ? new Date(h.startDate).toLocaleDateString('en-IN') : '?'} — {h.endDate ? new Date(h.endDate).toLocaleDateString('en-IN') : 'Present'}
                  {h.ctc ? ` · ₹${Number(h.ctc).toLocaleString('en-IN')}` : ''}
                </p>
              </div>
              <button onClick={() => delSub(deleteEmploymentHistory(id, h._id), loadSubs)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}><FiTrash2 size={13} /></button>
            </div>
          ))}
          {history.length === 0 && <p style={{ color:'var(--text-4)', fontSize:12.5 }}>No previous employment history</p>}
        </div>
      )}
    </div>
  );
}
