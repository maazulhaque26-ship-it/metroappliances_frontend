import axios from 'axios';

const BASE = '/api/admin/hr/recruitment';

export const fetchJobs            = (p)      => axios.get(`${BASE}/jobs`, { params: p });
export const fetchJob             = (id)     => axios.get(`${BASE}/jobs/${id}`);
export const createJob            = (d)      => axios.post(`${BASE}/jobs`, d);
export const updateJob            = (id, d)  => axios.put(`${BASE}/jobs/${id}`, d);
export const deleteJob            = (id)     => axios.delete(`${BASE}/jobs/${id}`);
export const postJob              = (id)     => axios.patch(`${BASE}/jobs/${id}/post`);
export const closeJob             = (id)     => axios.patch(`${BASE}/jobs/${id}/close`);
export const holdJob              = (id)     => axios.patch(`${BASE}/jobs/${id}/hold`);
export const fetchJobApplications = (id, p)  => axios.get(`${BASE}/jobs/${id}/applications`, { params: p });

export const fetchApplications     = (p)     => axios.get(`${BASE}/applications`, { params: p });
export const fetchApplication      = (id)    => axios.get(`${BASE}/applications/${id}`);
export const createApplication     = (d)     => axios.post(`${BASE}/applications`, d);
export const updateApplication     = (id, d) => axios.put(`${BASE}/applications/${id}`, d);
export const deleteApplication     = (id)    => axios.delete(`${BASE}/applications/${id}`);
export const moveApplicationStage  = (id, d) => axios.patch(`${BASE}/applications/${id}/move-stage`, d);
export const shortlistApplication  = (id)    => axios.patch(`${BASE}/applications/${id}/shortlist`);
export const rejectApplication     = (id, d) => axios.patch(`${BASE}/applications/${id}/reject`, d);
export const bulkApplicationAction = (d)     => axios.post(`${BASE}/applications/bulk-action`, d);

export const fetchCandidates      = (p)      => axios.get(`${BASE}/candidates`, { params: p });
export const fetchCandidate       = (id)     => axios.get(`${BASE}/candidates/${id}`);
export const createCandidate      = (d)      => axios.post(`${BASE}/candidates`, d);
export const updateCandidate      = (id, d)  => axios.put(`${BASE}/candidates/${id}`, d);
export const deleteCandidate      = (id)     => axios.delete(`${BASE}/candidates/${id}`);
export const fetchCandidateApps   = (id)     => axios.get(`${BASE}/candidates/${id}/applications`);
export const fetchCandidateDocs   = (id)     => axios.get(`${BASE}/candidates/${id}/documents`);
export const addCandidateDocument = (id, d)  => axios.post(`${BASE}/candidates/${id}/documents`, d);
export const addToTalentPool      = (id, d)  => axios.patch(`${BASE}/candidates/${id}/talent-pool`, d);
export const convertToEmployee    = (id, d)  => axios.post(`${BASE}/candidates/${id}/convert`, d);
export const fetchTalentPool      = (p)      => axios.get(`${BASE}/talent-pool`, { params: p });

export const fetchInterviews      = (p)      => axios.get(`${BASE}/interviews`, { params: p });
export const fetchInterview       = (id)     => axios.get(`${BASE}/interviews/${id}`);
export const scheduleInterview    = (d)      => axios.post(`${BASE}/interviews`, d);
export const updateInterview      = (id, d)  => axios.put(`${BASE}/interviews/${id}`, d);
export const completeInterview    = (id, d)  => axios.patch(`${BASE}/interviews/${id}/complete`, d);
export const cancelInterview      = (id, d)  => axios.patch(`${BASE}/interviews/${id}/cancel`, d);
export const rescheduleInterview  = (id, d)  => axios.patch(`${BASE}/interviews/${id}/reschedule`, d);
export const fetchPanel           = (jobId)  => axios.get(`${BASE}/interviews/panel/${jobId}`);
export const setPanel             = (jobId, d) => axios.post(`${BASE}/interviews/panel/${jobId}`, d);
export const fetchFeedback        = (intId)  => axios.get(`${BASE}/interviews/${intId}/feedback`);
export const submitFeedback       = (intId, d) => axios.post(`${BASE}/interviews/${intId}/feedback`, d);

export const fetchOffers          = (p)      => axios.get(`${BASE}/offers`, { params: p });
export const fetchOffer           = (id)     => axios.get(`${BASE}/offers/${id}`);
export const createOffer          = (d)      => axios.post(`${BASE}/offers`, d);
export const updateOffer          = (id, d)  => axios.put(`${BASE}/offers/${id}`, d);
export const sendOffer            = (id)     => axios.patch(`${BASE}/offers/${id}/send`);
export const approveOffer         = (id, d)  => axios.patch(`${BASE}/offers/${id}/approve`, d);
export const rejectOfferLetter    = (id)     => axios.patch(`${BASE}/offers/${id}/reject`);
export const recordAcceptance     = (id, d)  => axios.post(`${BASE}/offers/${id}/acceptance`, d);
export const fetchAcceptance      = (id)     => axios.get(`${BASE}/offers/${id}/acceptance`);
export const fetchOfferApprovals  = (id)     => axios.get(`${BASE}/offers/${id}/approvals`);

export const fetchBGVs            = (p)      => axios.get(`${BASE}/bgv`, { params: p });
export const fetchBGV             = (id)     => axios.get(`${BASE}/bgv/${id}`);
export const initiateBGV          = (d)      => axios.post(`${BASE}/bgv`, d);
export const updateBGVCheck       = (id, d)  => axios.patch(`${BASE}/bgv/${id}/check`, d);
export const completeBGV          = (id)     => axios.patch(`${BASE}/bgv/${id}/complete`);

export const fetchOnboardings     = (p)      => axios.get(`${BASE}/onboarding`, { params: p });
export const fetchOnboarding      = (id)     => axios.get(`${BASE}/onboarding/${id}`);
export const createOnboarding     = (d)      => axios.post(`${BASE}/onboarding`, d);
export const updateOnboardingTask = (id, d)  => axios.patch(`${BASE}/onboarding/${id}/task`, d);
export const completeOnboarding   = (id)     => axios.patch(`${BASE}/onboarding/${id}/complete`);

export const fetchRecruitmentDashboard   = ()  => axios.get(`${BASE}/dashboard`);
export const fetchOpenPositionsReport    = ()  => axios.get(`${BASE}/reports/open-positions`);
export const fetchHiringFunnelReport     = (p) => axios.get(`${BASE}/reports/hiring-funnel`, { params: p });
export const fetchSourceEffectiveness    = ()  => axios.get(`${BASE}/reports/source-effectiveness`);
export const fetchTimeToHireReport       = (p) => axios.get(`${BASE}/reports/time-to-hire`, { params: p });
export const fetchOfferAcceptanceReport  = ()  => axios.get(`${BASE}/reports/offer-acceptance`);
export const fetchRecruiterPerformance   = ()  => axios.get(`${BASE}/reports/recruiter-performance`);
export const fetchDepartmentHiringReport = (p) => axios.get(`${BASE}/reports/department-hiring`, { params: p });
export const fetchRecruitmentSettings   = ()  => axios.get(`${BASE}/settings`);
export const updateRecruitmentSettings  = (d) => axios.put(`${BASE}/settings`, d);

export const fetchAgencies  = (p)      => axios.get(`${BASE}/agencies`, { params: p });
export const createAgency   = (d)      => axios.post(`${BASE}/agencies`, d);
export const updateAgency   = (id, d)  => axios.put(`${BASE}/agencies/${id}`, d);
export const fetchSources   = ()       => axios.get(`${BASE}/sources`);
export const createSource   = (d)      => axios.post(`${BASE}/sources`, d);
