/**
 * Leads API — Funnel OS backend
 *
 * Endpoints:
 *   GET    /api/leads
 *   GET    /api/leads/:id
 *   POST   /api/leads
 *   PATCH  /api/leads/:id
 *   DELETE /api/leads/:id
 *   GET    /api/leads/:id/journey
 *   POST   /api/leads/:id/assign
 *   POST   /api/leads/:id/transition
 *
 * RBAC:
 *   - Auth: any authenticated user can view
 *   - PSN Leader+: can create/post/update/assign/transition
 *   - Admin only: hard delete (archived flag fallback for non-admin)
 */

const express = require('express');
const router = express.Router();
const { requireAuth, requirePSNLeader, requireAdmin } = require('../middleware/requireRole');
const { Lead, STATUSES, FUNNEL_LEVELS, TIER_LABELS, TIER_COLORS } = require('../models/lead');
const { ROLE_HIERARCHY } = require('../middleware/requireRole');

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const { getStore } = require('../models/lead');
const { normalizeRole } = require('../middleware/requireRole');
function allLeads() { return getStore(); }

function visibleLeadScope(req) {
  const role = normalizeRole(req.user?.role);
  const userId = req.user?.id;

  if (!role || !userId) return []; // unauthenticated edge case

  const level = ROLE_HIERARCHY[role] || 1;
  if (level >= 3) return allLeads(); // Core / Admin → all

  if (role === 'PSN Leader') {
    // PSN Leader: all leads (downline scoping deferred to referral tree query)
    return allLeads();
  }

  // Member: own leads only
  return allLeads().filter(l => l.assignedCtvId === userId);
}

function pluck(lead, isAdmin) {
  return isAdmin ? lead.toJSON_Admin() : lead.toJSON();
}

function coerceId(raw) {
  // displayId (1-based) or UUID
  if (typeof raw === 'string' && raw.match(/^\d+$/)) {
    const byDisplay = allLeads().find(l => String(l.displayId) === raw);
    if (byDisplay) return byDisplay.id;
  }
  return raw;
}

/* ------------------------------------------------------------------ */
/*  GET /api/leads  —  paginated list                                  */
/* ------------------------------------------------------------------ */

router.get('/', requireAuth, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '50', 10)));
  const statusFilter = req.query.status;
  const levelFilter = req.query.funnel_level;
  const ctvFilter = req.query.assigned_ctv_id;

  let scope = visibleLeadScope(req);

  if (statusFilter && STATUSES.includes(statusFilter)) {
    scope = scope.filter(l => l.status === statusFilter);
  }
  if (levelFilter !== undefined && FUNNEL_LEVELS.includes(parseInt(levelFilter, 10))) {
    scope = scope.filter(l => l.funnelLevel === parseInt(levelFilter, 10));
  }
  if (ctvFilter) {
    scope = scope.filter(l => l.assignedCtvId === ctvFilter || (!l.assignedCtvId && ctvFilter === 'null'));
  }

  const total = scope.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const isAdmin = (ROLE_HIERARCHY[req.user?.role] || 0) >= 3;

  res.json({
    leads: scope.slice(start, start + limit).map(l => pluck(l, isAdmin)),
    total,
    page,
    totalPages,
    limit,
  });
});

/* ------------------------------------------------------------------ */
/*  GET /api/leads/:id  —  single lead                                 */
/* ------------------------------------------------------------------ */

router.get('/:id', requireAuth, (req, res) => {
  const leadId = coerceId(req.params.id);
  const lead = allLeads().find(l => l.id === leadId);

  if (!lead) return res.status(404).json({ error: 'Lead not found', code: 'LEAD_NOT_FOUND' });

  // Non-admin: run scope check
  const scope = visibleLeadScope(req);
  if (!scope.find(l => l.id === lead.id)) {
    return res.status(403).json({ error: 'No access to this lead', code: 'SCOPE_DENIED' });
  }

  const isAdmin = (ROLE_HIERARCHY[req.user?.role] || 0) >= 3;
  res.json(pluck(lead, isAdmin));
});

/* ------------------------------------------------------------------ */
/*  POST /api/leads  —  create new lead                                */
/* ------------------------------------------------------------------ */

router.post('/', requirePSNLeader, (req, res) => {
  const { name, phone, email, source, funnelLevel, notes, quizAnswers, metadata, promotedFromId } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required', code: 'MISSING_NAME' });
  }

  const lead = new Lead({
    name,
    phone,
    email,
    source: source || 'organic',
    funnelLevel: typeof funnelLevel === 'number' ? funnelLevel : 0,
    notes,
    quizAnswers,
    metadata,
    promotedFromId,
  });
  lead.displayId = allLeads().length ? Math.max(...allLeads().map(l => l.displayId || 0)) + 1 : 1;

  allLeads().push(lead);

  res.status(201).json(pluck(lead, (ROLE_HIERARCHY[req.user?.role] || 0) >= 3));
});

/* ------------------------------------------------------------------ */
/*  PATCH /api/leads/:id  —  update lead                               */
/* ------------------------------------------------------------------ */

router.patch('/:id', requirePSNLeader, (req, res) => {
  const leadId = coerceId(req.params.id);
  const lead = allLeads().find(l => l.id === leadId);

  if (!lead) return res.status(404).json({ error: 'Lead not found', code: 'LEAD_NOT_FOUND' });

  const scope = visibleLeadScope(req);
  if (!scope.find(l => l.id === lead.id)) {
    return res.status(403).json({ error: 'No access to this lead', code: 'SCOPE_DENIED' });
  }

  const allowed = ['name', 'phone', 'email', 'status', 'funnelLevel', 'source', 'notes', 'quizAnswers', 'metadata', 'assignedCtvId', 'promotedFromId'];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      if (['name', 'phone', 'email', 'notes'].includes(key)) {
        const setter = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
        lead[setter](req.body[key]);
      } else if (key === 'funnelLevel') {
        if (!FUNNEL_LEVELS.includes(req.body[key])) return res.status(400).json({ error: 'Invalid funnelLevel', code: 'INVALID_TIER' });
        lead.funnelLevel = req.body[key];
      } else if (key === 'status') {
        if (!STATUSES.includes(req.body[key])) return res.status(400).json({ error: 'Invalid status', code: 'INVALID_STATUS' });
        lead.status = req.body[key];
        lead.updatedAt = new Date().toISOString();
      } else if (key === 'assignedCtvId' || key === 'promotedFromId') {
        lead[key] = req.body[key];
        lead.updatedAt = new Date().toISOString();
      } else {
        lead[key] = req.body[key];
      }
    }
  }

  lead.updatedAt = new Date().toISOString();
  const isAdmin = (ROLE_HIERARCHY[req.user?.role] || 0) >= 3;
  res.json(pluck(lead, isAdmin));
});

/* ------------------------------------------------------------------ */
/*  DELETE /api/leads/:id  —  archive (or hard delete for admin)     */
/* ------------------------------------------------------------------ */

router.delete('/:id', requireAuth, (req, res) => {
  const leadId = coerceId(req.params.id);
  const idx = allLeads().findIndex(l => l.id === leadId);

  if (idx === -1) return res.status(404).json({ error: 'Lead not found', code: 'LEAD_NOT_FOUND' });

  const scope = visibleLeadScope(req);
  if (!scope.find(l => l.id === leadId)) {
    return res.status(403).json({ error: 'No access to this lead', code: 'SCOPE_DENIED' });
  }

  const isHardDelete = (ROLE_HIERARCHY[req.user?.role] || 0) >= 3;

  if (isHardDelete) {
    // Hard delete — Admin only
    allLeads().splice(idx, 1);
    return res.json({ ok: true, action: 'hard_delete' });
  }

  // Soft archive — any authenticated role
  allLeads()[idx].status = 'archived';
  allLeads()[idx].archivedAt = new Date().toISOString();
  allLeads()[idx].updatedAt = new Date().toISOString();
  res.json({ ok: true, action: 'archived' });
});

/* ------------------------------------------------------------------ */
/*  GET /api/leads/:id/journey  —  stage transition history          */
/* ------------------------------------------------------------------ */

router.get('/:id/journey', requireAuth, (req, res) => {
  const leadId = coerceId(req.params.id);
  const lead = allLeads().find(l => l.id === leadId);

  if (!lead) return res.status(404).json({ error: 'Lead not found', code: 'LEAD_NOT_FOUND' });

  const scope = visibleLeadScope(req);
  if (!scope.find(l => l.id === lead.id)) {
    return res.status(403).json({ error: 'No access to this lead', code: 'SCOPE_DENIED' });
  }

  const transitions = lead.metadata?.transitions || [];
  const events = [
    {
      event: 'lead_created',
      at: lead.createdAt,
      actorId: 'system',
      fromLabel: null,
      toLabel: TIER_LABELS[lead.funnelLevel],
    },
    ...transitions.map(t => ({
      event: t.event,
      at: t.at,
      actorId: t.actorId,
      fromLabel: t.fromLabel,
      toLabel: t.toLabel,
    })),
  ];

  res.json({ events });
});

/* ------------------------------------------------------------------ */
/*  POST /api/leads/:id/assign  —  assign CTV                         */
/* ------------------------------------------------------------------ */

router.post('/:id/assign', requirePSNLeader, (req, res) => {
  const leadId = coerceId(req.params.id);
  const { ctvId } = req.body;

  if (!ctvId) {
    return res.status(400).json({ error: 'ctvId is required', code: 'MISSING_CTV_ID' });
  }

  const lead = allLeads().find(l => l.id === leadId);
  if (!lead) return res.status(404).json({ error: 'Lead not found', code: 'LEAD_NOT_FOUND' });

  const scope = visibleLeadScope(req);
  if (!scope.find(l => l.id === lead.id)) {
    return res.status(403).json({ error: 'No access to this lead', code: 'SCOPE_DENIED' });
  }

  lead.assignedCtvId = ctvId;
  lead.updatedAt = new Date().toISOString();
  lead.lastContactedAt = new Date().toISOString();

  const isAdmin = (ROLE_HIERARCHY[req.user?.role] || 0) >= 3;
  res.json(pluck(lead, isAdmin));
});

/* ------------------------------------------------------------------ */
/*  POST /api/leads/:id/transition  —  move funnel stage             */
/* ------------------------------------------------------------------ */

router.post('/:id/transition', requirePSNLeader, (req, res) => {
  const leadId = coerceId(req.params.id);
  const { toTier } = req.body;

  if (!FUNNEL_LEVELS.includes(parseInt(toTier, 10))) {
    return res.status(400).json({ error: 'Invalid toTier. Must be 0-4.', code: 'INVALID_TARGET_TIER' });
  }

  const lead = allLeads().find(l => l.id === leadId);
  if (!lead) return res.status(404).json({ error: 'Lead not found', code: 'LEAD_NOT_FOUND' });

  const scope = visibleLeadScope(req);
  if (!scope.find(l => l.id === lead.id)) {
    return res.status(403).json({ error: 'No access to this lead', code: 'SCOPE_DENIED' });
  }

  try {
    lead.applyTransition(parseInt(toTier, 10), req.user.id);
  } catch (err) {
    return res.status(400).json({ error: err.message, code: 'TRANSITION_REJECTED' });
  }

  const isAdmin = (ROLE_HIERARCHY[req.user?.role] || 0) >= 3;
  res.json({
    ok: true,
    lead: pluck(lead, isAdmin),
    transition: lead.metadata.transitions[lead.metadata.transitions.length - 1],
  });
});

/* ------------------------------------------------------------------ */
/*  POST /api/leads/:id/note  —  append a note                        */
/* ------------------------------------------------------------------ */

router.post('/:id/note', requirePSNLeader, (req, res) => {
  const leadId = coerceId(req.params.id);
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'text is required', code: 'MISSING_NOTE' });
  }

  const lead = allLeads().find(l => l.id === leadId);
  if (!lead) return res.status(404).json({ error: 'Lead not found', code: 'LEAD_NOT_FOUND' });

  const scope = visibleLeadScope(req);
  if (!scope.find(l => l.id === lead.id)) {
    return res.status(403).json({ error: 'No access to this lead', code: 'SCOPE_DENIED' });
  }

  const ts = new Date().toISOString();
  if (!lead.metadata.notes) lead.metadata.notes = [];
  lead.metadata.notes.push({ text, by: req.user.id, at: ts });
  lead.updatedAt = ts;

  res.json({ ok: true, noteCount: lead.metadata.notes.length });
});

module.exports = router;
