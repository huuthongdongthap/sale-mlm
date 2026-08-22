/**
 * Onboarding Bot — session state machine
 *
 * In-memory sessions keyed by memberId. Handles start, day
 * advancement, habit/order recording, graduation checks and
 * progress reporting.
 */

const crypto = require('crypto');
const { WEEKS } = require('./constants');
const { getDayMessage } = require('./messages');

// In-memory onboarding sessions
const sessions = {};

/**
 * Start onboarding for a new member
 */
function startOnboarding(memberId, memberData = {}) {
  const session = {
    id: crypto.randomUUID(),
    memberId,
    memberName: memberData.name || 'Tân Binh',
    buddyId: memberData.buddyId || null,
    psnId: memberData.psnId || null,
    currentWeek: 1,
    currentDay: 1,
    startedAt: new Date().toISOString(),
    lastNudgeAt: null,
    completedDays: [],
    completedWeeks: [],
    orders: 0,
    habitScores: [],
    status: 'active', // active, paused, graduated, dropped
    zaloPhone: memberData.phone || null,
    createdAt: new Date().toISOString()
  };

  sessions[memberId] = session;
  return session;
}

/**
 * Get onboarding session for a member
 */
function getSession(memberId) {
  return sessions[memberId] || null;
}

/**
 * Advance to next day
 */
function advanceDay(memberId) {
  const session = sessions[memberId];
  if (!session) return { error: 'No onboarding session found' };
  if (session.status !== 'active') return { error: `Session is ${session.status}` };

  // Mark current day as completed
  const dayKey = `W${session.currentWeek}-D${session.currentDay}`;
  if (!session.completedDays.includes(dayKey)) {
    session.completedDays.push(dayKey);
  }

  // Check if week is complete
  const weekConfig = WEEKS[session.currentWeek];
  if (session.currentDay >= weekConfig.days) {
    // Week complete
    if (!session.completedWeeks.includes(session.currentWeek)) {
      session.completedWeeks.push(session.currentWeek);
    }

    // Check if all 4 weeks complete
    if (session.currentWeek >= 4) {
      // Check graduation criteria
      const graduated = checkGraduation(session);
      if (graduated) {
        session.status = 'graduated';
        return { ...session, graduated: true, message: '🎉 Chúc mừng! Bạn đã tốt nghiệp Tier 1!' };
      } else {
        // Extend Week 4 for more practice
        return { ...session, message: 'Bạn đã hoàn thành 4 tuần. Continue practice để graduate!' };
      }
    }

    // Move to next week
    session.currentWeek += 1;
    session.currentDay = 1;
  } else {
    session.currentDay += 1;
  }

  return { ...session, message: getDayMessage(session) };
}

/**
 * Check graduation criteria
 */
function checkGraduation(session) {
  // Criteria: 3 orders + habit score ≥ 4 for 3 consecutive weeks
  const hasOrders = session.orders >= 3;

  // Check habit scores for last 3 weeks (21 days)
  const recentScores = session.habitScores.slice(-21);
  if (recentScores.length < 21) return false;

  // Check each week's average
  const week1Avg = recentScores.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  const week2Avg = recentScores.slice(7, 14).reduce((a, b) => a + b, 0) / 7;
  const week3Avg = recentScores.slice(14, 21).reduce((a, b) => a + b, 0) / 7;

  const habitOk = week1Avg >= 4 && week2Avg >= 4 && week3Avg >= 4;

  return hasOrders && habitOk;
}

/**
 * Record habit score for the day
 */
function recordHabitScore(memberId, score) {
  const session = sessions[memberId];
  if (!session) return { error: 'No session found' };
  const clampedScore = Math.max(1, Math.min(10, Math.round(score)));
  session.habitScores.push(clampedScore);
  return { success: true, score: clampedScore, total: session.habitScores.length };
}

/**
 * Record an order
 */
function recordOrder(memberId) {
  const session = sessions[memberId];
  if (!session) return { error: 'No session found' };

  session.orders += 1;

  // Check graduation
  if (checkGraduation(session) && session.completedWeeks.length >= 4) {
    session.status = 'graduated';
    return { success: true, orders: session.orders, graduated: true };
  }

  return { success: true, orders: session.orders, graduated: false };
}

/**
 * Get onboarding progress summary
 */
function getProgress(memberId) {
  const session = sessions[memberId];
  if (!session) return { error: 'No session found' };

  const totalDays = 28; // 4 weeks × 7 days
  const completedDays = session.completedDays.length;
  const progress = Math.round((completedDays / totalDays) * 100);

  const currentWeekConfig = WEEKS[session.currentWeek];

  return {
    memberId,
    memberName: session.memberName,
    status: session.status,
    current_week: session.currentWeek,
    current_day: session.currentDay,
    current_module: currentWeekConfig.module,
    current_module_name: currentWeekConfig.name,
    progress_percent: progress,
    days_completed: completedDays,
    days_total: totalDays,
    weeks_completed: session.completedWeeks.length,
    orders: session.orders,
    avg_habit_score: session.habitScores.length > 0
      ? (session.habitScores.reduce((a, b) => a + b, 0) / session.habitScores.length).toFixed(1)
      : 'N/A',
    graduation_ready: checkGraduation(session),
    started_at: session.startedAt
  };
}

/**
 * Get all active sessions
 */
function getActiveSessions() {
  return Object.values(sessions).filter(s => s.status === 'active');
}

/**
 * Get sessions needing nudges (haven't been nudged today)
 */
function getSessionsNeedingNudges() {
  const today = new Date().toDateString();
  return Object.values(sessions).filter(s => {
    if (s.status !== 'active') return false;
    if (!s.lastNudgeAt) return true;
    return new Date(s.lastNudgeAt).toDateString() !== today;
  });
}

module.exports = {
  sessions,
  startOnboarding,
  getSession,
  advanceDay,
  checkGraduation,
  recordHabitScore,
  recordOrder,
  getProgress,
  getActiveSessions,
  getSessionsNeedingNudges
};
