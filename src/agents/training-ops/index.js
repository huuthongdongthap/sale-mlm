/**
 * T-017: Training Ops Agent
 *
 * Backward-compatible barrel — implementation lives in
 * src/agents/training-ops/ (constants, records).
 */

const { CURRICULUM } = require('./constants');
const {
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
} = require('./records');

module.exports = {
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
  getTraineesNeedingAttention,
  CURRICULUM,
  trainingRecords,
  reminders
};