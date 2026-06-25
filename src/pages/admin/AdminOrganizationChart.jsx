import React, { useEffect, useState, useCallback } from 'react';
import { FiPlus, FiTrash2, FiActivity, FiCheck } from 'react-icons/fi';
import { fetchOrgNodes, createOrgNode, deleteOrgNode, fetchOrgCharts, createOrgChart, activateOrgChart, deleteOrgChart } from '../../services/hrmsAPI';

const s = { background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'7px 10px', fontSize:12.5, color:'var(--text)', fontFamily:'Poppins, sans-serif', width:'100%', boxSizing:'border-box' };
const Label = ({ children }) => <label style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', display:'block', marginBottom:4 }}>{children}</label>;

const NODE_COLORS = { company:'#FF7A00', business_unit:'#3b82f6', department:'#22c55e', team:'#a855f7', position:'#D4AF37' };

function OrgNode({ node, level = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const color = NODE_COLORS[node.nodeType] || '#6b7280';
  return (
    <div style={{ marginLeft: level * 20 }}>
      <div onClick={() => setExpanded(v=>!v)} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', marginBottom:4, cursor:'pointer', background:'var(--card)' }}>
        <span style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }} />
        <span style={{ fontSize:12.5, fontWeight:600 }}>{node.name}</span>
        <span style={{ fontSize:10, color:'var(--text-4)', textTransform:'uppercase' }}>{node.nodeType?.replace(/_/g,' ')}</span>
        {node.code && <span style={{ fontSize:10, color:'var(--text-4)', fontFamily:'monospace' }}>{node.code}</span>}
        {node.headCount > 0 && <span style={{ fontSize:10, color:'var(--text-4)', marginLeft:'auto' }}>{node.headCount} people</span>}
      </div>
      {expanded && node.children?.map(c => <OrgNode key={c._id} node={c} level={level + 1} />)}
    </div>
  );
}

function buildTree(nodes) {
  const map = {};
  nodes.forEach(n => { map[n._id] = { ...n, children: [] }; });
  const roots = [];
  nodes.forEach(n => {
    const parentId = n.parent?._id || n.parent;
    if (parentId && map[parentId]) map[parentId].children.push(map[n._id]);
    else roots.push(map[n._id]);
  });
  return roots;
}

export default function AdminOrganizationChart() {
  const [nodes, setNodes]   = useState([]);
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('tree');
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [nodeForm, setNodeForm] = useState({ nodeType:'department', name:'', code:'', parent:'' });
  const [chartForm, setChartForm] = useState({ chartName:'', description:'', effectiveDate:'' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [n, c] = await Promise.all([fetchOrgNodes(), fetchOrgCharts()]);
      setNodes(n.data.data || []);
      setCharts(c.data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreateNode = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const payload = { ...nodeForm };
      if (!payload.parent) delete payload.parent;
      await createOrgNode(payload);
      setShowNodeModal(false); setNodeForm({ nodeType:'department', name:'', code:'', parent:'' }); load();
    } catch (e) { setErr(e?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleCreateChart = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      await createOrgChart(chartForm);
      setShowChartModal(false); setChartForm({ chartName:'', description:'', effectiveDate:'' }); load();
    } catch (e) { setErr(e?.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleActivate = async (id) => {
    await activateOrgChart(id).catch(() => {});
    load();
  };

  const handleDeleteNode = async (id) => {
    if (!window.confirm('Delete node?')) return;
    await deleteOrgNode(id).catch(() => {}); load();
  };

  const tree = buildTree(nodes);

  return (
    <div style={{ fontFamily:'Poppins, sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, margin:0 }}>Organization Chart</h1>
          <p style={{ fontSize:12, color:'var(--text-4)', margin:0 }}>{nodes.length} nodes · {charts.length} chart versions</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setShowNodeModal(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12.5 }}>
            <FiPlus size={13} /> Add Node
          </button>
          <button onClick={() => setShowChartModal(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12.5 }}>
            <FiActivity size={13} /> New Chart Version
          </button>
        </div>
      </div>

      {/* Tab Switch */}
      <div style={{ display:'flex', gap:4, borderBottom:'1px solid var(--border)', marginBottom:16 }}>
        {['tree','charts','nodes'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'8px 14px', border:'none', borderBottom:`2px solid ${tab===t?'var(--accent)':'transparent'}`, background:'none', cursor:'pointer', fontSize:12.5, fontWeight:tab===t?700:500, color:tab===t?'var(--accent)':'var(--text-4)', fontFamily:'Poppins, sans-serif', textTransform:'capitalize' }}>{t}</button>
        ))}
      </div>

      {loading && <p style={{ color:'var(--text-4)', fontSize:12.5 }}>Loading…</p>}

      {!loading && tab === 'tree' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem' }}>
          {tree.length === 0
            ? <p style={{ color:'var(--text-4)', fontSize:12.5 }}>No org nodes yet. Add nodes to build the hierarchy.</p>
            : tree.map(n => <OrgNode key={n._id} node={n} />)
          }
        </div>
      )}

      {!loading && tab === 'charts' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
            <thead>
              <tr style={{ borderBottom:'2px solid var(--border)', background:'var(--bg)' }}>
                {['Chart Name','Version','Status','Effective Date','Actions'].map(h=>(
                  <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, fontSize:11, textTransform:'uppercase', color:'var(--text-4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {charts.length === 0
                ? <tr><td colSpan={5} style={{ padding:'2rem', textAlign:'center', color:'var(--text-4)' }}>No chart versions</td></tr>
                : charts.map(c => (
                    <tr key={c._id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'9px 12px', fontWeight:600 }}>{c.chartName}</td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{c.chartVersion}</td>
                      <td style={{ padding:'9px 12px' }}>
                        <span style={{ padding:'2px 8px', borderRadius:999, fontWeight:700, fontSize:10, background:c.status==='active'?'#22c55e20':'var(--bg)', color:c.status==='active'?'#22c55e':'var(--text-4)', textTransform:'uppercase' }}>{c.status}</span>
                      </td>
                      <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{c.effectiveDate ? new Date(c.effectiveDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td style={{ padding:'9px 12px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          {c.status !== 'active' && <button onClick={() => handleActivate(c._id)} style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', background:'#22c55e', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontSize:11, fontWeight:700 }}><FiCheck size={11} /> Activate</button>}
                          <button onClick={() => deleteOrgChart(c._id).then(load).catch(()=>{})} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}><FiTrash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'nodes' && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', overflow:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5 }}>
            <thead>
              <tr style={{ borderBottom:'2px solid var(--border)', background:'var(--bg)' }}>
                {['Name','Code','Type','Level','Parent','Actions'].map(h=>(
                  <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, fontSize:11, textTransform:'uppercase', color:'var(--text-4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nodes.map(n => (
                <tr key={n._id} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:'9px 12px', fontWeight:600 }}>{n.name}</td>
                  <td style={{ padding:'9px 12px', fontFamily:'monospace', fontSize:11, color:'var(--accent)' }}>{n.code || '—'}</td>
                  <td style={{ padding:'9px 12px' }}>
                    <span style={{ padding:'2px 8px', borderRadius:999, background:`${NODE_COLORS[n.nodeType]||'#6b7280'}20`, color:NODE_COLORS[n.nodeType]||'#6b7280', fontWeight:700, fontSize:10, textTransform:'uppercase' }}>{n.nodeType?.replace(/_/g,' ')}</span>
                  </td>
                  <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{n.level}</td>
                  <td style={{ padding:'9px 12px', color:'var(--text-4)' }}>{n.parent?.name || '—'}</td>
                  <td style={{ padding:'9px 12px' }}>
                    <button onClick={() => handleDeleteNode(n._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444' }}><FiTrash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Node Modal */}
      {showNodeModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'var(--card)', borderRadius:'var(--radius-md)', padding:'1.5rem', width:'100%', maxWidth:440 }}>
            <h2 style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>Add Org Node</h2>
            {err && <p style={{ color:'#ef4444', fontSize:12, marginBottom:10 }}>{err}</p>}
            <form onSubmit={handleCreateNode}>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div><Label>Name *</Label><input value={nodeForm.name} onChange={e=>setNodeForm(p=>({...p,name:e.target.value}))} required style={s} /></div>
                <div><Label>Code</Label><input value={nodeForm.code} onChange={e=>setNodeForm(p=>({...p,code:e.target.value}))} style={s} /></div>
                <div>
                  <Label>Node Type</Label>
                  <select value={nodeForm.nodeType} onChange={e=>setNodeForm(p=>({...p,nodeType:e.target.value}))} style={s}>
                    {['company','business_unit','department','team','position'].map(v=><option key={v} value={v}>{v.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Parent Node</Label>
                  <select value={nodeForm.parent} onChange={e=>setNodeForm(p=>({...p,parent:e.target.value}))} style={s}>
                    <option value="">— Root (No Parent) —</option>
                    {nodes.map(n=><option key={n._id} value={n._id}>{n.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => { setShowNodeModal(false); setErr(''); }} style={{ padding:'7px 16px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--bg)', cursor:'pointer', fontSize:12.5 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:'7px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12.5 }}>{saving?'Saving…':'Add Node'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Chart Modal */}
      {showChartModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 }}>
          <div style={{ background:'var(--card)', borderRadius:'var(--radius-md)', padding:'1.5rem', width:'100%', maxWidth:400 }}>
            <h2 style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>New Chart Version</h2>
            {err && <p style={{ color:'#ef4444', fontSize:12, marginBottom:10 }}>{err}</p>}
            <form onSubmit={handleCreateChart}>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div><Label>Chart Name *</Label><input value={chartForm.chartName} onChange={e=>setChartForm(p=>({...p,chartName:e.target.value}))} required style={s} /></div>
                <div><Label>Effective Date *</Label><input type="date" value={chartForm.effectiveDate} onChange={e=>setChartForm(p=>({...p,effectiveDate:e.target.value}))} required style={s} /></div>
                <div><Label>Description</Label><textarea value={chartForm.description} onChange={e=>setChartForm(p=>({...p,description:e.target.value}))} rows={2} style={s} /></div>
              </div>
              <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => { setShowChartModal(false); setErr(''); }} style={{ padding:'7px 16px', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background:'var(--bg)', cursor:'pointer', fontSize:12.5 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding:'7px 16px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer', fontWeight:700, fontSize:12.5 }}>{saving?'Creating…':'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
