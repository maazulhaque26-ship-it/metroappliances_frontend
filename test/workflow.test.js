'use strict';
const mongoose = require('mongoose');

const TEST_DB = 'mongodb://localhost:27017/metro_test_workflow';

beforeAll(async () => {
  await mongoose.connect(TEST_DB);
  // Register all models
  require('../models/Workflow');
  require('../models/WorkflowTemplate');
  require('../models/WorkflowInstance');
  require('../models/WorkflowStep');
  require('../models/WorkflowStage');
  require('../models/WorkflowAction');
  require('../models/WorkflowAssignment');
  require('../models/WorkflowTransition');
  require('../models/WorkflowApproval');
  require('../models/WorkflowRule');
  require('../models/WorkflowEscalation');
  require('../models/WorkflowSLA');
  require('../models/WorkflowNotification');
  require('../models/WorkflowHistory');
  require('../models/WorkflowComment');
  require('../models/WorkflowAttachment');
  require('../models/WorkflowCondition');
  require('../models/WorkflowTrigger');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  const cols = Object.values(mongoose.connection.collections);
  for (const col of cols) await col.deleteMany({});
});

// ── Workflow ──────────────────────────────────────────────────────────────────
describe('Workflow model', () => {
  const M = () => mongoose.model('Workflow');

  it('auto-generates workflowCode WF- prefix', async () => {
    const doc = await M().create({ name: 'Leave Approval', module: 'hr' });
    expect(doc.workflowCode).toMatch(/^WF-\d{4}-\d{5}$/);
  });

  it('requires name and module', async () => {
    await expect(M().create({ name: 'X' })).rejects.toThrow();
    await expect(M().create({ module: 'hr' })).rejects.toThrow();
  });

  it('defaults status to draft', async () => {
    const doc = await M().create({ name: 'PO Approval', module: 'procurement' });
    expect(doc.status).toBe('draft');
  });

  it('rejects invalid module', async () => {
    await expect(M().create({ name: 'X', module: 'invalid_module' })).rejects.toThrow();
  });

  it('assigns sequential codes', async () => {
    const d1 = await M().create({ name: 'WF1', module: 'finance' });
    const d2 = await M().create({ name: 'WF2', module: 'finance' });
    expect(d1.workflowCode).not.toBe(d2.workflowCode);
  });

  it('stores tags array', async () => {
    const doc = await M().create({ name: 'WF', module: 'hr', tags: ['fast', 'critical'] });
    expect(doc.tags).toHaveLength(2);
  });
});

// ── WorkflowTemplate ──────────────────────────────────────────────────────────
describe('WorkflowTemplate model', () => {
  const M = () => mongoose.model('WorkflowTemplate');

  it('auto-generates templateCode WFT- prefix', async () => {
    const doc = await M().create({ name: 'Leave Template', module: 'hr' });
    expect(doc.templateCode).toMatch(/^WFT-\d{4}-\d{5}$/);
  });

  it('defaults usageCount to 0', async () => {
    const doc = await M().create({ name: 'T', module: 'procurement' });
    expect(doc.usageCount).toBe(0);
  });

  it('stores defaultSteps subdocuments', async () => {
    const doc = await M().create({
      name: 'PO Template',
      module: 'procurement',
      defaultSteps: [
        { name: 'Manager Approval', stepOrder: 1, stepType: 'approval', slaHours: 24 },
        { name: 'CFO Approval', stepOrder: 2, stepType: 'approval', slaHours: 48 },
      ],
    });
    expect(doc.defaultSteps).toHaveLength(2);
    expect(doc.defaultSteps[0].stepOrder).toBe(1);
  });

  it('defaults isPublic to true', async () => {
    const doc = await M().create({ name: 'T', module: 'hr' });
    expect(doc.isPublic).toBe(true);
  });
});

// ── WorkflowStep ──────────────────────────────────────────────────────────────
describe('WorkflowStep model', () => {
  const M = () => mongoose.model('WorkflowStep');
  let workflowId;

  beforeEach(async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'WF', module: 'hr' });
    workflowId = wf._id;
  });

  it('auto-generates stepCode WFS- prefix', async () => {
    const doc = await M().create({ name: 'Step 1', workflow: workflowId, stepOrder: 1 });
    expect(doc.stepCode).toMatch(/^WFS-\d{4}-\d{5}$/);
  });

  it('requires workflow and name', async () => {
    await expect(M().create({ name: 'S' })).rejects.toThrow();
    await expect(M().create({ workflow: workflowId })).rejects.toThrow();
  });

  it('defaults slaHours to 24', async () => {
    const doc = await M().create({ name: 'S', workflow: workflowId, stepOrder: 1 });
    expect(doc.slaHours).toBe(24);
  });

  it('accepts assignees array', async () => {
    const userId = new mongoose.Types.ObjectId();
    const doc = await M().create({
      name: 'S', workflow: workflowId, stepOrder: 1,
      assignees: [{ user: userId }],
    });
    expect(doc.assignees).toHaveLength(1);
  });
});

// ── WorkflowInstance ──────────────────────────────────────────────────────────
describe('WorkflowInstance model', () => {
  const M = () => mongoose.model('WorkflowInstance');
  let workflowId;

  beforeEach(async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'WF', module: 'hr' });
    workflowId = wf._id;
  });

  it('auto-generates instanceCode WFI- prefix', async () => {
    const doc = await M().create({ workflow: workflowId, title: 'Leave Request' });
    expect(doc.instanceCode).toMatch(/^WFI-\d{4}-\d{5}$/);
  });

  it('requires workflow and title', async () => {
    await expect(M().create({ title: 'T' })).rejects.toThrow();
    await expect(M().create({ workflow: workflowId })).rejects.toThrow();
  });

  it('defaults status to pending', async () => {
    const doc = await M().create({ workflow: workflowId, title: 'Leave Request' });
    expect(doc.status).toBe('pending');
  });

  it('defaults slaBreached and escalated to false', async () => {
    const doc = await M().create({ workflow: workflowId, title: 'T' });
    expect(doc.slaBreached).toBe(false);
    expect(doc.escalated).toBe(false);
  });

  it('stores metadata as Mixed', async () => {
    const doc = await M().create({
      workflow: workflowId,
      title: 'PO Approval',
      metadata: { poNumber: 'PO-001', amount: 50000 },
    });
    expect(doc.metadata.poNumber).toBe('PO-001');
  });
});

// ── WorkflowStage ─────────────────────────────────────────────────────────────
describe('WorkflowStage model', () => {
  const M = () => mongoose.model('WorkflowStage');
  let instanceId;

  beforeEach(async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'WF', module: 'hr' });
    const inst = await mongoose.model('WorkflowInstance').create({ workflow: wf._id, title: 'T' });
    instanceId = inst._id;
  });

  it('auto-generates stageCode STG- prefix', async () => {
    const doc = await M().create({ instance: instanceId, name: 'Stage 1', order: 1 });
    expect(doc.stageCode).toMatch(/^STG-\d{4}-\d{5}$/);
  });

  it('defaults status to pending', async () => {
    const doc = await M().create({ instance: instanceId, name: 'S', order: 1 });
    expect(doc.status).toBe('pending');
  });

  it('stores assignees subdocuments', async () => {
    const userId = new mongoose.Types.ObjectId();
    const doc = await M().create({
      instance: instanceId, name: 'S', order: 1,
      assignees: [{ user: userId, status: 'pending' }],
    });
    expect(doc.assignees).toHaveLength(1);
    expect(doc.assignees[0].status).toBe('pending');
  });
});

// ── WorkflowApproval ──────────────────────────────────────────────────────────
describe('WorkflowApproval model', () => {
  const M = () => mongoose.model('WorkflowApproval');
  let instanceId, approverId;

  beforeEach(async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'WF', module: 'finance' });
    const inst = await mongoose.model('WorkflowInstance').create({ workflow: wf._id, title: 'Expense' });
    instanceId = inst._id;
    approverId = new mongoose.Types.ObjectId();
  });

  it('auto-generates approvalCode APR- prefix', async () => {
    const doc = await M().create({ instance: instanceId, approver: approverId });
    expect(doc.approvalCode).toMatch(/^APR-\d{4}-\d{5}$/);
  });

  it('defaults status to pending', async () => {
    const doc = await M().create({ instance: instanceId, approver: approverId });
    expect(doc.status).toBe('pending');
  });

  it('requires instance and approver', async () => {
    await expect(M().create({ approver: approverId })).rejects.toThrow();
    await expect(M().create({ instance: instanceId })).rejects.toThrow();
  });

  it('defaults isOverridden to false', async () => {
    const doc = await M().create({ instance: instanceId, approver: approverId });
    expect(doc.isOverridden).toBe(false);
  });
});

// ── WorkflowRule ──────────────────────────────────────────────────────────────
describe('WorkflowRule model', () => {
  const M = () => mongoose.model('WorkflowRule');

  it('auto-generates ruleCode WFR- prefix', async () => {
    const doc = await M().create({ name: 'Auto Approve Low Value' });
    expect(doc.ruleCode).toMatch(/^WFR-\d{4}-\d{5}$/);
  });

  it('defaults isActive to true', async () => {
    const doc = await M().create({ name: 'Rule 1' });
    expect(doc.isActive).toBe(true);
  });

  it('stores conditions array', async () => {
    const doc = await M().create({
      name: 'Amount Rule',
      conditions: [{ field: 'amount', operator: 'less_than', value: 1000 }],
    });
    expect(doc.conditions).toHaveLength(1);
    expect(doc.conditions[0].field).toBe('amount');
  });

  it('stores actions array', async () => {
    const doc = await M().create({
      name: 'Auto Rule',
      actions: [{ type: 'auto_approve', config: { reason: 'Low value' } }],
    });
    expect(doc.actions).toHaveLength(1);
  });
});

// ── WorkflowEscalation ────────────────────────────────────────────────────────
describe('WorkflowEscalation model', () => {
  const M = () => mongoose.model('WorkflowEscalation');
  let instanceId, escalatedToId;

  beforeEach(async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'WF', module: 'hr' });
    const inst = await mongoose.model('WorkflowInstance').create({ workflow: wf._id, title: 'T' });
    instanceId = inst._id;
    escalatedToId = new mongoose.Types.ObjectId();
  });

  it('auto-generates escalationCode ESC- prefix', async () => {
    const doc = await M().create({ instance: instanceId, escalatedTo: escalatedToId });
    expect(doc.escalationCode).toMatch(/^ESC-\d{4}-\d{5}$/);
  });

  it('defaults status to open', async () => {
    const doc = await M().create({ instance: instanceId, escalatedTo: escalatedToId });
    expect(doc.status).toBe('open');
  });

  it('defaults escalationLevel to 1', async () => {
    const doc = await M().create({ instance: instanceId, escalatedTo: escalatedToId });
    expect(doc.escalationLevel).toBe(1);
  });
});

// ── WorkflowSLA ───────────────────────────────────────────────────────────────
describe('WorkflowSLA model', () => {
  const M = () => mongoose.model('WorkflowSLA');

  it('auto-generates slaCode SLA- prefix', async () => {
    const doc = await M().create({ name: 'Standard 24h SLA', resolutionHours: 24 });
    expect(doc.slaCode).toMatch(/^SLA-\d{4}-\d{5}$/);
  });

  it('requires name (resolutionHours has default)', async () => {
    const doc = await M().create({ name: 'SLA-X' });
    expect(doc.resolutionHours).toBe(24);
    await expect(M().create({})).rejects.toThrow();
  });

  it('defaults workingHoursOnly to false', async () => {
    const doc = await M().create({ name: 'SLA', resolutionHours: 48 });
    expect(doc.workingHoursOnly).toBe(false);
  });

  it('defaults working days to Mon-Fri', async () => {
    const doc = await M().create({ name: 'SLA', resolutionHours: 24 });
    expect(doc.workingDays).toContain('Mon');
    expect(doc.workingDays).toContain('Fri');
    expect(doc.workingDays).toHaveLength(5);
  });
});

// ── WorkflowNotification ──────────────────────────────────────────────────────
describe('WorkflowNotification model', () => {
  const M = () => mongoose.model('WorkflowNotification');
  const recipientId = new mongoose.Types.ObjectId();

  it('auto-generates notifCode WFN- prefix', async () => {
    const doc = await M().create({
      recipient: recipientId,
      notificationType: 'assignment',
      subject: 'New Approval Request',
    });
    expect(doc.notifCode).toMatch(/^WFN-\d{4}-\d{5}$/);
  });

  it('defaults status to pending', async () => {
    const doc = await M().create({
      recipient: recipientId,
      notificationType: 'reminder',
      subject: 'Reminder',
    });
    expect(doc.status).toBe('pending');
  });

  it('defaults channel to in_app', async () => {
    const doc = await M().create({
      recipient: recipientId,
      notificationType: 'escalation',
      subject: 'Escalation',
    });
    expect(doc.channel).toBe('in_app');
  });
});

// ── WorkflowHistory ───────────────────────────────────────────────────────────
describe('WorkflowHistory model', () => {
  const M = () => mongoose.model('WorkflowHistory');
  let instanceId;

  beforeEach(async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'WF', module: 'hr' });
    const inst = await mongoose.model('WorkflowInstance').create({ workflow: wf._id, title: 'T' });
    instanceId = inst._id;
  });

  it('auto-generates historyCode WHT- prefix', async () => {
    const doc = await M().create({ instance: instanceId, action: 'instance_created' });
    expect(doc.historyCode).toMatch(/^WHT-\d{4}-\d{5}$/);
  });

  it('requires instance and action', async () => {
    await expect(M().create({ action: 'test' })).rejects.toThrow();
    await expect(M().create({ instance: instanceId })).rejects.toThrow();
  });

  it('defaults timestamp to now', async () => {
    const before = Date.now();
    const doc = await M().create({ instance: instanceId, action: 'test' });
    expect(doc.timestamp.getTime()).toBeGreaterThanOrEqual(before);
  });
});

// ── WorkflowComment ───────────────────────────────────────────────────────────
describe('WorkflowComment model', () => {
  const M = () => mongoose.model('WorkflowComment');
  let instanceId;
  const authorId = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'WF', module: 'hr' });
    const inst = await mongoose.model('WorkflowInstance').create({ workflow: wf._id, title: 'T' });
    instanceId = inst._id;
  });

  it('auto-generates commentCode WCM- prefix', async () => {
    const doc = await M().create({ instance: instanceId, author: authorId, comment: 'LGTM' });
    expect(doc.commentCode).toMatch(/^WCM-\d{4}-\d{5}$/);
  });

  it('requires instance, author, and comment', async () => {
    await expect(M().create({ author: authorId, comment: 'X' })).rejects.toThrow();
    await expect(M().create({ instance: instanceId, comment: 'X' })).rejects.toThrow();
    await expect(M().create({ instance: instanceId, author: authorId })).rejects.toThrow();
  });

  it('defaults isInternal to false', async () => {
    const doc = await M().create({ instance: instanceId, author: authorId, comment: 'Note' });
    expect(doc.isInternal).toBe(false);
  });
});

// ── WorkflowAttachment ────────────────────────────────────────────────────────
describe('WorkflowAttachment model', () => {
  const M = () => mongoose.model('WorkflowAttachment');
  let instanceId;

  beforeEach(async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'WF', module: 'procurement' });
    const inst = await mongoose.model('WorkflowInstance').create({ workflow: wf._id, title: 'T' });
    instanceId = inst._id;
  });

  it('auto-generates attachmentCode WAT- prefix', async () => {
    const doc = await M().create({ instance: instanceId, fileName: 'invoice.pdf', fileUrl: 'https://cdn.example.com/invoice.pdf' });
    expect(doc.attachmentCode).toMatch(/^WAT-\d{4}-\d{5}$/);
  });

  it('requires fileName and fileUrl', async () => {
    await expect(M().create({ instance: instanceId, fileName: 'f.pdf' })).rejects.toThrow();
    await expect(M().create({ instance: instanceId, fileUrl: 'http://x' })).rejects.toThrow();
  });
});

// ── WorkflowCondition ─────────────────────────────────────────────────────────
describe('WorkflowCondition model', () => {
  const M = () => mongoose.model('WorkflowCondition');

  it('auto-generates conditionCode WFC- prefix', async () => {
    const doc = await M().create({ name: 'Amount < 1000' });
    expect(doc.conditionCode).toMatch(/^WFC-\d{4}-\d{5}$/);
  });

  it('defaults isActive to true', async () => {
    const doc = await M().create({ name: 'Cond 1' });
    expect(doc.isActive).toBe(true);
  });

  it('requires name', async () => {
    await expect(M().create({})).rejects.toThrow();
  });
});

// ── WorkflowTrigger ───────────────────────────────────────────────────────────
describe('WorkflowTrigger model', () => {
  const M = () => mongoose.model('WorkflowTrigger');
  let workflowId;

  beforeEach(async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'WF', module: 'hr' });
    workflowId = wf._id;
  });

  it('auto-generates triggerCode WTG- prefix', async () => {
    const doc = await M().create({ name: 'Leave Submitted', workflow: workflowId, triggerType: 'event' });
    expect(doc.triggerCode).toMatch(/^WTG-\d{4}-\d{5}$/);
  });

  it('requires name, workflow, and triggerType', async () => {
    await expect(M().create({ workflow: workflowId, triggerType: 'event' })).rejects.toThrow();
    await expect(M().create({ name: 'T', triggerType: 'event' })).rejects.toThrow();
    await expect(M().create({ name: 'T', workflow: workflowId })).rejects.toThrow();
  });

  it('defaults fireCount to 0 and isActive to true', async () => {
    const doc = await M().create({ name: 'T', workflow: workflowId, triggerType: 'manual' });
    expect(doc.fireCount).toBe(0);
    expect(doc.isActive).toBe(true);
  });

  it('rejects invalid triggerType', async () => {
    await expect(M().create({ name: 'T', workflow: workflowId, triggerType: 'invalid' })).rejects.toThrow();
  });
});

// ── WorkflowTransition ────────────────────────────────────────────────────────
describe('WorkflowTransition model', () => {
  const M = () => mongoose.model('WorkflowTransition');
  let workflowId;

  beforeEach(async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'WF', module: 'hr' });
    workflowId = wf._id;
  });

  it('auto-generates transitionCode TRN- prefix', async () => {
    const doc = await M().create({ workflow: workflowId });
    expect(doc.transitionCode).toMatch(/^TRN-\d{4}-\d{5}$/);
  });

  it('requires workflow', async () => {
    await expect(M().create({})).rejects.toThrow();
  });

  it('defaults triggerType to on_approve', async () => {
    const doc = await M().create({ workflow: workflowId });
    expect(doc.triggerType).toBe('on_approve');
  });
});

// ── WorkflowAssignment ────────────────────────────────────────────────────────
describe('WorkflowAssignment model', () => {
  const M = () => mongoose.model('WorkflowAssignment');
  let instanceId;
  const assigneeId = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'WF', module: 'service' });
    const inst = await mongoose.model('WorkflowInstance').create({ workflow: wf._id, title: 'T' });
    instanceId = inst._id;
  });

  it('auto-generates assignmentCode ASN- prefix', async () => {
    const doc = await M().create({ instance: instanceId, assignee: assigneeId });
    expect(doc.assignmentCode).toMatch(/^ASN-\d{4}-\d{5}$/);
  });

  it('defaults status to pending and isActive to true', async () => {
    const doc = await M().create({ instance: instanceId, assignee: assigneeId });
    expect(doc.status).toBe('pending');
    expect(doc.isActive).toBe(true);
  });
});

// ── WorkflowAction ────────────────────────────────────────────────────────────
describe('WorkflowAction model', () => {
  const M = () => mongoose.model('WorkflowAction');
  let instanceId;

  beforeEach(async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'WF', module: 'finance' });
    const inst = await mongoose.model('WorkflowInstance').create({ workflow: wf._id, title: 'T' });
    instanceId = inst._id;
  });

  it('auto-generates actionCode WFA- prefix', async () => {
    const doc = await M().create({ instance: instanceId, actionType: 'approve' });
    expect(doc.actionCode).toMatch(/^WFA-\d{4}-\d{5}$/);
  });

  it('requires instance and actionType', async () => {
    await expect(M().create({ actionType: 'approve' })).rejects.toThrow();
    await expect(M().create({ instance: instanceId })).rejects.toThrow();
  });

  it('rejects invalid actionType', async () => {
    await expect(M().create({ instance: instanceId, actionType: 'dance' })).rejects.toThrow();
  });
});

// ── Cross-model integration ───────────────────────────────────────────────────
describe('Cross-model: Instance + Stages', () => {
  it('creates stages linked to instance', async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'Expense WF', module: 'finance' });
    const inst = await mongoose.model('WorkflowInstance').create({ workflow: wf._id, title: 'Expense Claim' });
    const stage = await mongoose.model('WorkflowStage').create({ instance: inst._id, name: 'Finance Review', order: 1 });
    const found = await mongoose.model('WorkflowStage').findOne({ instance: inst._id });
    expect(found).toBeTruthy();
    expect(found.stageCode).toMatch(/^STG-/);
  });
});

describe('Cross-model: Approval chain', () => {
  it('creates approval and links to instance + stage', async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'PO WF', module: 'procurement' });
    const inst = await mongoose.model('WorkflowInstance').create({ workflow: wf._id, title: 'PO Approval' });
    const stage = await mongoose.model('WorkflowStage').create({ instance: inst._id, name: 'Manager Approval', order: 1 });
    const approverId = new mongoose.Types.ObjectId();
    const approval = await mongoose.model('WorkflowApproval').create({
      instance: inst._id,
      stage: stage._id,
      approver: approverId,
    });
    expect(approval.approvalCode).toMatch(/^APR-/);
    expect(approval.status).toBe('pending');
  });
});

describe('Cross-model: Escalation links to instance', () => {
  it('creates escalation for overdue instance', async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'Leave WF', module: 'hr' });
    const inst = await mongoose.model('WorkflowInstance').create({ workflow: wf._id, title: 'Leave', status: 'in_progress' });
    const mgr = new mongoose.Types.ObjectId();
    const esc = await mongoose.model('WorkflowEscalation').create({
      instance: inst._id,
      escalatedTo: mgr,
      reason: 'overdue_sla',
    });
    expect(esc.escalationCode).toMatch(/^ESC-/);
    expect(esc.status).toBe('open');
    // Mark acknowledged
    esc.status = 'acknowledged';
    esc.acknowledgedAt = new Date();
    await esc.save();
    expect(esc.status).toBe('acknowledged');
  });
});

describe('Cross-model: History audit trail', () => {
  it('logs full lifecycle of an instance', async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'WF', module: 'projects' });
    const inst = await mongoose.model('WorkflowInstance').create({ workflow: wf._id, title: 'Project Gate' });
    const userId = new mongoose.Types.ObjectId();

    await mongoose.model('WorkflowHistory').create({ instance: inst._id, action: 'instance_created', performedBy: userId, toStatus: 'pending' });
    await mongoose.model('WorkflowHistory').create({ instance: inst._id, action: 'instance_started', performedBy: userId, fromStatus: 'pending', toStatus: 'in_progress' });
    await mongoose.model('WorkflowHistory').create({ instance: inst._id, action: 'approve', performedBy: userId, fromStatus: 'in_progress', toStatus: 'completed' });

    const logs = await mongoose.model('WorkflowHistory').find({ instance: inst._id }).sort({ timestamp: 1 });
    expect(logs).toHaveLength(3);
    expect(logs[0].action).toBe('instance_created');
    expect(logs[2].action).toBe('approve');
  });
});

describe('Cross-model: SLA definition', () => {
  it('creates SLA and links to workflow', async () => {
    const wf = await mongoose.model('Workflow').create({ name: 'Complaint WF', module: 'service' });
    const sla = await mongoose.model('WorkflowSLA').create({
      name: 'Complaint Resolution SLA',
      workflow: wf._id,
      resolutionHours: 48,
      warningHours: 8,
      escalateHours: 24,
    });
    expect(sla.slaCode).toMatch(/^SLA-/);
    const found = await mongoose.model('WorkflowSLA').findOne({ workflow: wf._id });
    expect(found).toBeTruthy();
    expect(found.resolutionHours).toBe(48);
  });
});
