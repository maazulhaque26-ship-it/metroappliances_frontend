import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import {
  fetchOpenPositionsReport, fetchHiringFunnelReport, fetchSourceEffectiveness,
  fetchTimeToHireReport, fetchOfferAcceptanceReport, fetchRecruiterPerformance,
} from '../../services/recruitmentAPI';

const REPORT_TYPES = [
  { key: 'open-positions',   label: 'Open Positions' },
  { key: 'hiring-funnel',    label: 'Hiring Funnel' },
  { key: 'source',           label: 'Source Effectiveness' },
  { key: 'time-to-hire',     label: 'Time to Hire' },
  { key: 'offer-acceptance', label: 'Offer Acceptance' },
  { key: 'recruiter',        label: 'Recruiter Performance' },
];

const FUNNEL_STAGES = ['Applied', 'Screening', 'Shortlisted', 'Interview', 'Offered', 'Hired'];

export default function AdminRecruitmentReports() {
  const [reportType, setReportType] = useState('open-positions');
  const [year, setYear]             = useState(new Date().getFullYear());
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const generate = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      let res;
      if (reportType === 'open-positions')   res = await fetchOpenPositionsReport();
      if (reportType === 'hiring-funnel')    res = await fetchHiringFunnelReport({ year });
      if (reportType === 'source')           res = await fetchSourceEffectiveness();
      if (reportType === 'time-to-hire')     res = await fetchTimeToHireReport({ year });
      if (reportType === 'offer-acceptance') res = await fetchOfferAcceptanceReport();
      if (reportType === 'recruiter')        res = await fetchRecruiterPerformance();
      setResult(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to generate report');
    } finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Analytics and hiring performance metrics</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map(r => (
              <button key={r.key} onClick={() => { setReportType(r.key); setResult(null); }}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${reportType === r.key ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-3 flex-wrap">
            {['hiring-funnel', 'time-to-hire'].includes(reportType) && (
              <div>
                <label className="text-xs font-medium text-gray-600">Year</label>
                <input type="number" value={year} onChange={e => setYear(e.target.value)}
                  className="mt-1 w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            )}
            <button onClick={generate} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              <FiSearch size={14} /> Generate
            </button>
          </div>
        </div>

        {loading ? <LoadingState /> : error ? <ErrorState message={error} /> : result && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {reportType === 'open-positions' && Array.isArray(result) && (
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>{['Department', 'Total Openings', 'Filled'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.department}</td>
                      <td className="px-4 py-3 text-gray-700">{row.totalOpenings}</td>
                      <td className="px-4 py-3 text-green-700 font-semibold">{row.filled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'hiring-funnel' && (
              <div className="p-5 space-y-3">
                {FUNNEL_STAGES.map(stage => {
                  const count = result[stage.toLowerCase()] ?? 0;
                  const max = result.applied || 1;
                  const pct = Math.round((count / max) * 100);
                  return (
                    <div key={stage} className="flex items-center gap-3">
                      <span className="w-28 text-sm text-gray-600 text-right">{stage}</span>
                      <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-lg flex items-center px-2 transition-all" style={{ width: `${Math.max(pct, 2)}%` }}>
                          <span className="text-xs text-white font-medium">{count}</span>
                        </div>
                      </div>
                      <span className="w-10 text-xs text-gray-400 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}

            {reportType === 'source' && Array.isArray(result) && (
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>{['Source', 'Total Apps', 'Hired', 'Conversion %'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 capitalize">{row.source?.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-gray-700">{row.totalApps}</td>
                      <td className="px-4 py-3 text-green-700 font-semibold">{row.hired}</td>
                      <td className="px-4 py-3 text-indigo-700 font-semibold">{row.conversionPct ?? row.conversionRate ?? 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'time-to-hire' && (
              <div className="p-5 space-y-5">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Overall Average</p>
                  <p className="text-4xl font-bold text-indigo-600 mt-1">{result.overall ?? result.avgDays ?? '—'}<span className="text-lg text-gray-400 ml-1">days</span></p>
                </div>
                {Array.isArray(result.byDepartment) && result.byDepartment.length > 0 && (
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50">
                      <tr>{['Department', 'Avg Days'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.byDepartment.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{row.department}</td>
                          <td className="px-4 py-3 text-gray-700 font-semibold">{row.avgDays} days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {reportType === 'offer-acceptance' && (
              <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    ['Total Offers', result.total ?? '—'],
                    ['Accepted',     result.accepted ?? '—'],
                    ['Rejected',     result.rejected ?? '—'],
                    ['Acceptance %', `${result.acceptanceRate ?? result.rate ?? 0}%`],
                  ].map(([l, v]) => (
                    <div key={l} className="text-center p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">{l}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reportType === 'recruiter' && Array.isArray(result) && (
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>{['Recruiter', 'Jobs Posted', 'Apps Received', 'Hired'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.recruiter || row.name}</td>
                      <td className="px-4 py-3 text-gray-700">{row.jobsPosted}</td>
                      <td className="px-4 py-3 text-gray-700">{row.appsReceived}</td>
                      <td className="px-4 py-3 text-green-700 font-semibold">{row.hired}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
