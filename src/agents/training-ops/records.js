/**
 * T-017: Training Ops Agent — training records + reminders
 *
 * In-memory training records and reminder payloads. Functions:
 * assignCurriculum, getRecord, updateProgress, getProgress,
 * scheduleReminder, generateReminderPayload, getPendingReminders,
 * markReminderSent, getActiveTrainees, getTraineesByPSN,
 * getTraineesNeedingAttention.
 */

const crypto = require('crypto');
const { CURRICULUM } = require('./constants');

// In-memory training records
const trainingRecords = {};
// In-memory reminders
const reminders = [];

/**
 * Auto-assign curriculum based on member tier
 */
function assignCurriculum(memberId, memberData = {}) {
  const tier = memberData.tier || 1;
  const curriculum = CURRICULUM[tier];
  if (!curriculum) return { error: `No curriculum for tier ${tier}` };

  const record = {
    id: crypto.randomUUID(),
    memberId,
    memberName: memberData.name || 'Unknown',
    tier,
    curriculum_name: curriculum.name,
    duration_weeks: curriculum.duration_weeks,
    current_module: 0,
    current_day: 1,
    completed_modules: [],
    completed_days: 0,
    total_days: curriculum.modules.reduce((sum, m) => sum + m.days, 0),
    started_at: new Date().toISOString(),
    last_activity: null,
    status: 'active',
    habit_scores: [],
    kpi_records: [],
    orders: 0,
    buddy_id: memberData.buddyId || null,
    psn_id: memberData.psnId || null,
    zalo_phone: memberData.phone || null
  };

  trainingRecords[memberId] = record;

  // Schedule first reminder
  scheduleReminder(memberId, 'welcome');

  return record;
}

/**
 * Get training record for a member
 */
function getRecord(memberId) {
  return trainingRecords[memberId] || null;
}

/**
 * Update training progress
 */
function updateProgress(memberId, progressData) {
  const record = trainingRecords[memberId];
  if (!record) return { error: 'No training record found' };

  const { type, value } = progressData;

  switch (type) {
    case 'day_complete':
      record.completed_days += 1;
      record.last_activity = new Date().toISOString();

      // Check if module complete
      const curriculum = CURRICULUM[record.tier];
      let dayCount = 0;
      for (let i = 0; i <= record.current_module; i++) {
        const mod = curriculum.modules[i];
        if (i < record.current_module) {
          dayCount += mod.days;
        } else {
          if (record.completed_days >= dayCount + mod.days) {
            if (!record.completed_modules.includes(mod.id)) {
              record.completed_modules.push(mod.id);
            }
            record.current_module = Math.min(i + 1, curriculum.modules.length - 1);
            record.current_day = 1;
          } else {
            record.current_day = record.completed_days - dayCount + 1;
          }
        }
      }

      // Check graduation
      if (record.completed_days >= record.total_days) {
        record.status = 'graduated';
      }

      // Schedule next day reminder
      scheduleReminder(memberId, 'next_day');
      break;

    case 'habit_score':
      record.habit_scores.push({ score: value, date: new Date().toISOString() });
      record.last_activity = new Date().toISOString();
      break;

    case 'order':
      record.orders += 1;
      record.last_activity = new Date().toISOString();
      break;

    case 'kpi':
      record.kpi_records.push({ ...value, date: new Date().toISOString() });
      record.last_activity = new Date().toISOString();
      break;
  }

  return { success: true, record: getProgress(memberId) };
}

/**
 * Get progress summary
 */
function getProgress(memberId) {
  const record = trainingRecords[memberId];
  if (!record) return { error: 'No record found' };

  const curriculum = CURRICULUM[record.tier];
  const currentModule = curriculum.modules[record.current_module];
  const progressPercent = Math.round((record.completed_days / record.total_days) * 100);

  const avgHabitScore = record.habit_scores.length > 0
    ? (record.habit_scores.reduce((sum, h) => sum + h.score, 0) / record.habit_scores.length).toFixed(1)
    : 'N/A';

  return {
    memberId: record.memberId,
    memberName: record.memberName,
    tier: record.tier,
    curriculum: record.curriculum_name,
    status: record.status,
    progress_percent: progressPercent,
    current_module: currentModule.name,
    current_day: record.current_day,
    completed_days: record.completed_days,
    total_days: record.total_days,
    completed_modules: record.completed_modules,
    avg_habit_score: avgHabitScore,
    orders: record.orders,
    started_at: record.started_at,
    last_activity: record.last_activity
  };
}

/**
 * Schedule a reminder
 */
function scheduleReminder(memberId, type) {
  const record = trainingRecords[memberId];
  if (!record) return;

  const reminder = {
    id: crypto.randomUUID(),
    memberId,
    type,
    scheduled_at: new Date().toISOString(),
    sent: false,
    payload: generateReminderPayload(record, type)
  };

  reminders.push(reminder);
  return reminder;
}

/**
 * Generate reminder payload (Zalo-ready)
 */
function generateReminderPayload(record, type) {
  const curriculum = CURRICULUM[record.tier];
  const currentModule = curriculum.modules[record.current_module];

  const messages = {
    welcome: `Chào ${record.memberName}! Chào mừng bạn đến với ${curriculum.name}. Hành trình ${record.duration_weeks} tuần bắt đầu hôm nay! 🚀`,
    next_day: `🌅 Chào buổi sáng! Hôm nay là ngày ${record.current_day} của ${currentModule.name}. Hãy hoàn thành bài học hôm nay nhé!`,
    habit_reminder: `📝 Reminder: Đừng quên check-in thói quen hôm nay! Target: 5AM + Kaizen + 15 connects.`,
    weekly_review: `📊 Weekly review time! Bạn đã hoàn thành ${record.completed_days}/${record.total_days} ngày (${Math.round((record.completed_days / record.total_days) * 100)}%).`,
    graduation: `🎉 Chúc mừng! Bạn đã hoàn thành ${curriculum.name}! Sẵn sàng cho cấp độ tiếp theo?`
  };

  return {
    to: record.zalo_phone,
    message: messages[type] || messages.next_day,
    type,
    module: currentModule.id,
    day: record.current_day
  };
}

/**
 * Get pending reminders
 */
function getPendingReminders() {
  return reminders.filter(r => !r.sent);
}

/**
 * Mark reminder as sent
 */
function markReminderSent(reminderId) {
  const reminder = reminders.find(r => r.id === reminderId);
  if (!reminder) return false;
  reminder.sent = true;
  reminder.sent_at = new Date().toISOString();
  return true;
}

/**
 * Get all active trainees
 */
function getActiveTrainees() {
  return Object.values(trainingRecords)
    .filter(r => r.status === 'active')
    .map(r => getProgress(r.memberId));
}

/**
 * Get trainees by PSN
 */
function getTraineesByPSN(psnId) {
  return Object.values(trainingRecords)
    .filter(r => r.psn_id === psnId)
    .map(r => getProgress(r.memberId));
}

/**
 * Get trainees needing attention (low habit score, inactive)
 */
function getTraineesNeedingAttention() {
  return Object.values(trainingRecords)
    .filter(r => {
      if (r.status !== 'active') return false;

      // Check low habit score
      const recentScores = r.habit_scores.slice(-7);
      if (recentScores.length > 0) {
        const avg = recentScores.reduce((sum, h) => sum + h.score, 0) / recentScores.length;
        if (avg < 3) return true;
      }

      // Check inactivity (no activity in 2 days)
      if (r.last_activity) {
        const daysSince = (Date.now() - new Date(r.last_activity).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince > 2) return true;
      }

      return false;
    })
    .map(r => ({
      memberId: r.memberId,
      memberName: r.memberName,
      reason: r.habit_scores.length > 0 && r.habit_scores.slice(-7).reduce((sum, h) => sum + h.score, 0) / Math.min(r.habit_scores.length, 7) < 3
        ? 'Low habit score'
        : 'Inactive for 2+ days',
      psn_id: r.psn_id,
      buddy_id: r.buddy_id
    }));
}

module.exports = {
  trainingRecords,
  reminders,
  assignCurriculum,
  getRecord,
  updateProgress,
  getProgress,
  scheduleReminder,
  generateReminderPayload,
  getPendingReminders,
  markReminderSent,
  getActiveTrainees,
  getTraineesByPSN,
  getTraineesNeedingAttention
};