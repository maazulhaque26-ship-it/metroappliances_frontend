import React, { useEffect, useState } from 'react';
import { FiUsers, FiUserCheck, FiUserX, FiTrendingUp, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { fetchHRDashboard } from '../../services/hrmsAPI';

const COLORS = ['#FF7A00','#D4AF37','#22c55e','#3b82f6','#a855f7','#ef4444','#06b6d4','#f97316'];
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const MetricCard = ({ label, value, color = 'var(--accent)', icon: Icon }) => (
  <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
    <div style={{ width:40, height:40, borderRadius:'var(--radius-sm)', background:`${color}20`, display:'flex', alignItems:'center', justifyContent:'center', color }}>
      {Icon && <Icon size={18} />}
    </div>
    <div>
      <p style={{ fontSize:10.5, color:'var(--text-4)', fontWeight:700, textTransform:'uppercase', margin:0 }}>{label}</p>
      <p style={{ fontSize:22, fontWeight:800, color, margin:0 }}>{fmt(value)}</p>
    </div>
  </div>
);

export default function AdminHRDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchHRDashboard();
      setData(r.data.data);
    } catch { setError('Failed to load HR dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div style={{ padding:'2rem', color:'var(--text-4)', fontFamily:'Poppins, sans-serif' }}>Loading HR Dashboard…</div>;
  if (error)   return <div style={{ padding:'2rem', color:'#ef4444', fontFamily:'Poppins, sans-serif' }}>{error}</div>;
  if (!data)   return null;

  const { metrics = {}, deptDistribution = [], buDistribution = [], employeeGrowth = [] } = data;

  return (
    <div style={{ fontFamily:'Poppins, sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'var(--text)', margin:0 }}>HR Dashboard</h1>
          <p style={{ fontSize:12.5, color:'var(--text-4)', marginTop:2 }}>Enterprise HRMS — Workforce Overview</p>
        </div>
        <button onClick={load} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', cursor:'pointer', fontSize:12.5, color:'var(--text-4)' }}>
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:20 }}>
        <MetricCard label="Total Employees"   value={metrics.totalEmployees}    color="#3b82f6" icon={FiUsers} />
        <MetricCard label="Active Employees"  value={metrics.activeEmployees}   color="#22c55e" icon={FiUserCheck} />
        <MetricCard label="On Probation"      value={metrics.probationEmployees} color="#f97316" icon={FiUsers} />
        <MetricCard label="Confirmed"         value={metrics.confirmedEmployees} color="var(--accent)" icon={FiUserCheck} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:24 }}>
        <MetricCard label="New Joiners (MTD)" value={metrics.newJoinersThisMonth} color="#22c55e" icon={FiTrendingUp} />
        <MetricCard label="Exits (MTD)"       value={metrics.exitsThisMonth}    color="#ef4444" icon={FiUserX} />
        <MetricCard label="Pending Transfers" value={metrics.pendingTransfers}   color="#a855f7" icon={FiArrowRight} />
        <MetricCard label="Pending Promotions"value={metrics.pendingPromotions}  color="#D4AF37" icon={FiTrendingUp} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        {/* Dept Distribution */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem' }}>
          <h3 style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Department Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={deptDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, count }) => `${name}: ${count}`} labelLine={false} fontSize={9}>
                {deptDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Employee Growth */}
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem' }}>
          <h3 style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Employee Growth (6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={employeeGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize:10 }} />
              <YAxis tick={{ fontSize:10 }} />
              <Tooltip />
              <Line dataKey="count" stroke="var(--accent)" strokeWidth={2} dot name="Headcount" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BU Distribution */}
      {buDistribution.length > 0 && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem' }}>
          <h3 style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Business Unit Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={buDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize:10 }} />
              <YAxis tick={{ fontSize:10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--accent)" name="Employees" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
