import React, { useEffect, useState } from 'react';
import { FiUsers, FiUserX, FiClock, FiAlertCircle, FiCheckSquare, FiCalendar } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import MetricCard from '../../components/shared/MetricCard';
import LoadingState from '../../components/shared/LoadingState';
import ErrorState from '../../components/shared/ErrorState';
import { fetchAttendanceDashboard } from '../../services/attendanceAPI';

export default function AdminAttendanceDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetchAttendanceDashboard()
      .then(r => setData(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><LoadingState /></AdminLayout>;
  if (error)   return <AdminLayout><ErrorState message={error} /></AdminLayout>;

  const { kpis, upcomingHolidays } = data || {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Today's attendance overview</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard icon={FiUsers}       label="Present"           value={kpis?.present ?? 0}           color="green" />
          <MetricCard icon={FiUserX}       label="Absent"            value={kpis?.absent ?? 0}            color="red" />
          <MetricCard icon={FiCalendar}    label="On Leave"          value={kpis?.onLeave ?? 0}           color="blue" />
          <MetricCard icon={FiClock}       label="Late Arrivals"     value={kpis?.lateArrivals ?? 0}      color="yellow" />
          <MetricCard icon={FiAlertCircle} label="Pending Approvals" value={kpis?.pendingApprovals ?? 0}  color="orange" />
          <MetricCard icon={FiCheckSquare} label="Total Employees"   value={kpis?.totalEmployees ?? 0}    color="indigo" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Upcoming Holidays</h2>
          {(!upcomingHolidays || upcomingHolidays.length === 0) ? (
            <p className="text-sm text-gray-500">No upcoming holidays</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {upcomingHolidays.map(h => (
                <div key={h._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{h.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{h.holidayType.replace('_', ' ')}</p>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
