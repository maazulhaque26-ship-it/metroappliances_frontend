import axios from 'axios';
const BASE = '/api/admin/hr';

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const fetchHRDashboard     = ()          => axios.get(`${BASE}/dashboard`);
export const fetchHeadcountReport = ()          => axios.get(`${BASE}/reports/headcount`);
export const fetchAttritionReport = (params)    => axios.get(`${BASE}/reports/attrition`, { params });
export const fetchNewJoinersReport= (params)    => axios.get(`${BASE}/reports/new-joiners`, { params });

// ── Employees ─────────────────────────────────────────────────────────────────
export const fetchEmployees       = (params)    => axios.get(`${BASE}/employees`, { params });
export const fetchEmployee        = (id)        => axios.get(`${BASE}/employees/${id}`);
export const createEmployee       = (data)      => axios.post(`${BASE}/employees`, data);
export const updateEmployee       = (id, data)  => axios.put(`${BASE}/employees/${id}`, data);
export const deleteEmployee       = (id)        => axios.delete(`${BASE}/employees/${id}`);
export const confirmEmployee      = (id)        => axios.patch(`${BASE}/employees/${id}/confirm`);

// Bank Accounts
export const fetchBankAccounts    = (id)        => axios.get(`${BASE}/employees/${id}/bank-accounts`);
export const createBankAccount    = (id, data)  => axios.post(`${BASE}/employees/${id}/bank-accounts`, data);
export const deleteBankAccount    = (id, bid)   => axios.delete(`${BASE}/employees/${id}/bank-accounts/${bid}`);

// Emergency Contacts
export const fetchEmergencyContacts   = (id)       => axios.get(`${BASE}/employees/${id}/emergency-contacts`);
export const createEmergencyContact   = (id, data) => axios.post(`${BASE}/employees/${id}/emergency-contacts`, data);
export const deleteEmergencyContact   = (id, cid)  => axios.delete(`${BASE}/employees/${id}/emergency-contacts/${cid}`);

// Skills
export const fetchSkills        = (id)          => axios.get(`${BASE}/employees/${id}/skills`);
export const createSkill        = (id, data)    => axios.post(`${BASE}/employees/${id}/skills`, data);
export const updateSkill        = (id, sid, data) => axios.put(`${BASE}/employees/${id}/skills/${sid}`, data);
export const deleteSkill        = (id, sid)     => axios.delete(`${BASE}/employees/${id}/skills/${sid}`);

// Certifications
export const fetchCertifications  = (id)         => axios.get(`${BASE}/employees/${id}/certifications`);
export const createCertification  = (id, data)   => axios.post(`${BASE}/employees/${id}/certifications`, data);
export const deleteCertification  = (id, certId) => axios.delete(`${BASE}/employees/${id}/certifications/${certId}`);

// Notes
export const fetchNotes           = (id)         => axios.get(`${BASE}/employees/${id}/notes`);
export const createNote           = (id, data)   => axios.post(`${BASE}/employees/${id}/notes`, data);
export const deleteNote           = (id, nid)    => axios.delete(`${BASE}/employees/${id}/notes/${nid}`);

// Employment History
export const fetchEmploymentHistory   = (id)      => axios.get(`${BASE}/employees/${id}/employment-history`);
export const createEmploymentHistory  = (id, data) => axios.post(`${BASE}/employees/${id}/employment-history`, data);
export const deleteEmploymentHistory  = (id, hid) => axios.delete(`${BASE}/employees/${id}/employment-history/${hid}`);

// ── Departments ───────────────────────────────────────────────────────────────
export const fetchDepartments     = (params)    => axios.get(`${BASE}/departments`, { params });
export const fetchDepartment      = (id)        => axios.get(`${BASE}/departments/${id}`);
export const createDepartment     = (data)      => axios.post(`${BASE}/departments`, data);
export const updateDepartment     = (id, data)  => axios.put(`${BASE}/departments/${id}`, data);
export const deleteDepartment     = (id)        => axios.delete(`${BASE}/departments/${id}`);

// ── Designations ──────────────────────────────────────────────────────────────
export const fetchDesignations    = (params)    => axios.get(`${BASE}/designations`, { params });
export const fetchDesignation     = (id)        => axios.get(`${BASE}/designations/${id}`);
export const createDesignation    = (data)      => axios.post(`${BASE}/designations`, data);
export const updateDesignation    = (id, data)  => axios.put(`${BASE}/designations/${id}`, data);
export const deleteDesignation    = (id)        => axios.delete(`${BASE}/designations/${id}`);

// ── Business Units ────────────────────────────────────────────────────────────
export const fetchBusinessUnits   = ()          => axios.get(`${BASE}/business-units`);
export const createBusinessUnit   = (data)      => axios.post(`${BASE}/business-units`, data);
export const updateBusinessUnit   = (id, data)  => axios.put(`${BASE}/business-units/${id}`, data);
export const deleteBusinessUnit   = (id)        => axios.delete(`${BASE}/business-units/${id}`);

// ── Locations ─────────────────────────────────────────────────────────────────
export const fetchLocations       = ()          => axios.get(`${BASE}/locations`);
export const createLocation       = (data)      => axios.post(`${BASE}/locations`, data);
export const updateLocation       = (id, data)  => axios.put(`${BASE}/locations/${id}`, data);
export const deleteLocation       = (id)        => axios.delete(`${BASE}/locations/${id}`);

// ── Settings ──────────────────────────────────────────────────────────────────
export const fetchHRSettings      = ()          => axios.get(`${BASE}/settings`);
export const upsertHRSetting      = (data)      => axios.post(`${BASE}/settings`, data);

// ── Transfers ─────────────────────────────────────────────────────────────────
export const fetchTransfers       = (params)    => axios.get(`${BASE}/transfers`, { params });
export const fetchTransfer        = (id)        => axios.get(`${BASE}/transfers/${id}`);
export const createTransfer       = (data)      => axios.post(`${BASE}/transfers`, data);
export const approveTransfer      = (id)        => axios.patch(`${BASE}/transfers/${id}/approve`);
export const rejectTransfer       = (id)        => axios.patch(`${BASE}/transfers/${id}/reject`);
export const deleteTransfer       = (id)        => axios.delete(`${BASE}/transfers/${id}`);

// ── Promotions ────────────────────────────────────────────────────────────────
export const fetchPromotions      = (params)    => axios.get(`${BASE}/promotions`, { params });
export const createPromotion      = (data)      => axios.post(`${BASE}/promotions`, data);
export const approvePromotion     = (id)        => axios.patch(`${BASE}/promotions/${id}/approve`);
export const rejectPromotion      = (id)        => axios.patch(`${BASE}/promotions/${id}/reject`);
export const deletePromotion      = (id)        => axios.delete(`${BASE}/promotions/${id}`);

// ── Probation ─────────────────────────────────────────────────────────────────
export const fetchProbations      = (params)    => axios.get(`${BASE}/probation`, { params });
export const createProbation      = (data)      => axios.post(`${BASE}/probation`, data);
export const confirmProbation     = (id)        => axios.patch(`${BASE}/probation/${id}/confirm`);
export const extendProbation      = (id, data)  => axios.patch(`${BASE}/probation/${id}/extend`, data);
export const deleteProbation      = (id)        => axios.delete(`${BASE}/probation/${id}`);

// ── Exits ─────────────────────────────────────────────────────────────────────
export const fetchExits           = (params)    => axios.get(`${BASE}/exits`, { params });
export const fetchExit            = (id)        => axios.get(`${BASE}/exits/${id}`);
export const createExit           = (data)      => axios.post(`${BASE}/exits`, data);
export const updateExit           = (id, data)  => axios.put(`${BASE}/exits/${id}`, data);
export const deleteExit           = (id)        => axios.delete(`${BASE}/exits/${id}`);

// ── Organization ──────────────────────────────────────────────────────────────
export const fetchOrgNodes        = ()          => axios.get(`${BASE}/org/nodes`);
export const createOrgNode        = (data)      => axios.post(`${BASE}/org/nodes`, data);
export const updateOrgNode        = (id, data)  => axios.put(`${BASE}/org/nodes/${id}`, data);
export const deleteOrgNode        = (id)        => axios.delete(`${BASE}/org/nodes/${id}`);

export const fetchOrgCharts       = ()          => axios.get(`${BASE}/org/charts`);
export const fetchActiveOrgChart  = ()          => axios.get(`${BASE}/org/charts/active`);
export const createOrgChart       = (data)      => axios.post(`${BASE}/org/charts`, data);
export const activateOrgChart     = (id)        => axios.patch(`${BASE}/org/charts/${id}/activate`);
export const deleteOrgChart       = (id)        => axios.delete(`${BASE}/org/charts/${id}`);

export const fetchReportingRelationships = (params) => axios.get(`${BASE}/org/reporting`, { params });
export const createReportingRelationship = (data)   => axios.post(`${BASE}/org/reporting`, data);
export const terminateReportingRelationship = (id)  => axios.patch(`${BASE}/org/reporting/${id}/terminate`);
export const fetchHierarchyTree   = (empId)     => axios.get(`${BASE}/org/hierarchy/${empId}`);

// ── Documents ─────────────────────────────────────────────────────────────────
export const fetchDocuments       = (params)    => axios.get(`${BASE}/documents`, { params });
export const fetchDocument        = (id)        => axios.get(`${BASE}/documents/${id}`);
export const fetchExpiringDocuments = (params)  => axios.get(`${BASE}/documents/expiring`, { params });
export const createDocument       = (data)      => axios.post(`${BASE}/documents`, data);
export const updateDocument       = (id, data)  => axios.put(`${BASE}/documents/${id}`, data);
export const verifyDocument       = (id)        => axios.patch(`${BASE}/documents/${id}/verify`);
export const deleteDocument       = (id)        => axios.delete(`${BASE}/documents/${id}`);
