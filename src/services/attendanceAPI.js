import axios from 'axios';
const BASE = '/api/admin/hr';

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const fetchAttendanceDashboard = () => axios.get(`${BASE}/attendance/dashboard`);

// ── Attendance Records ────────────────────────────────────────────────────────
export const fetchAttendances       = (params) => axios.get(`${BASE}/attendance`, { params });
export const fetchAttendance        = (id)     => axios.get(`${BASE}/attendance/${id}`);
export const createAttendance       = (data)   => axios.post(`${BASE}/attendance`, data);
export const updateAttendance       = (id, data) => axios.put(`${BASE}/attendance/${id}`, data);
export const deleteAttendance       = (id)     => axios.delete(`${BASE}/attendance/${id}`);

// ── Employee Punches ──────────────────────────────────────────────────────────
export const fetchPunches           = (params) => axios.get(`${BASE}/attendance/punches`, { params });
export const recordPunch            = (data)   => axios.post(`${BASE}/attendance/punch`, data);

// ── Attendance Summaries ──────────────────────────────────────────────────────
export const fetchSummaries         = (params) => axios.get(`${BASE}/attendance/summaries`, { params });
export const computeSummary         = (data)   => axios.post(`${BASE}/attendance/summaries/compute`, data);

// ── Attendance Exceptions ─────────────────────────────────────────────────────
export const fetchExceptions        = (params) => axios.get(`${BASE}/attendance/exceptions`, { params });
export const resolveException       = (id, data) => axios.patch(`${BASE}/attendance/exceptions/${id}/resolve`, data);

// ── Attendance Policies ───────────────────────────────────────────────────────
export const fetchAttendancePolicies = (params) => axios.get(`${BASE}/attendance/policies`, { params });
export const fetchAttendancePolicy   = (id)     => axios.get(`${BASE}/attendance/policies/${id}`);
export const createAttendancePolicy  = (data)   => axios.post(`${BASE}/attendance/policies`, data);
export const updateAttendancePolicy  = (id, data) => axios.put(`${BASE}/attendance/policies/${id}`, data);
export const deleteAttendancePolicy  = (id)     => axios.delete(`${BASE}/attendance/policies/${id}`);

// ── Attendance Devices ────────────────────────────────────────────────────────
export const fetchDevices            = (params) => axios.get(`${BASE}/attendance/devices`, { params });
export const fetchDevice             = (id)     => axios.get(`${BASE}/attendance/devices/${id}`);
export const createDevice            = (data)   => axios.post(`${BASE}/attendance/devices`, data);
export const updateDevice            = (id, data) => axios.put(`${BASE}/attendance/devices/${id}`, data);
export const deleteDevice            = (id)     => axios.delete(`${BASE}/attendance/devices/${id}`);

// ── Attendance Adjustments ────────────────────────────────────────────────────
export const fetchAdjustments        = (params) => axios.get(`${BASE}/attendance/adjustments`, { params });
export const createAdjustment        = (data)   => axios.post(`${BASE}/attendance/adjustments`, data);
export const approveAdjustment       = (id, data) => axios.patch(`${BASE}/attendance/adjustments/${id}/approve`, data);
export const rejectAdjustment        = (id, data) => axios.patch(`${BASE}/attendance/adjustments/${id}/reject`, data);

// ── Leave Types ───────────────────────────────────────────────────────────────
export const fetchLeaveTypes         = (params) => axios.get(`${BASE}/leave/types`, { params });
export const fetchLeaveType          = (id)     => axios.get(`${BASE}/leave/types/${id}`);
export const createLeaveType         = (data)   => axios.post(`${BASE}/leave/types`, data);
export const updateLeaveType         = (id, data) => axios.put(`${BASE}/leave/types/${id}`, data);
export const deleteLeaveType         = (id)     => axios.delete(`${BASE}/leave/types/${id}`);

// ── Leave Policies ────────────────────────────────────────────────────────────
export const fetchLeavePolicies      = (params) => axios.get(`${BASE}/leave/policies`, { params });
export const fetchLeavePolicy        = (id)     => axios.get(`${BASE}/leave/policies/${id}`);
export const createLeavePolicy       = (data)   => axios.post(`${BASE}/leave/policies`, data);
export const updateLeavePolicy       = (id, data) => axios.put(`${BASE}/leave/policies/${id}`, data);
export const deleteLeavePolicy       = (id)     => axios.delete(`${BASE}/leave/policies/${id}`);

// ── Holidays ──────────────────────────────────────────────────────────────────
export const fetchHolidays           = (params) => axios.get(`${BASE}/leave/holidays`, { params });
export const fetchHoliday            = (id)     => axios.get(`${BASE}/leave/holidays/${id}`);
export const createHoliday           = (data)   => axios.post(`${BASE}/leave/holidays`, data);
export const updateHoliday           = (id, data) => axios.put(`${BASE}/leave/holidays/${id}`, data);
export const deleteHoliday           = (id)     => axios.delete(`${BASE}/leave/holidays/${id}`);

// ── Leave Requests ────────────────────────────────────────────────────────────
export const fetchLeaveRequests      = (params) => axios.get(`${BASE}/leave/requests`, { params });
export const fetchLeaveRequest       = (id)     => axios.get(`${BASE}/leave/requests/${id}`);
export const createLeaveRequest      = (data)   => axios.post(`${BASE}/leave/requests`, data);
export const updateLeaveRequest      = (id, data) => axios.put(`${BASE}/leave/requests/${id}`, data);
export const approveLeaveRequest     = (id, data) => axios.patch(`${BASE}/leave/requests/${id}/approve`, data);
export const rejectLeaveRequest      = (id, data) => axios.patch(`${BASE}/leave/requests/${id}/reject`, data);
export const cancelLeaveRequest      = (id, data) => axios.patch(`${BASE}/leave/requests/${id}/cancel`, data);
export const deleteLeaveRequest      = (id)     => axios.delete(`${BASE}/leave/requests/${id}`);

// ── Leave Balances ────────────────────────────────────────────────────────────
export const fetchLeaveBalances      = (params) => axios.get(`${BASE}/leave/balances`, { params });
export const upsertLeaveBalance      = (data)   => axios.post(`${BASE}/leave/balances`, data);

// ── Leave Accruals ────────────────────────────────────────────────────────────
export const fetchLeaveAccruals      = (params) => axios.get(`${BASE}/leave/accruals`, { params });
export const createLeaveAccrual      = (data)   => axios.post(`${BASE}/leave/accruals`, data);

// ── Leave Encashments ─────────────────────────────────────────────────────────
export const fetchEncashments        = (params) => axios.get(`${BASE}/leave/encashments`, { params });
export const createEncashment        = (data)   => axios.post(`${BASE}/leave/encashments`, data);
export const approveEncashment       = (id, data) => axios.patch(`${BASE}/leave/encashments/${id}/approve`, data);
export const rejectEncashment        = (id, data) => axios.patch(`${BASE}/leave/encashments/${id}/reject`, data);

// ── Attendance Reports ────────────────────────────────────────────────────────
export const fetchDailyAttendance    = (params) => axios.get(`${BASE}/reports/attendance/daily`, { params });
export const fetchMonthlyAttendance  = (params) => axios.get(`${BASE}/reports/attendance/monthly`, { params });
export const fetchLateReport         = (params) => axios.get(`${BASE}/reports/attendance/late`, { params });
export const fetchAbsenteeReport     = (params) => axios.get(`${BASE}/reports/attendance/absentee`, { params });

// ── Leave Reports ─────────────────────────────────────────────────────────────
export const fetchLeaveUtilization   = (params) => axios.get(`${BASE}/reports/leave/utilization`, { params });
export const fetchLeaveBalanceReport = (params) => axios.get(`${BASE}/reports/leave/balances`, { params });
