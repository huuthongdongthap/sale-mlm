/**
 * Funnel Analytics API
 *
 * Endpoints:
 *   GET    /api/analytics/funnel        — 5-tier counts + conversion rates + revenue
 *   GET    /api/analytics/funnel/stats  — avg time in stage, drop-off, top performers
 *   POST   /api/analytics/funnel/export — CSV export of visible funnel data
 */

const express = require('express');
const router = express.Router();
const { requireAuth, requirePSNLeader } = require('../middleware/requireRole');
const { Lead, FUNNEL_LEVELS, TIER_LABELS, TIER_COLORS } = require('../models/lead');
const { ROLE_HIERARCHY, normalizeRole } = require('../middleware/requireRole');
const { getStore: getMembers } = require('../models/member');

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const allLeads = () => require('../models/lead').getStore();

function visibleLeadScope(req) {
  const role = normalizeRole(req.user?.role);
  const userId = req.user?.id;
  if (!role || !userId) return [];
  const level = ROLE_HIERARCHY[role] || 1;
  if (level >= 3) return allLeads(); // Core / Admin
  if (role === 'PSN Leader') return allLeads(); // full scope (downline deferred)
  return allLeads().filter(l => l.assignedCtvId === userId);
}

function daysBetween(a, b) {
  if (!a || !b) return null;
  return Math.max(0, (new Date(b) - new Date(a)) / 86_400_000);
}

/* ------------------------------------------------------------------ */
/*  GET /api/analytics/funnel                                          */
/* ------------------------------------------------------------------ */

router.get('/', requireAuth, async (req, res) => {
  const scope = visibleLeadScope(req);

  // Count by tier
  const counts = FUNNEL_LEVELS.map(level => {
    const items = scope.filter(l => l.funnelLevel === level);
    return { tier: level, name: TIER_LABELS[level], count: items.length };
  });

  // Conversion rates (adjacent tiers)
  const rates = [];
  for (let i = 0; i < FUNNEL_LEVELS.length - 1; i++) {
    const fromCount = counts[i].count;
    const toCount = counts[i + 1].count;
    rates.push({
      fromTier: i,
      toTier: i + 1,
      conversionRate: fromCount > 0 ? parseFloat(((toCount / fromCount) * 100).toFixed(1)) : 0,
      fromCount,
      toCount,
    });
  }
  const totalLeads = counts.reduce((s, c) => s + c.count, 0);

  // Revenue: sum order totals per tier
  const allOrders = await require('../models/order').allOrders();
  const revenue = FUNNEL_LEVELS.map(level => {
    const tierLabel = TIER_LABELS[level];
    // Find orders matching this tier (productTier matches funnel level)
    const matches = allOrders.filter(o => o.productTier === level && o.paymentStatus === 'paid');
    const orderCount = matches.length;
    const revenueVND = matches.reduce((sum, o) => sum + o.totalVND, 0);
    return { tier: level, tierName: tierLabel, orderCount, revenue: revenueVND };
  });

  res.json({ counts, rates, revenue, totalLeads });
});

/* ------------------------------------------------------------------ */
/*  GET /api/analytics/funnel/stats                                    */
/* ------------------------------------------------------------------ */

router.get('/stats', requireAuth, (req, res) => {
  const scope = visibleLeadScope(req);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30); // default 30-day window

  // avg time in stage (days)
  const avgTimeInStage = FUNNEL_LEVELS.map(level => {
    const leads = scope.filter(l => l.funnelLevel === level);
    const times = leads
      .map(l => daysBetween(l.lastContactedAt, l.updatedAt))
      .filter(v => v !== null && !Number.isNaN(v));
    const avg = times.length > 0 ? parseFloat((times.reduce((s, v) => s + v, 0) / times.length).toFixed(1)) : 0;
    return { tier: level, name: TIER_LABELS[level], avgDays: avg };
  });

  // drop-off = leads with status lost OR archived in last 30d
  const dropoffRates = FUNNEL_LEVELS.map(level => {
    const totalForTier = scope.filter(l => l.funnelLevel === level).length;
    if (totalForTier === 0) return { tier: level, name: TIER_LABELS[level], dropoffPct: 0 };
    const dropoffs = scope.filter(l => l.funnelLevel === level && (l.status === 'lost' || l.status === 'archived')).length;
    return { tier: level, name: TIER_LABELS[level], dropoffPct: parseFloat(((dropoffs / totalForTier) * 100).toFixed(1)) };
  });

  // top performers: CTVs with most converted leads
  const ctvStats = {};
  scope
    .filter(l => l.assignedCtvId && l.status === 'converted')
    .forEach(l => {
      ctvStats[l.assignedCtvId] = (ctvStats[l.assignedCtvId] || 0) + 1;
    });

  const topPerformers = Object.entries(ctvStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([ctvId, convertedCount]) => {
      const member = members.find(m => m.id === ctvId);
      return {
        ctvId,
        name: member?.name || 'N/A',
        convertedCount,
      };
    });

  res.json({ avgTimeInStage, dropoffRates, topPerformers });
});

/* ------------------------------------------------------------------ */
/*  POST /api/analytics/funnel/export  —  CSV                        */
/* ------------------------------------------------------------------ */

router.post('/export', requirePSNLeader, (req, res) => {
  const scope = visibleLeadScope(req);
  const isAdmin = (ROLE_HIERARCHY[req.user?.role] || 0) >= 3;

  const header = ['ID', 'Name', 'Phone', 'Email', 'Tier', 'Status', 'Assigned CTV', 'Source', 'Created At'];
  const rows = scope.map(l => {
    const plain = isAdmin ? l.toJSON_Admin() : l.toJSON();
    return [
      l.id,
      plain.name || '',
      plain.phone || '',
      plain.email || '',
      TIER_LABELS[l.funnelLevel],
      l.status,
      l.assignedCtvId || '',
      l.source,
      l.createdAt,
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  const csv = [header.join(','), ...rows].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="funnel-export.csv"');
  res.send(csv);
});

module.exports = router;
