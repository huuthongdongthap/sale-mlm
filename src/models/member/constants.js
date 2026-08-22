/**
 * Member model — constants
 */

const crypto = require('crypto');

/**
 * Available roles in the system with increasing authority:
 * - Member: Basic trainee in the system
 * - PSN Leader: Leads a Personal Sales Network team
 * - Core Leader: Manages multiple PSN teams
 * - Admin: Full system access and management
 */
const ROLES = ['Member', 'PSN Leader', 'Core Leader', 'Admin'];

function uid() {
  return crypto.randomUUID();
}

module.exports = { ROLES, uid };