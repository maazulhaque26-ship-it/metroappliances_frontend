import axios from 'axios';

const BASE = '/api/admin/projects';

// Dashboard
export const fetchProjectDashboard = () => axios.get(`${BASE}/dashboard`);

// Projects
export const fetchProjects = (params) => axios.get(BASE, { params });
export const createProject = (data) => axios.post(BASE, data);
export const fetchProject = (id) => axios.get(`${BASE}/${id}`);
export const updateProject = (id, data) => axios.put(`${BASE}/${id}`, data);
export const deleteProject = (id) => axios.delete(`${BASE}/${id}`);
export const updateProjectStatus = (id, status) => axios.patch(`${BASE}/${id}/status`, { status });

// Templates
export const fetchTemplates = (params) => axios.get(`${BASE}/templates`, { params });
export const createTemplate = (data) => axios.post(`${BASE}/templates`, data);
export const updateTemplate = (id, data) => axios.put(`${BASE}/templates/${id}`, data);
export const deleteTemplate = (id) => axios.delete(`${BASE}/templates/${id}`);

// Phases
export const fetchPhases = (projectId) => axios.get(`${BASE}/${projectId}/phases`);
export const createPhase = (projectId, data) => axios.post(`${BASE}/${projectId}/phases`, data);
export const updatePhase = (id, data) => axios.put(`${BASE}/phases/${id}`, data);
export const deletePhase = (id) => axios.delete(`${BASE}/phases/${id}`);

// Milestones
export const fetchMilestones = (projectId, params) => axios.get(`${BASE}/${projectId}/milestones`, { params });
export const createMilestone = (projectId, data) => axios.post(`${BASE}/${projectId}/milestones`, data);
export const fetchMilestone = (id) => axios.get(`${BASE}/milestones/${id}`);
export const updateMilestone = (id, data) => axios.put(`${BASE}/milestones/${id}`, data);
export const deleteMilestone = (id) => axios.delete(`${BASE}/milestones/${id}`);
export const completeMilestone = (id) => axios.patch(`${BASE}/milestones/${id}/complete`);

// Tasks
export const fetchTasks = (projectId, params) => axios.get(`${BASE}/${projectId}/tasks`, { params });
export const createTask = (projectId, data) => axios.post(`${BASE}/${projectId}/tasks`, data);
export const fetchTask = (id) => axios.get(`${BASE}/tasks/${id}`);
export const updateTask = (id, data) => axios.put(`${BASE}/tasks/${id}`, data);
export const deleteTask = (id) => axios.delete(`${BASE}/tasks/${id}`);
export const updateTaskStatus = (id, status) => axios.patch(`${BASE}/tasks/${id}/status`, { status });

// SubTasks
export const fetchSubTasks = (taskId) => axios.get(`${BASE}/tasks/${taskId}/subtasks`);
export const createSubTask = (taskId, data) => axios.post(`${BASE}/tasks/${taskId}/subtasks`, data);
export const updateSubTask = (id, data) => axios.put(`${BASE}/subtasks/${id}`, data);
export const deleteSubTask = (id) => axios.delete(`${BASE}/subtasks/${id}`);

// Comments
export const fetchComments = (taskId) => axios.get(`${BASE}/tasks/${taskId}/comments`);
export const addComment = (taskId, data) => axios.post(`${BASE}/tasks/${taskId}/comments`, data);
export const deleteComment = (id) => axios.delete(`${BASE}/tasks/comments/${id}`);

// Attachments
export const addAttachment = (taskId, data) => axios.post(`${BASE}/tasks/${taskId}/attachments`, data);
export const deleteAttachment = (id) => axios.delete(`${BASE}/tasks/attachments/${id}`);

// Dependencies
export const fetchDependencies = (taskId) => axios.get(`${BASE}/tasks/${taskId}/dependencies`);
export const addDependency = (data) => axios.post(`${BASE}/tasks/dependencies`, data);
export const removeDependency = (id) => axios.delete(`${BASE}/tasks/dependencies/${id}`);

// Members
export const fetchMembers = (projectId) => axios.get(`${BASE}/${projectId}/members`);
export const addMember = (projectId, data) => axios.post(`${BASE}/${projectId}/members`, data);
export const updateMember = (id, data) => axios.put(`${BASE}/members/${id}`, data);
export const removeMember = (id) => axios.delete(`${BASE}/members/${id}`);

// Resources
export const fetchResources = (projectId) => axios.get(`${BASE}/${projectId}/resources`);
export const createResource = (projectId, data) => axios.post(`${BASE}/${projectId}/resources`, data);
export const updateResource = (id, data) => axios.put(`${BASE}/resources/${id}`, data);
export const deleteResource = (id) => axios.delete(`${BASE}/resources/${id}`);

// Time Entries
export const fetchTimeEntries = (projectId, params) => axios.get(`${BASE}/${projectId}/time-entries`, { params });
export const createTimeEntry = (projectId, data) => axios.post(`${BASE}/${projectId}/time-entries`, data);
export const updateTimeEntry = (id, data) => axios.put(`${BASE}/time-entries/${id}`, data);
export const deleteTimeEntry = (id) => axios.delete(`${BASE}/time-entries/${id}`);

// Timesheets
export const fetchTimesheets = (projectId, params) => axios.get(`${BASE}/${projectId}/timesheets`, { params });
export const createTimesheet = (projectId, data) => axios.post(`${BASE}/${projectId}/timesheets`, data);
export const updateTimesheet = (id, data) => axios.put(`${BASE}/timesheets/${id}`, data);
export const submitTimesheet = (id) => axios.patch(`${BASE}/timesheets/${id}/submit`);
export const approveTimesheet = (id) => axios.patch(`${BASE}/timesheets/${id}/approve`);
export const fetchTimesheetSummary = (params) => axios.get(`${BASE}/timesheets/summary`, { params });

// Risks
export const fetchRisks = (projectId, params) => axios.get(`${BASE}/${projectId}/risks`, { params });
export const createRisk = (projectId, data) => axios.post(`${BASE}/${projectId}/risks`, data);
export const fetchRisk = (id) => axios.get(`${BASE}/risks/${id}`);
export const updateRisk = (id, data) => axios.put(`${BASE}/risks/${id}`, data);
export const deleteRisk = (id) => axios.delete(`${BASE}/risks/${id}`);

// Issues
export const fetchIssues = (projectId, params) => axios.get(`${BASE}/${projectId}/issues`, { params });
export const createIssue = (projectId, data) => axios.post(`${BASE}/${projectId}/issues`, data);
export const fetchIssue = (id) => axios.get(`${BASE}/issues/${id}`);
export const updateIssue = (id, data) => axios.put(`${BASE}/issues/${id}`, data);
export const deleteIssue = (id) => axios.delete(`${BASE}/issues/${id}`);

// Kanban
export const fetchBoards = (projectId) => axios.get(`${BASE}/${projectId}/kanban`);
export const createBoard = (projectId, data) => axios.post(`${BASE}/${projectId}/kanban`, data);
export const fetchBoard = (id) => axios.get(`${BASE}/kanban/${id}`);
export const updateBoard = (id, data) => axios.put(`${BASE}/kanban/${id}`, data);
export const fetchColumns = (boardId) => axios.get(`${BASE}/kanban/${boardId}/columns`);
export const createColumn = (boardId, data) => axios.post(`${BASE}/kanban/${boardId}/columns`, data);
export const updateColumn = (id, data) => axios.put(`${BASE}/kanban/columns/${id}`, data);
export const deleteColumn = (id) => axios.delete(`${BASE}/kanban/columns/${id}`);
export const fetchCards = (boardId) => axios.get(`${BASE}/kanban/${boardId}/cards`);
export const createCard = (boardId, data) => axios.post(`${BASE}/kanban/${boardId}/cards`, data);
export const updateCard = (id, data) => axios.put(`${BASE}/kanban/cards/${id}`, data);
export const deleteCard = (id) => axios.delete(`${BASE}/kanban/cards/${id}`);
export const moveCard = (id, data) => axios.patch(`${BASE}/kanban/cards/${id}/move`, data);

// Sprint
export const fetchSprints = (projectId) => axios.get(`${BASE}/${projectId}/sprint`);
export const createSprint = (projectId, data) => axios.post(`${BASE}/${projectId}/sprint`, data);
export const updateSprint = (id, data) => axios.put(`${BASE}/sprint/${id}`, data);
export const completeSprint = (id) => axios.patch(`${BASE}/sprint/${id}/complete`);

// Roles
export const fetchProjectRoles = () => axios.get(`${BASE}/roles`);
export const createProjectRole = (data) => axios.post(`${BASE}/roles`, data);
export const updateProjectRole = (id, data) => axios.put(`${BASE}/roles/${id}`, data);
export const deleteProjectRole = (id) => axios.delete(`${BASE}/roles/${id}`);

// Budget & Costs
export const fetchProjectBudget = (projectId) => axios.get(`${BASE}/${projectId}/budget`);
export const createProjectBudget = (projectId, data) => axios.post(`${BASE}/${projectId}/budget`, data);
export const updateProjectBudget = (id, data) => axios.put(`${BASE}/budget/${id}`, data);
export const fetchProjectCosts = (projectId) => axios.get(`${BASE}/${projectId}/costs`);
export const createProjectCost = (projectId, data) => axios.post(`${BASE}/${projectId}/costs`, data);
export const updateProjectCost = (id, data) => axios.put(`${BASE}/costs/${id}`, data);

// Calendar
export const fetchCalendarEvents = (projectId) => axios.get(`${BASE}/${projectId}/calendar`);
export const createCalendarEvent = (projectId, data) => axios.post(`${BASE}/${projectId}/calendar`, data);
export const updateCalendarEvent = (id, data) => axios.put(`${BASE}/calendar/${id}`, data);
export const deleteCalendarEvent = (id) => axios.delete(`${BASE}/calendar/${id}`);

// Reports
export const fetchProgressReport = (params) => axios.get(`${BASE}/reports/progress`, { params });
export const fetchMilestoneReport = (params) => axios.get(`${BASE}/reports/milestones`, { params });
export const fetchBudgetReport = (params) => axios.get(`${BASE}/reports/budget`, { params });
export const fetchResourceReport = (params) => axios.get(`${BASE}/reports/resources`, { params });
export const fetchTaskReport = (params) => axios.get(`${BASE}/reports/tasks`, { params });
export const fetchTimesheetReport = (params) => axios.get(`${BASE}/reports/timesheets`, { params });
export const fetchRiskReport = (params) => axios.get(`${BASE}/reports/risks`, { params });
export const fetchIssueReport = (params) => axios.get(`${BASE}/reports/issues`, { params });

// Settings & Notifications
export const fetchProjectSettings = () => axios.get(`${BASE}/settings`);
export const updateProjectSettings = (data) => axios.put(`${BASE}/settings`, data);
export const fetchProjectNotifications = (params) => axios.get(`${BASE}/notifications`, { params });
