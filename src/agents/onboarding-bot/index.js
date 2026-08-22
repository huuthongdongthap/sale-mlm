/**
 * T-016: Onboarding Bot Flow
 *
 * State machine guiding new recruits through 4 weeks of Tier-1 training:
 *   W1: Mindset Reset (M1)
 *   W2: Product Mastery (M2)
 *   W3: Connect Engine (M3)
 *   W4: First Close (M4)
 *
 * Features:
 *   - Daily nudges (Zalo-ready payload)
 *   - Graduation check (3 orders + habit≥4 × 3 weeks)
 *   - Progress tracking
 *   - Buddy system integration
 *
 * Backward-compatible barrel. Implementation split across:
 *   src/agents/onboarding-bot/constants.js — week/module definitions
 *   src/agents/onboarding-bot/messages.js  — daily messages and action items
 *   src/agents/onboarding-bot/session.js   — session state machine
 *   src/agents/onboarding-bot/nudge.js     — nudge generation
 */

const { WEEKS } = require('./constants');
const { getDayMessage, getDayActionItems } = require('./messages');
const {
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
} = require('./session');
const { generateNudge } = require('./nudge');

module.exports = {
  startOnboarding,
  getSession,
  advanceDay,
  recordHabitScore,
  recordOrder,
  generateNudge,
  getProgress,
  getActiveSessions,
  getSessionsNeedingNudges,
  checkGraduation,
  getDayMessage,
  getDayActionItems,
  WEEKS,
  sessions
};
