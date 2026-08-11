/**
 * PHASE 5: Referral System
 *
 * Incentivize existing members to recruit new members.
 * Features:
 *   - Referral tracking
 *   - Reward tiers
 *   - Leaderboard
 *   - Payout calculation
 */

const crypto = require('crypto');

// In-memory referral storage
const referrals = [];
const rewards = [];

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
function recordReferral(referrerId, newMemberId) {
  const referral = {
    id: crypto.randomUUID(),
    referrerId,
    newMemberId,
    referredAt: new Date().toISOString(),
    status: 'pending', // pending, active, rewarded
    newMemberJoinDate: new Date().toISOString()
  };

  referrals.push(referral);

  // Check if referrer qualifies for reward
  checkReferralReward(referrerId);

  return referral;
}

/**
 * Check if referrer qualifies for reward
 */
function checkReferralReward(referrerId) {
  const referrerReferrals = referrals.filter(r => r.referrerId === referrerId && r.status === 'active');
  const count = referrerReferrals.length;

  for (const tier of REWARD_TIERS) {
    if (count >= tier.referrals) {
      // Check if already rewarded for this tier
      const existingReward = rewards.find(r => r.referrerId === referrerId && r.level === tier.level);
      if (!existingReward) {
        const reward = {
          id: crypto.randomUUID(),
          referrerId,
          level: tier.level,
          referrals: count,
          reward: tier.reward,
          awardedAt: new Date().toISOString()
        };
        rewards.push(reward);
        return reward;
      }
    }
  }

  return null;
}

/**
 * Get referral stats for a member
 */
function getReferralStats(memberId) {
  const memberReferrals = referrals.filter(r => r.referrerId === memberId);
  const activeReferrals = memberReferrals.filter(r => r.status === 'active');
  const memberRewards = rewards.filter(r => r.referrerId === memberId);

  return {
    totalReferrals: memberReferrals.length,
    activeReferrals: activeReferrals.length,
    rewards: memberRewards,
    nextTier: getNextTier(activeReferrals.length),
    referralCode: createReferralCode(memberId)
  };
}

/**
 * Get next reward tier
 */
function getNextTier(currentCount) {
  for (const tier of REWARD_TIERS) {
    if (currentCount < tier.referrals) {
      return {
        level: tier.level,
        referralsNeeded: tier.referrals - currentCount,
        reward: tier.reward
      };
    }
  }
  return null; // Max tier reached
}

/**
 * Get referral leaderboard
 */
function getLeaderboard(limit = 10) {
  const stats = {};

  for (const referral of referrals) {
    if (referral.status === 'active') {
      if (!stats[referral.referrerId]) {
        stats[referral.referrerId] = { referrerId: referral.referrerId, count: 0, rewards: 0 };
      }
      stats[referral.referrerId].count++;
    }
  }

  for (const reward of rewards) {
    if (stats[reward.referrerId]) {
      stats[reward.referrerId].rewards++;
    }
  }

  return Object.values(stats)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Activate referral (when new member completes onboarding)
 */
function activateReferral(referralId) {
  const referral = referrals.find(r => r.id === referralId);
  if (!referral) return null;

  referral.status = 'active';
  referral.activatedAt = new Date().toISOString();

  // Check for reward
  return checkReferralReward(referral.referrerId);
}

module.exports = {
  createReferralCode,
  recordReferral,
  getReferralStats,
  getLeaderboard,
  activateReferral,
  REWARD_TIERS,
  referrals,
  rewards
};
