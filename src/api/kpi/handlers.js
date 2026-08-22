/**
 * KPI API — route handlers
 */
const KPI = require('../../models/kpi');
const { Member } = require('../../models/member');
const { requireRole } = require('../../middleware/requireRole');
const { calculateDailyRollup, calculateWeeklyRollup, calculateMonthlyRollup, getWeekNumber } = require('./rollups');

// In-memory storage (replace with database in production)
const kpis = [];
const members = Member.createSeededMembers ? Member.createSeededMembers() : [];

/**
 * POST /api/kpi - Create new KPI record
 */
function registerKpiRoutes(router) {
  router.post('/', requireRole(['Admin', 'Core Leader', 'PSN Leader']), (req, res) => {
    try {
      const kpi = new KPI(req.body);
      kpis.push(kpi);
      res.status(201).json(kpi.toJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  /**
   * GET /api/kpi/leaderboard - Get member rankings
   * (Must be defined before /:member_id to avoid route shadowing)
   */
  router.get('/leaderboard', (req, res) => {
    try {
      const { window = 'daily', limit = 10 } = req.query;

      // Calculate rankings for all members
      const rankings = members.map(member => {
        const memberKPIs = kpis.filter(k => k.memberId === member.id);
        const tierTargets = KPI.getTierTargets();
        const targets = tierTargets[member.tier] || tierTargets[1];

        if (memberKPIs.length === 0) {
          return {
            member_id: member.id,
            member_name: member.name,
            tier: member.tier,
            score: 0,
            status_breakdown: { GREEN: 0, YELLOW: 0, RED: 3 }
          };
        }

        const recent = memberKPIs.slice(-7); // Last 7 days
        const avgConnects = recent.reduce((sum, k) => sum + k.connectsPerDay, 0) / recent.length;
        const avgFollowUps = recent.reduce((sum, k) => sum + k.followUpsPerDay, 0) / recent.length;
        const hasFirstOrder = recent.some(k => k.firstOrderIn14Days);

        const statuses = [
          KPI.calculateStatus(avgConnects, targets.connects_per_day),
          KPI.calculateStatus(avgFollowUps, targets.follow_ups_per_day),
          KPI.calculateStatus(hasFirstOrder, true, 'boolean')
        ];

        const statusBreakdown = statuses.reduce((acc, status) => {
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, { GREEN: 0, YELLOW: 0, RED: 0 });

        // Simple score: GREEN=3, YELLOW=1, RED=0
        const score = statusBreakdown.GREEN * 3 + statusBreakdown.YELLOW;

        return {
          member_id: member.id,
          member_name: member.name,
          tier: member.tier,
          score,
          avgConnects: Math.round(avgConnects * 10) / 10,
          avgFollowUps: Math.round(avgFollowUps * 10) / 10,
          status_breakdown: statusBreakdown
        };
      });

      // Sort by score descending
      rankings.sort((a, b) => b.score - a.score);

      const limitNum = parseInt(limit) || 10;
      res.json({
        window,
        rankings: rankings.slice(0, limitNum),
        total: rankings.length
      });
    } catch (error) {
      console.error('Error calculating leaderboard:', error);
      res.status(500).json({ error: 'Failed to calculate leaderboard' });
    }
  });

  /**
   * GET /api/kpi/:member_id - Get KPI rollup for specific member
   * Supports daily/weekly/monthly window and tier target comparison
   */
  router.get('/:member_id', (req, res) => {
    try {
      const { member_id } = req.params;
      const { window = 'daily', period = 30 } = req.query;

      // Find member to get tier
      const member = members.find(m => m.id === member_id);
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      // Get tier targets
      const tierTargets = KPI.getTierTargets();
      const memberTierTargets = tierTargets[member.tier] || tierTargets[1];

      // Filter KPIs for this member
      const memberKPIs = kpis.filter(k => k.memberId === member_id);

      // Calculate date range based on window and period
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - parseInt(period));
      const startDateStr = startDate.toISOString().split('T')[0];

      // Filter by date range
      const filteredKPIs = memberKPIs.filter(k => k.date >= startDateStr);

      // Rollup calculations based on window
      let rollupData;

      if (window === 'daily') {
        rollupData = calculateDailyRollup(filteredKPIs, memberTierTargets);
      } else if (window === 'weekly') {
        rollupData = calculateWeeklyRollup(filteredKPIs, memberTierTargets);
      } else if (window === 'monthly') {
        rollupData = calculateMonthlyRollup(filteredKPIs, memberTierTargets);
      } else {
        return res.status(400).json({ error: 'Invalid window. Use daily, weekly, or monthly' });
      }

      res.json({
        member_id,
        member_name: member.name,
        tier: member.tier,
        window,
        period: parseInt(period),
        rollup: rollupData,
        tier_targets: memberTierTargets
      });
    } catch (error) {
      console.error('Error calculating KPI:', error);
      res.status(500).json({ error: 'Failed to calculate KPI' });
    }
  });

  return router;
}

module.exports = { registerKpiRoutes };