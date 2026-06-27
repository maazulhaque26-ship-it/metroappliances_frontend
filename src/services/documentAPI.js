import axios from 'axios';

const BASE = '/api/admin/documents';
const KB   = '/api/admin/knowledge';
const cfg  = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });

// ── DMS Dashboard & Analytics ──────────────────────────────────────────────
export const fetchDMSDashboard        = ()       => axios.get(`${BASE}/dashboard`, cfg());
export const fetchDocumentActivity    = (p = {}) => axios.get(`${BASE}/analytics/activity`, { ...cfg(), params: p });
export const fetchExpiryReport        = (p = {}) => axios.get(`${BASE}/analytics/expiry`, { ...cfg(), params: p });
export const fetchRetentionReport     = ()       => axios.get(`${BASE}/analytics/retention`, cfg());
export const fetchReviewReport        = ()       => axios.get(`${BASE}/analytics/reviews`, cfg());
export const fetchDocumentAuditReport = (p = {}) => axios.get(`${BASE}/analytics/audit`, { ...cfg(), params: p });
export const fetchKnowledgeUsageReport= ()       => axios.get(`${BASE}/analytics/knowledge`, cfg());

// ── Document Search & Discovery ─────────────────────────────────────────────
export const searchDocuments     = (p = {}) => axios.get(`${BASE}/search`, { ...cfg(), params: p });
export const fetchMyDocuments    = (p = {}) => axios.get(`${BASE}/my`, { ...cfg(), params: p });
export const fetchMyFavorites    = ()       => axios.get(`${BASE}/favorites`, cfg());
export const fetchRecentDocuments= ()       => axios.get(`${BASE}/recent`, cfg());
export const fetchExpiringDocuments = (p={})=> axios.get(`${BASE}/expiring`, { ...cfg(), params: p });

// ── Documents CRUD ──────────────────────────────────────────────────────────
export const fetchDocuments      = (p = {}) => axios.get(BASE, { ...cfg(), params: p });
export const createDocument      = (d)      => axios.post(BASE, d, cfg());
export const fetchDocument       = (id)     => axios.get(`${BASE}/${id}`, cfg());
export const updateDocument      = (id, d)  => axios.put(`${BASE}/${id}`, d, cfg());
export const deleteDocument      = (id)     => axios.delete(`${BASE}/${id}`, cfg());

// ── Document File Actions ────────────────────────────────────────────────────
export const uploadDocumentFile  = (id, fd) => axios.post(`${BASE}/${id}/upload`, fd, { ...cfg(), headers: { ...cfg().headers, 'Content-Type': 'multipart/form-data' } });
export const checkOutDocument    = (id)     => axios.post(`${BASE}/${id}/checkout`, {}, cfg());
export const checkInDocument     = (id, d)  => axios.post(`${BASE}/${id}/checkin`, d, cfg());
export const toggleFavorite      = (id)     => axios.post(`${BASE}/${id}/favorite`, {}, cfg());
export const downloadDocument    = (id)     => axios.get(`${BASE}/${id}/download`, cfg());
export const publishDocument     = (id, d)  => axios.post(`${BASE}/${id}/publish`, d, cfg());
export const archiveDocument     = (id, d)  => axios.post(`${BASE}/${id}/archive`, d, cfg());

// ── Document Versions ────────────────────────────────────────────────────────
export const fetchVersions       = (id)         => axios.get(`${BASE}/${id}/versions`, cfg());
export const restoreVersion      = (id, verId)  => axios.post(`${BASE}/${id}/versions/${verId}/restore`, {}, cfg());

// ── Document Comments ────────────────────────────────────────────────────────
export const fetchDocumentComments= (id)    => axios.get(`${BASE}/${id}/comments`, cfg());
export const addDocumentComment   = (id, d) => axios.post(`${BASE}/${id}/comments`, d, cfg());
export const deleteDocumentComment= (id, cid)=> axios.delete(`${BASE}/${id}/comments/${cid}`, cfg());

// ── Document Permissions ─────────────────────────────────────────────────────
export const fetchPermissions    = (id)       => axios.get(`${BASE}/${id}/permissions`, cfg());
export const grantPermission     = (id, d)    => axios.post(`${BASE}/${id}/permissions`, d, cfg());
export const revokePermission    = (id, pid)  => axios.delete(`${BASE}/${id}/permissions/${pid}`, cfg());

// ── Document Sharing ─────────────────────────────────────────────────────────
export const fetchShares         = (id)       => axios.get(`${BASE}/${id}/shares`, cfg());
export const shareDocument       = (id, d)    => axios.post(`${BASE}/${id}/share`, d, cfg());
export const revokeShare         = (id, sid)  => axios.delete(`${BASE}/${id}/shares/${sid}`, cfg());

// ── Document Signatures ──────────────────────────────────────────────────────
export const fetchSignatures     = (id)       => axios.get(`${BASE}/${id}/signatures`, cfg());
export const requestSignature    = (id, d)    => axios.post(`${BASE}/${id}/signatures`, d, cfg());
export const signDocument        = (id, sid, d) => axios.patch(`${BASE}/${id}/signatures/${sid}/sign`, d, cfg());
export const declineSignature    = (id, sid, d) => axios.patch(`${BASE}/${id}/signatures/${sid}/decline`, d, cfg());

// ── Folders ──────────────────────────────────────────────────────────────────
export const fetchFolders        = (p = {}) => axios.get(`${BASE}/folders`, { ...cfg(), params: p });
export const createFolder        = (d)      => axios.post(`${BASE}/folders`, d, cfg());
export const updateFolder        = (id, d)  => axios.put(`${BASE}/folders/${id}`, d, cfg());
export const deleteFolder        = (id)     => axios.delete(`${BASE}/folders/${id}`, cfg());

// ── Categories ────────────────────────────────────────────────────────────────
export const fetchDocCategories  = ()       => axios.get(`${BASE}/categories`, cfg());
export const createDocCategory   = (d)      => axios.post(`${BASE}/categories`, d, cfg());
export const updateDocCategory   = (id, d)  => axios.put(`${BASE}/categories/${id}`, d, cfg());
export const deleteDocCategory   = (id)     => axios.delete(`${BASE}/categories/${id}`, cfg());

// ── Tags ─────────────────────────────────────────────────────────────────────
export const fetchDocTags        = ()       => axios.get(`${BASE}/tags`, cfg());
export const createDocTag        = (d)      => axios.post(`${BASE}/tags`, d, cfg());
export const deleteDocTag        = (id)     => axios.delete(`${BASE}/tags/${id}`, cfg());

// ── Templates ─────────────────────────────────────────────────────────────────
export const fetchDocTemplates   = (p = {}) => axios.get(`${BASE}/templates`, { ...cfg(), params: p });
export const createDocTemplate   = (d)      => axios.post(`${BASE}/templates`, d, cfg());
export const uploadTemplateFile  = (id, fd) => axios.post(`${BASE}/templates/${id}/file`, fd, { ...cfg(), headers: { ...cfg().headers, 'Content-Type': 'multipart/form-data' } });
export const createFromTemplate  = (id, d)  => axios.post(`${BASE}/templates/${id}/use`, d, cfg());
export const updateDocTemplate   = (id, d)  => axios.put(`${BASE}/templates/${id}`, d, cfg());
export const deleteDocTemplate   = (id)     => axios.delete(`${BASE}/templates/${id}`, cfg());

// ── Approvals ─────────────────────────────────────────────────────────────────
export const fetchDocApprovals   = (p = {}) => axios.get(`${BASE}/approvals`, { ...cfg(), params: p });
export const createDocApproval   = (d)      => axios.post(`${BASE}/approvals`, d, cfg());
export const approveDocument     = (id, d)  => axios.patch(`${BASE}/approvals/${id}/approve`, d, cfg());
export const rejectDocument      = (id, d)  => axios.patch(`${BASE}/approvals/${id}/reject`, d, cfg());
export const fetchPendingApprovals= ()      => axios.get(`${BASE}/approvals/pending`, cfg());

// ── Reviews ───────────────────────────────────────────────────────────────────
export const fetchDocReviews     = (p = {}) => axios.get(`${BASE}/reviews`, { ...cfg(), params: p });
export const createDocReview     = (d)      => axios.post(`${BASE}/reviews`, d, cfg());
export const completeDocReview   = (id, d)  => axios.patch(`${BASE}/reviews/${id}/complete`, d, cfg());
export const fetchOverdueReviews = ()       => axios.get(`${BASE}/reviews/overdue`, cfg());

// ── Retention ─────────────────────────────────────────────────────────────────
export const fetchRetentionPolicies  = ()       => axios.get(`${BASE}/retention`, cfg());
export const createRetentionPolicy   = (d)      => axios.post(`${BASE}/retention`, d, cfg());
export const updateRetentionPolicy   = (id, d)  => axios.put(`${BASE}/retention/${id}`, d, cfg());
export const deleteRetentionPolicy   = (id)     => axios.delete(`${BASE}/retention/${id}`, cfg());
export const applyRetentionPolicy    = (id, d)  => axios.post(`${BASE}/retention/${id}/apply`, d, cfg());

// ── Archive ───────────────────────────────────────────────────────────────────
export const fetchArchives       = (p = {}) => axios.get(`${BASE}/archive`, { ...cfg(), params: p });
export const restoreFromArchive  = (id, d)  => axios.post(`${BASE}/archive/${id}/restore`, d, cfg());

// ── Knowledge Base Articles ────────────────────────────────────────────────────
export const fetchKBArticles     = (p = {}) => axios.get(KB, { ...cfg(), params: p });
export const createKBArticle     = (d)      => axios.post(KB, d, cfg());
export const fetchKBArticle      = (id)     => axios.get(`${KB}/${id}`, cfg());
export const updateKBArticle     = (id, d)  => axios.put(`${KB}/${id}`, d, cfg());
export const deleteKBArticle     = (id)     => axios.delete(`${KB}/${id}`, cfg());
export const publishKBArticle    = (id)     => axios.post(`${KB}/${id}/publish`, {}, cfg());
export const archiveKBArticle    = (id)     => axios.post(`${KB}/${id}/archive`, {}, cfg());
export const searchKBArticles    = (p = {}) => axios.get(`${KB}/search`, { ...cfg(), params: p });
export const fetchPopularArticles= (p = {}) => axios.get(`${KB}/popular`, { ...cfg(), params: p });
export const fetchRelatedArticles= (id)     => axios.get(`${KB}/${id}/related`, cfg());

// ── Knowledge Base Feedback & Bookmarks ────────────────────────────────────────
export const fetchKBFeedback     = (id)     => axios.get(`${KB}/${id}/feedback`, cfg());
export const addKBFeedback       = (id, d)  => axios.post(`${KB}/${id}/feedback`, d, cfg());
export const toggleKBBookmark    = (id, d)  => axios.post(`${KB}/${id}/bookmark`, d, cfg());
export const deleteKBBookmark    = (id, bmId)=> axios.delete(`${KB}/${id}/bookmarks/${bmId}`, cfg());
export const fetchMyKBBookmarks  = ()       => axios.get(`${KB}/bookmarks`, cfg());

// ── Knowledge Base Revisions ───────────────────────────────────────────────────
export const fetchKBRevisions    = (id)          => axios.get(`${KB}/${id}/revisions`, cfg());
export const fetchKBRevision     = (id, revId)   => axios.get(`${KB}/${id}/revisions/${revId}`, cfg());

// ── Knowledge Base Categories ──────────────────────────────────────────────────
export const fetchKBCategories   = (p = {}) => axios.get(`${KB}/categories`, { ...cfg(), params: p });
export const createKBCategory    = (d)      => axios.post(`${KB}/categories`, d, cfg());
export const updateKBCategory    = (id, d)  => axios.put(`${KB}/categories/${id}`, d, cfg());
export const deleteKBCategory    = (id)     => axios.delete(`${KB}/categories/${id}`, cfg());
