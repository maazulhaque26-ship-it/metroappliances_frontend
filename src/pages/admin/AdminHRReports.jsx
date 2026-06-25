import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { fetchHeadcountReport, fetchAttritionReport, fetchNewJoinersReport } from '../../services/hrmsAPI';

const COLORS = ['#FF7A00','#D4AF37','#22c55e','#3b82f6','#a855f7','#ef4444','#06b6d4','#f97316'];
const TABS = ['headcount','attrition','new_joiners'];

export default function AdminHRReports() {
  const [tab, setTab]           = useState('headcount');
  const [headcount, setHeadcount] = useState([]);
  const [attrition, setAttrition] = useState([]);
  const [newJoiners, setNewJoiners] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [year, setYear]         = useState(new Date().getFullYear());
  const [month, setMonth]       = useState(new Date().getMonth() + 1);

  const loadHeadcount = useCallback(async () => {
    setLoading(true);
    try { const r = await fetchHeadcountReport(); setHeadcount(r.data.data || []); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const loadAttrition = useCallback(async () => {
    setLoading(true);
    try { const r = await fetchAttritionReport({ year }); setAttrition(r.data.data || []); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, [year]);

  const loadNewJoiners = useCallback(async () => {
    setLoading(true);
    try { const r = await fetchNewJoinersReport({ year, month }); setNewJoiners(r.data.data || []); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, [year, month]);

  useEffect(() => {
    if (tab === 'headcount')   loadHeadcount();
    if (tab === 'attrition')   loadAttrition();
    if (tab === 'new_joiners') loadNewJoiners();
  }, [tab, loadHeadcount, loadAttrition, loadNewJoiners]);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div style={{ fontFamily:'Poppins, sans-serif' }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>HR Reports</h1>
        <p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Workforce analytics and insights</p>
      </div>

      {/* Tab Switch */}
      <div style={{ display:'flex', gap:4, borderBottom:'1px solid var(--border)', marginBottom:20 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'8px 16px', border:'none', borderBottom:`2px solid ${tab===t?'var(--accent)':'transparent'}`, background:'none', cursor:'pointer', fontSize:12.5, fontWeight:tab===t?700:500, color:tab===t?'var(--accent)':'var(--text-4)', fontFamily:'Poppins, sans-serif', textTransform:'capitalize' }}>{t.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</button>
        ))}
      </div>

      {loading && <p style={{ color:'var(--text-4)', fontSize:12.5 }}>Loading…</p>}

      {/* Headcount Report */}
      {!loading && tab === 'headcount' && (
        <div>
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem', marginBottom:16 }}>
            <h3 style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Headcount by Department & Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={headcount} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize:10 }} />
                <YAxis dataKey="_id" type="category" tick={{ fontSize:10 }} width={120} />
                <Tooltip formatter={(v, n) => [v, n.replace('count_','').replace(/_/g,' ')]} />
                {['active','probation','on_notice','inactive','terminated'].map((st, i) => (
                  <Bar key={st} dataKey={`count_${st}`} name={st} fill={COLORS[i % COLORS.length]} stackId="a" />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
              <thead>
                <tr style={{ borderBottom:'2px solid var(--border)', background:'var(--bg)' }}>
                  {['Department','Active','Probation','On Notice','Inactive','Terminated','Total'].map(h=>(
                    <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, fontSize:11, textTransform:'uppercase', color:'var(--text-4)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {headcount.map((r, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'9px 12px', fontWeight:600 }}>{r._id || 'Unassigned'}</td>
                    <td style={{ padding:'9px 12px', color:'#22c55e' }}>{r.count_active || 0}</td>
                    <td style={{ padding:'9px 12px', color:'#f97316' }}>{r.count_probation || 0}</td>
                    <td style={{ padding:'9px 12px', color:'#a855f7' }}>{r.count_on_notice || 0}</td>
                    <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{r.count_inactive || 0}</td>
                    <td style={{ padding:'9px 12px', color:'#ef4444' }}>{r.count_terminated || 0}</td>
                    <td style={{ padding:'9px 12px', fontWeight:700 }}>{r.total || 0}</td>
                  </tr>
                ))}
                {headcount.length === 0 && <tr><td colSpan={7} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>No data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attrition Report */}
      {!loading && tab === 'attrition' && (
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
            <label style={{ fontSize:12.5, color:'var(--text-4)', fontWeight:600 }}>Year:</label>
            <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'6px 10px', fontSize:12.5, color:'var(--text)', fontFamily:'Poppins, sans-serif' }}>
              {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem', marginBottom:16 }}>
            <h3 style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Monthly Attrition — {year}</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={attrition}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tickFormatter={m=>MONTHS[m-1]} tick={{ fontSize:10 }} />
                <YAxis tick={{ fontSize:10 }} />
                <Tooltip labelFormatter={m=>`Month ${m}`} />
                <Line dataKey="exits" stroke="#ef4444" strokeWidth={2} dot name="Exits" />
                <Line dataKey="attritionRate" stroke="#f97316" strokeWidth={2} dot name="Rate %" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
              <thead>
                <tr style={{ borderBottom:'2px solid var(--border)', background:'var(--bg)' }}>
                  {['Month','Exits','Avg Headcount','Attrition Rate'].map(h=>(
                    <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, fontSize:11, textTransform:'uppercase', color:'var(--text-4)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attrition.map((r, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'9px 12px', fontWeight:600 }}>{MONTHS[(r.month||1)-1]} {year}</td>
                    <td style={{ padding:'9px 12px', color:'#ef4444' }}>{r.exits || 0}</td>
                    <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{r.avgHeadcount || 0}</td>
                    <td style={{ padding:'9px 12px', fontWeight:700, color: r.attritionRate > 5 ? '#ef4444' : '#22c55e' }}>{r.attritionRate?.toFixed(1) || '0.0'}%</td>
                  </tr>
                ))}
                {attrition.length === 0 && <tr><td colSpan={4} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>No data for {year}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Joiners Report */}
      {!loading && tab === 'new_joiners' && (
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:16, alignItems:'center' }}>
            <label style={{ fontSize:12.5, color:'var(--text-4)', fontWeight:600 }}>Month:</label>
            <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'6px 10px', fontSize:12.5, color:'var(--text)', fontFamily:'Poppins, sans-serif' }}>
              {MONTHS.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <label style={{ fontSize:12.5, color:'var(--text-4)', fontWeight:600 }}>Year:</label>
            <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'6px 10px', fontSize:12.5, color:'var(--text)', fontFamily:'Poppins, sans-serif' }}>
              {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1rem', marginBottom:12 }}>
            <p style={{ fontSize:13, color:'var(--text-4)', margin:0 }}><span style={{ fontSize:28, fontWeight:800, color:'var(--accent)' }}>{newJoiners.length}</span> new joiners in {MONTHS[month-1]} {year}</p>
          </div>

          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
              <thead>
                <tr style={{ borderBottom:'2px solid var(--border)', background:'var(--bg)' }}>
                  {['Code','Name','Department','Designation','Joining Date','Type'].map(h=>(
                    <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, fontSize:11, textTransform:'uppercase', color:'var(--text-4)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {newJoiners.length === 0
                  ? <tr><td colSpan={6} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>No new joiners in {MONTHS[month-1]} {year}</td></tr>
                  : newJoiners.map(e => (
                      <tr key={e._id} style={{ borderBottom:'1px solid var(--border)' }}>
                        <td style={{ padding:'9px 12px', fontFamily:'monospace', fontSize:11, color:'var(--accent)' }}>{e.employeeCode}</td>
                        <td style={{ padding:'9px 12px', fontWeight:600 }}>{e.displayName || `${e.firstName} ${e.lastName}`}</td>
                        <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{e.department?.name || '—'}</td>
                        <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{e.designation?.title || '—'}</td>
                        <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{e.joiningDate ? new Date(e.joiningDate).toLocaleDateString('en-IN') : '—'}</td>
                        <td style={{ padding:'9px 12px', color:'var(--text-4)', textTransform:'capitalize' }}>{e.employmentType?.replace(/_/g,' ')}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
