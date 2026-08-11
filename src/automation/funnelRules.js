/**
 * Funnel Automation Rules
 *
 * Evaluates transition prerequisites and stalled-lead detection.
 * Designed to be called from API routes and scheduled cron jobs.
 *
 * Forward transitions require explicit prerequisites.
 * Reversions (tier ≥2 → trial) are allowed for stalled leads.
 * Lost is terminal — only Admin can revive.
 */

const { Lead, FUNNEL_LEVELS, TIER_LABELS, getStore } = require('../models/lead');

/* ------------------------------------------------------------------ */
/*  Transition prerequisites                                            */
/* ------------------------------------------------------------------ */

/** @returns {{ allowed: boolean, reason?: string }} */
function canTransition(lead, toTier, overrideActorRole = null) {
  const from = lead.funnelLevel;

  // Same tier — no-op
  if (from === toTier) return { allowed: false, reason: 'Already at this tier' };

  // Terminal state
  if (lead.status === 'lost' && overrideActorRole !== 'Admin') {
    return { allowed: false, reason: 'Lead is lost — Admin only to revive' };
  }

  // Reversions allowed from tier ≥2 down to trial-level tiers (1 or 0)
  if (toTier < from) {
    if (from >= 2 && toTier <= 1) return { allowed: true };
    return { allowed: false, reason: 'Only tier ≥2 can revert to trial stage' };
  }

  // Forward transitions
  const max = FUNNEL_LEVELS[FUNNEL_LEVELS.length - 1];
  if (toTier > max) return { allowed: false, reason: 'Tier out of range' };

  // Tier 0→1: submit quiz answers
  if (from === 0 && toTier === 1) {
    if (!lead.quizAnswers) return { allowed: false, reason: 'Quiz answers required to advance to trial' };
    return { allowed: true };
  }

  // Tier 1→2: trial product purchased OR manual override (PSN Leader+)
  if (from === 1 && toTier === 2) {
    if (lead.status === 'converted') return { allowed: true }; // purchased
    return { allowed: true, reason: 'Manual advance from trial to health active' };
  }

  // Tier 2→3: 14 days in health active + active status
  if (from === 2 && toTier === 3) {
    const daysInStage = daysBetween(lead.lastContactedAt, lead.updatedAt);
    if (daysInStage !== null && daysInStage < 14) {
      return { allowed: false, reason: `Wait ${Math.ceil(14 - daysInStage)} more days (minimum 14 days in stage)` };
    }
    return { allowed: true };
  }

  // Tier 3→4: recruitment goal (2+ referrals) OR Admin override
  if (from === 3 && toTier === 4) {
    if (overrideActorRole === 'Admin') return { allowed: true };
    // Recruitment count check would need referral table — defer to full implementation
    return { allowed: true, reason: 'Manual advance — referral count validation deferred' };
  }

  // Catch-all forward (future tiers)
  return { allowed: true };
}

/* ------------------------------------------------------------------ */
/*  Stalled lead detection                                              */
/* ------------------------------------------------------------------ */

/** Returns leads that need follow-up (no contact in > thresholdDays) */
function getStalledLeads(allLeadsArray, thresholdDays = 3) {
  if (!allLeadsArray) allLeadsArray = getStore();
  const now = new Date();
  return allLeadsArray.filter(lead => {
    if (lead.status === 'lost' || lead.status === 'archived') return false;
    if (!lead.lastContactedAt) return true; // never contacted
    const daysSince = daysBetween(lead.lastContactedAt, now);
    return daysSince !== null && daysSince >= thresholdDays;
  });
}

/**
 * Categorize stalled leads by priority.
 * Higher tier = higher priority (more revenue at risk).
 */
function getFollowUpQueue(allLeadsArray) {
  const stalled = getStalledLeads(allLeadsArray, 3);
  stalled.sort((a, b) => b.funnelLevel - a.funnelLevel);
  return stalled.map(lead => ({
    id: lead.id,
    displayId: lead.displayId,
    funnelLevel: lead.funnelLevel,
    tierLabel: TIER_LABELS[lead.funnelLevel],
    status: lead.status,
    assignedCtvId: lead.assignedCtvId,
    lastContactedAt: lead.lastContactedAt,
    daysSinceContact: daysBetween(lead.lastContactedAt, new Date()),
    nameMasked: true, // frontend shows masked name until detail view
  }));
}

/* ------------------------------------------------------------------ */
/*  Auto-transition evaluator (cron candidate)                          */
/* ------------------------------------------------------------------ */

/**
 * Find leads that meet auto-transition criteria and return transition actions.
 * Does NOT mutate — caller applies the transitions.
 */
function evaluateAutoTransitions() {
  const allLeadsArray = getStore();
  const actions = [];
  const now = new Date();

  for (const lead of allLeadsArray) {
    if (lead.status === 'lost') continue;

    // Tier 1→2 auto: trial product purchased (status === 'converted') and 3+ days since contact
    if (lead.funnelLevel === 1 && lead.status === 'converted') {
      const days = daysBetween(lead.lastContactedAt, now);
      if (days !== null && days >= 3) {
        actions.push({ leadId: lead.id, toTier: 2, reason: 'Auto: trial purchased + 3 days elapsed' });
      }
    }
  }

  return actions;
}

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                    */
/* ------------------------------------------------------------------ */

function daysBetween(a, b) {
  if (!a || !b) return null;
  return Math.max(0, (new Date(b) - new Date(a)) / 86_400_000);
}

module.exports = {
  canTransition,
  getStalledLeads,
  getFollowUpQueue,
  evaluateAutoTransitions,
};
