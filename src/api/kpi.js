const express = require('express');
const router = express.Router();
const KPI = require('../models/kpi');
const { Member } = require('../models/member');
const { requireRole } = require('../middleware/requireRole');

// In-memory storage (replace with database in production)
const kpis = [];
const members = Member.createSeededMembers();

/**
 * POST /api/kpi - Create new KPI record
 */
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
      rollupData = calculateDailyRollup(filteredKPIs, memberTierTargets, parseInt(period));
    } else if (window === 'weekly') {
      rollupData = calculateWeeklyRollup(filteredKPIs, memberTierTargets);
    } else if (window === 'monthly') {
      rollupData = calculateMonthlyRollup(filteredKPIs, memberTierTargets);
    } else {
      return res.status(400).json({ error: 'Invalid window. Must be: daily, weekly, or monthly' });
    }

    const response = {
      member_id,
      member_name: member.name,
      tier: member.tier,
      window,
      period,
      tier_targets: memberTierTargets,
      rollup: rollupData,
      generated_at: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Calculate daily rollup with averages over the period
 */
function calculateDailyRollup(kpis, targets, days) {
  if (kpis.length === 0) {
    return {
      connects_per_day: { current: 0, target: targets.connects_per_day, status: 'RED' },
      follow_ups_per_day: { current: 0, target: targets.follow_ups_per_day, status: 'RED' },
      first_order_14d: { current: false, target: true, status: 'RED' },
      summary: { days_tracked: 0, total_days: days }
    };
  }

  // Calculate averages
  const totalConnects = kpis.reduce((sum, k) => sum + k.connectsPerDay, 0);
  const totalFollowUps = kpis.reduce((sum, k) => sum + k.followUpsPerDay, 0);
  const hasFirstOrder = kpis.some(k => k.firstOrderIn14Days);

  const avgConnects = totalConnects / days;
  const avgFollowUps = totalFollowUps / days;

  return {
    connects_per_day: {
      current: Math.round(avgConnects * 100) / 100,
      target: targets.connects_per_day,
      status: KPI.calculateStatus(avgConnects, targets.connects_per_day)
    },
    follow_ups_per_day: {
      current: Math.round(avgFollowUps * 100) / 100,
      target: targets.follow_ups_per_day,
      status: KPI.calculateStatus(avgFollowUps, targets.follow_ups_per_day)
    },
    first_order_14d: {
      current: hasFirstOrder,
      target: true,
      status: KPI.calculateStatus(hasFirstOrder, true, 'boolean')
    },
    summary: {
      days_tracked: kpis.length,
      total_days: days
    }
  };
}

/**
 * Calculate weekly rollup
 */
function calculateWeeklyRollup(kpis, targets) {
  // Group by ISO week
  const weekGroups = {};

  kpis.forEach(kpi => {
    const date = new Date(kpi.date);
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    const key = `${year}-W${week.toString().padStart(2, '0')}`;

    if (!weekGroups[key]) {
      weekGroups[key] = [];
    }
    weekGroups[key].push(kpi);
  });

  const weeks = Object.keys(weekGroups).sort().map(weekKey => {
    const weekKPIs = weekGroups[weekKey];
    const totalConnects = weekKPIs.reduce((sum, k) => sum + k.connectsPerDay, 0);
    const totalFollowUps = weekKPIs.reduce((sum, k) => sum + k.followUpsPerDay, 0);
    const hasFirstOrder = weekKPIs.some(k => k.firstOrderIn14Days);

    return {
      week: weekKey,
      connects_per_day: {
        current: Math.round((totalConnects / 7) * 100) / 100,
        target: targets.connects_per_day,
        status: KPI.calculateStatus(totalConnects / 7, targets.connects_per_day)
      },
      follow_ups_per_day: {
        current: Math.round((totalFollowUps / 7) * 100) / 100,
        target: targets.follow_ups_per_day,
        status: KPI.calculateStatus(totalFollowUps / 7, targets.follow_ups_per_day)
      },
      first_order_14d: {
        current: hasFirstOrder,
        target: true,
        status: KPI.calculateStatus(hasFirstOrder, true, 'boolean')
      }
    };
  });

  return { weeks, summary: { weeks_tracked: weeks.length } };
}

/**
 * Calculate monthly rollup
 */
function calculateMonthlyRollup(kpis, targets) {
  // Group by year-month
  const monthGroups = {};

  kpis.forEach(kpi => {
    const date = new Date(kpi.date);
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    if (!monthGroups[key]) {
      monthGroups[key] = [];
    }
    monthGroups[key].push(kpi);
  });

  const months = Object.keys(monthGroups).sort().map(monthKey => {
    const monthKPIs = monthGroups[monthKey];
    const daysInMonth = monthKPIs.length;
    const totalConnects = monthKPIs.reduce((sum, k) => sum + k.connectsPerDay, 0);
    const totalFollowUps = monthKPIs.reduce((sum, k) => sum + k.followUpsPerDay, 0);
    const hasFirstOrder = monthKPIs.some(k => k.firstOrderIn14Days);

    return {
      month: monthKey,
      connects_per_day: {
        current: Math.round((totalConnects / daysInMonth) * 100) / 100,
        target: targets.connects_per_day,
        status: KPI.calculateStatus(totalConnects / daysInMonth, targets.connects_per_day)
      },
      follow_ups_per_day: {
        current: Math.round((totalFollowUps / daysInMonth) * 100) / 100,
        target: targets.follow_ups_per_day,
        status: KPI.calculateStatus(totalFollowUps / daysInMonth, targets.follow_ups_per_day)
      },
      first_order_14d: {
        current: hasFirstOrder,
        target: true,
        status: KPI.calculateStatus(hasFirstOrder, true, 'boolean')
      }
    };
  });

  return { months, summary: { months_tracked: months.length } };
}

/**
 * Get ISO week number for a date
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * GET /api/kpi/leaderboard - Get member rankings
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

      // Simple scoring: GREEN=3, YELLOW=2, RED=1
      const score = (statusBreakdown.GREEN * 3) + (statusBreakdown.YELLOW * 2) + (statusBreakdown.RED * 1);

      return {
        member_id: member.id,
        member_name: member.name,
        tier: member.tier,
        score,
        status_breakdown: statusBreakdown
      };
    });

    rankings.sort((a, b) => b.score - a.score);

    res.json({
      window,
      rankings: rankings.slice(0, parseInt(limit)),
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
