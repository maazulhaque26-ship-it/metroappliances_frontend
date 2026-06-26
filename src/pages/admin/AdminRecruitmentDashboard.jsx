import React, { useEffect, useState } from 'react';
import { FiBriefcase, FiUsers, FiCalendar, FiMail, FiUserCheck, FiTrendingUp } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchRecruitmentDashboard } from '../../services/recruitmentAPI';

const KpiCard = ({ icon: Icon, label, value, color = 'text-indigo-600' }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
    <div className={`p-3 rounded-lg bg-gray-50 ${color}`}><Icon size={22} /></div>
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const statusBadge = (s) => {
  const map = {
    open:     'bg-green-100 text-green-700',
    draft:    'bg-gray-100 text-gray-600',
    on_hold:  'bg-yellow-100 text-yellow-700',
    closed:   'bg-red-100 text-red-700',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${map[s] || 'bg-gray-100 text-gray-600'}`}>{s?.replace('_', ' ')}</span>;
};

export default function AdminRecruitmentDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchRecruitmentDashboard()
      .then(r => setData(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error)   return <AdminLayout><ErrorState message={error} /></AdminLayout>;

  const k = data?.kpis || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Applicant tracking and hiring overview</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <KpiCard icon={FiBriefcase}  label="Open Positions"     value={k.openPositions    ?? 0} color="text-indigo-600" />
          <KpiCard icon={FiUsers}      label="Total Applications" value={k.totalApplications ?? 0} color="text-blue-600" />
          <KpiCard icon={FiCalendar}   label="Interviews Today"   value={k.interviewsToday  ?? 0} color="text-purple-600" />
          <KpiCard icon={FiMail}       label="Offers Pending"     value={k.offersPending     ?? 0} color="text-yellow-600" />
          <KpiCard icon={FiUserCheck}  label="Hired This Month"   value={k.hiredThisMonth   ?? 0} color="text-green-600" />
          <KpiCard icon={FiTrendingUp} label="Acceptance Rate"    value={`${k.acceptanceRate ?? 0}%`} color="text-pink-600" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Hiring Funnel</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Stage', 'Count'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Applied',     data?.funnel?.applied],
                ['Screening',   data?.funnel?.screening],
                ['Shortlisted', data?.funnel?.shortlisted],
                ['Interview',   data?.funnel?.interview],
                ['Offered',     data?.funnel?.offered],
                ['Hired',       data?.funnel?.hired],
              ].map(([stage, count]) => (
                <tr key={stage} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{stage}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Job Openings</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Title', 'Department', 'Status', 'Openings', 'Filled'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data?.recentJobs || []).map(j => (
                <tr key={j._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{j.title}</td>
                  <td className="px-4 py-3 text-gray-600">{j.department}</td>
                  <td className="px-4 py-3">{statusBadge(j.status)}</td>
                  <td className="px-4 py-3 text-gray-600">{j.openings}</td>
                  <td className="px-4 py-3 text-gray-600">{j.filledCount ?? 0}</td>
                </tr>
              ))}
              {!data?.recentJobs?.length && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No job openings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
