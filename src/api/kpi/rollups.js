/**
 * KPI API — rollup helpers
 */
const KPI = require('../../models/kpi');

function calculateDailyRollup(kpis, targets) {
  if (kpis.length === 0) {
    return { avgConnects: 0, avgFollowUps: 0, firstOrderRate: 0, overallStatus: 'RED' };
  }

  const avgConnects = kpis.reduce((sum, k) => sum + k.connectsPerDay, 0) / kpis.length;
  const avgFollowUps = kpis.reduce((sum, k) => sum + k.followUpsPerDay, 0) / kpis.length;
  const firstOrderRate = kpis.filter(k => k.firstOrderIn14Days).length / kpis.length;

  const statuses = [
    KPI.calculateStatus(avgConnects, targets.connects_per_day),
    KPI.calculateStatus(avgFollowUps, targets.follow_ups_per_day),
    KPI.calculateStatus(firstOrderRate, 0.5)
  ];

  const overallStatus = statuses.includes('RED') ? 'RED' :
    statuses.includes('YELLOW') ? 'YELLOW' : 'GREEN';

  return { avgConnects, avgFollowUps, firstOrderRate, overallStatus, statuses };
}

function calculateWeeklyRollup(kpis, targets) {
  if (kpis.length === 0) {
    return { avgConnects: 0, avgFollowUps: 0, firstOrderRate: 0, overallStatus: 'RED', weeks: [] };
  }

  // Group by ISO week
  const weekMap = new Map();
  kpis.forEach(k => {
    const weekKey = getWeekNumber(new Date(k.date));
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, []);
    weekMap.get(weekKey).push(k);
  });

  const weeks = Array.from(weekMap.entries()).map(([week, weekKpis]) => {
    const avgConnects = weekKpis.reduce((sum, k) => sum + k.connectsPerDay, 0) / weekKpis.length;
    const avgFollowUps = weekKpis.reduce((sum, k) => sum + k.followUpsPerDay, 0) / weekKpis.length;
    return { week, avgConnects, avgFollowUps, days: weekKpis.length };
  });

  const avgConnects = kpis.reduce((sum, k) => sum + k.connectsPerDay, 0) / kpis.length;
  const avgFollowUps = kpis.reduce((sum, k) => sum + k.followUpsPerDay, 0) / kpis.length;
  const firstOrderRate = kpis.filter(k => k.firstOrderIn14Days).length / kpis.length;

  return {
    avgConnects,
    avgFollowUps,
    firstOrderRate,
    overallStatus: avgConnects >= targets.connects_per_day ? 'GREEN' : 'RED',
    weeks
  };
}

function calculateMonthlyRollup(kpis, targets) {
  if (kpis.length === 0) {
    return { avgConnects: 0, avgFollowUps: 0, firstOrderRate: 0, overallStatus: 'RED', totalDays: 0 };
  }

  const avgConnects = kpis.reduce((sum, k) => sum + k.connectsPerDay, 0) / kpis.length;
  const avgFollowUps = kpis.reduce((sum, k) => sum + k.followUpsPerDay, 0) / kpis.length;
  const firstOrderRate = kpis.filter(k => k.firstOrderIn14Days).length / kpis.length;

  return {
    avgConnects,
    avgFollowUps,
    firstOrderRate,
    overallStatus: avgConnects >= targets.connects_per_day ? 'GREEN' : 'RED',
    totalDays: kpis.length
  };
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

module.exports = { calculateDailyRollup, calculateWeeklyRollup, calculateMonthlyRollup, getWeekNumber };