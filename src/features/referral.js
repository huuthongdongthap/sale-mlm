/**
 * PHASE 5: Referral System
 *
 * Incentivize existing members to recruit new members.
 * Persistence goes through the database adapter's referrals ops so records
 * survive Worker cold starts (previously in-memory arrays).
 *
 * Schema note: the referrals table tracks reward state in reward_status
 * ('pending' | 'active' | 'paid'), not a bare status column.
 */

const crypto = require('crypto');

/**
 * Reward tiers
 */
const REWARD_TIERS = [
  { level: 1, referrals: 1, reward: 'Recognition + 50K bonus' },
  { level: 2, referrals: 3, reward: 'Tier upgrade priority + 200K bonus' },
  { level: 3, referrals: 5, reward: 'PSN Leader track + 500K bonus' },
  { level: 4, referrals: 10, reward: 'Core Leader track + 1M bonus' },
  { level: 5, referrals: 20, reward: 'Elite status + 3M bonus' }
];

let db = null;

/**
 * Bind the feature to a persistence adapter exposing referral operations.
 * Accepts the LocalDatabaseAdapter/D1 adapter directly or its referrals ops.
 */
function setReferralStore(adapter) {
  db = adapter && adapter.referrals ? adapter.referrals : adapter;
}

function requireStore() {
  if (!db) throw new Error('Referral store not initialized — call setReferralStore(db)');
  return db;
}

/**
 * Create referral code for a member
 */
function createReferralCode(memberId) {
  const code = `HIVE-${memberId.substring(0, 8).toUpperCase()}`;
  return code;
}

/**
 * Record a referral
 */
async function recordReferral(referrerId, newMemberId) {
  const store = requireStore();
  const id = crypto.randomUUID();
  await store.createReferral(id, referrerId, newMemberId);
  return {
    id,
    referrerId,
    refereeId: newMemberId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}

/**
 * Get referral stats for a member
 */
async function getReferralStats(memberId) {
  const store = requireStore();
  const rows = await store.getReferralsByReferrer(memberId);
  const activeCount = rows.filter(r => r.reward_status === 'active').length;
  const tier = REWARD_TIERS.filter(t => activeCount >= t.referrals).pop() || null;
  return {
    memberId,
    totalReferrals: rows.length,
    activeReferrals: activeCount,
    currentTier: tier ? tier.level : 0,
    nextTier: REWARD_TIERS.find(t => t.referrals > activeCount) || null
  };
}

/**
 * Get leaderboard of top referrers by active referrals
 */
async function getLeaderboard(limit = 10) {
  const store = requireStore();
  const allRows = await store.getActiveReferralCounts();
  return allRows
    .slice(0, limit)
    .map(r => ({
      referrerId: r.referrer_id,
      count: r.active_count
    }));
}

/**
 * Activate a referral (when the referred member completes onboarding)
 */
async function activateReferral(referralId) {
  const store = requireStore();
  const updated = await store.activateReferral(referralId);
  if (!updated) return null;
  const stats = await getReferralStats(updated.referrer_id);
  const tier = REWARD_TIERS.find(t => t.referrals === stats.activeReferrals) || null;
  return tier || { level: null, reward: 'No tier change' };
}

/**
 * Auto-activate all pending referrals whose referee just became a member
 * (called from the member-create flow).
 */
async function autoActivateForReferee(memberId) {
  const store = requireStore();
  const rows = await store.findPendingByReferee(memberId);
  for (const row of rows) {
    await activateReferral(row.id);
  }
  return rows.length;
}

module.exports = {
  setReferralStore,
  createReferralCode,
  recordReferral,
  getReferralStats,
  getLeaderboard,
  activateReferral,
  autoActivateForReferee,
  REWARD_TIERS
};
