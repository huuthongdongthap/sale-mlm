/**
 * Onboarding Bot — daily nudge generation (Zalo-ready payload)
 */

const { WEEKS } = require('./constants');
const { getDayMessage, getDayActionItems } = require('./messages');
const { sessions } = require('./session');

/**
 * Generate daily nudge message (Zalo-ready payload)
 */
function generateNudge(memberId) {
  const session = sessions[memberId];
  if (!session) return { error: 'No session found' };

  const weekConfig = WEEKS[session.currentWeek];
  const nudge = {
    to: session.zaloPhone,
    type: 'onboarding_nudge',
    week: session.currentWeek,
    day: session.currentDay,
    module: weekConfig.module,
    module_name: weekConfig.name,
    focus: weekConfig.focus,
    message: getDayMessage(session),
    action_items: getDayActionItems(session),
    generated_at: new Date().toISOString()
  };

  session.lastNudgeAt = new Date().toISOString();
  return nudge;
}

module.exports = { generateNudge };
