const { getTraineesByPSN } = require('./agents/trainingOps');
const { getActiveSessions } = require('./agents/onboardingBot');
const { evaluateAll } = require('./analytics/alertEngine');
const { classifyPSNHealth } = require('./analytics/psnHealth');
const { getStalledLeads, evaluateAutoTransitions } = require('./automation/funnelRules');
const { triggerWebhooks } = require('./webhooks');

/**
 * Compute PSN health metrics from database and in-memory state.
 * @param {string} psnId - PSN identifier
 * @param {Object|null} db - Database adapter (optional, for Workers)
 * @returns {Promise<Object>} Metrics object with team_size, retention, revenue, activity, habit, connect
 */
async function computePSNMetrics(psnId, db = global.db) {
  const members = db ? await db.listMembers({ psn_id: psnId }) : [];
  const activeMembers = members.filter(m => m.status === 'active');

  // Training metrics
  const trainees = getTraineesByPSN(psnId);
  const habitScores = trainees.flatMap(t => t.avg_habit_score !== 'N/A' ? [t.avg_habit_score] : []);
  const habitAvg = habitScores.length > 0
    ? habitScores.reduce((a, b) => a + b, 0) / habitScores.length
    : 0;

  // Activity ratio: trainees with activity in last 2 days
  const now = Date.now();
  const activeRecently = trainees.filter(t => {
    if (!t.last_activity) return false;
    const daysSince = (now - new Date(t.last_activity).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 2;
  }).length;
  const activityRatio = trainees.length > 0 ? activeRecently / trainees.length : 0;

  // Connect average (from onboarding)
  const sessions = getActiveSessions();
  const psnSessions = sessions.filter(s => s.psnId === psnId);
  const connectAvg = psnSessions.length > 0
    ? psnSessions.reduce((sum, s) => sum + (s.connectsToday || 0), 0) / psnSessions.length
    : 0;

  // Revenue delta (month over month)
  const memberIds = members.map(m => m.id);
  const orders = db ? await db.listOrders({ memberId: memberIds[0] || null }) : [];
  const paidOrders = orders.filter(o => o.payment_status === 'paid');
  const thisMonth = paidOrders.filter(o => {
    const d = new Date(o.created_at);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  }).reduce((sum, o) => sum + o.total_vnd, 0);
  const lastMonthDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const lastMonth = paidOrders.filter(o => {
    const d = new Date(o.created_at);
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
  }).reduce((sum, o) => sum + o.total_vnd, 0);
  const revenueDelta = lastMonth > 0 ? (thisMonth - lastMonth) / lastMonth : 0;

  // Retention (simplified)
  const retention30d = members.length > 0 ? activeMembers.length / members.length : 0;
  const retention90d = retention30d;

  return {
    team_size: activeMembers.length,
    retention_30d: retention30d,
    retention_90d: retention90d,
    revenue_delta: revenueDelta,
    activity_ratio: activityRatio,
    habit_avg: habitAvg,
    connect_avg: connectAvg
  };
}

/**
 * Run scheduled PSN health evaluation for all PSNs.
 * @param {Object|null} db - Database adapter
 */
async function runScheduledEvaluation(db = global.db) {
  console.log('[cron] Running scheduled PSN health evaluation...');
  const members = db ? await db.listMembers({}) : [];
  const psnIds = [...new Set(members.map(m => m.psn_id).filter(Boolean))];

  for (const psnId of psnIds) {
    try {
      const metrics = await computePSNMetrics(psnId, db);
      const fired = evaluateAll(metrics, psnId);
      if (fired.length > 0) {
        console.log(`[cron] PSN ${psnId}: ${fired.length} alerts fired`);
        triggerWebhooks(psnId, fired, metrics);
      }
    } catch (err) {
      console.error(`[cron] Error evaluating PSN ${psnId}:`, err.message);
    }
  }
}

/**
 * Run funnel auto-transition evaluation.
 */
function runFunnelAutoTransitions() {
  console.log('[cron] Running funnel auto-transition evaluation...');
  try {
    const actions = evaluateAutoTransitions();
    if (actions.length > 0) {
      console.log(`[cron] Funnel: ${actions.length} auto-transitions queued`);
      actions.forEach(a => console.log(`  - Lead ${a.leadId} -> Tier ${a.toTier}: ${a.reason}`));
    }
  } catch (err) {
    console.error('[cron] Funnel auto-transition error:', err.message);
  }
}

/**
 * Run stalled leads detection.
 */
function runStalledLeadsCheck() {
  console.log('[cron] Checking for stalled leads...');
  try {
    const stalled = getStalledLeads();
    if (stalled.length > 0) {
      console.log(`[cron] Stalled leads: ${stalled.length} leads need attention`);
      stalled.forEach(l => console.log(`  - ${l.id} (${l.name}): tier ${l.funnelLevel}, ${l.daysSinceContact} days since contact`));
    }
  } catch (err) {
    console.error('[cron] Stalled leads error:', err.message);
  }
}

/**
 * Initialize all cron jobs (4-hour intervals).
 * @returns {Object} Object with interval IDs for cleanup
 */
function initCronJobs() {
  const intervals = {};

  if (require.main === module) {
    intervals.scheduled = setInterval(() => runScheduledEvaluation(), 4 * 60 * 60 * 1000);
    console.log('[cron] Scheduled evaluation started (every 4 hours)');

    intervals.funnel = setInterval(runFunnelAutoTransitions, 4 * 60 * 60 * 1000);
    console.log('[cron] Funnel auto-transition cron started (every 4 hours)');

    intervals.stalled = setInterval(runStalledLeadsCheck, 4 * 60 * 60 * 1000);
    console.log('[cron] Stalled leads cron started (every 4 hours)');
  }

  return intervals;
}

module.exports = {
  computePSNMetrics,
  runScheduledEvaluation,
  runFunnelAutoTransitions,
  runStalledLeadsCheck,
  initCronJobs,
};