/**
 * PHASE 5: Leader Dashboard API Extensions
 *
 * Additional API endpoints for Q2 OKR scaling (10→50 members).
 * Mounted at /scaling in server.js. Requires auth middleware upstream.
 */

const express = require('express');
const router = express.Router();

// Referral system (persisted via the DB adapter)
const referral = require('./referral');

// Referral routes
router.post('/referral/code', (req, res) => {
  const { memberId } = req.body || {};
  if (!memberId) return res.status(400).json({ error: 'memberId required' });
  const code = referral.createReferralCode(memberId);
  res.json({ code, memberId });
});

router.post('/referral/record', async (req, res) => {
  try {
    const { referrerId, newMemberId } = req.body || {};
    if (!referrerId || !newMemberId) return res.status(400).json({ error: 'referrerId and newMemberId required' });
    const record = await referral.recordReferral(referrerId, newMemberId);
    res.status(201).json(record);
  } catch (error) {
    console.error('Record referral error:', error.message);
    res.status(500).json({ error: 'Failed to record referral' });
  }
});

router.get('/referral/stats/:memberId', async (req, res) => {
  try {
    res.json(await referral.getReferralStats(req.params.memberId));
  } catch (error) {
    console.error('Referral stats error:', error.message);
    res.status(500).json({ error: 'Failed to load referral stats' });
  }
});

router.get('/referral/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    res.json({ leaderboard: await referral.getLeaderboard(limit) });
  } catch (error) {
    console.error('Leaderboard error:', error.message);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

router.post('/referral/activate/:referralId', async (req, res) => {
  try {
    const reward = await referral.activateReferral(req.params.referralId);
    if (!reward) return res.status(404).json({ error: 'Referral not found or already active' });
    res.json({ activated: true, reward });
  } catch (error) {
    console.error('Activate referral error:', error.message);
    res.status(500).json({ error: 'Failed to activate referral' });
  }
});

// Q2 Scaling route — live member count + habit rate from the DB adapter
router.get('/progress', async (req, res) => {
  try {
    const db = req.app.get('db');
    if (!db) return res.status(503).json({ error: 'Database not available' });
    const members = await db.listMembers({});
    const currentMembers = members.length;
    const targetMembers = 50;
    // Habit rate: share of members with a habit log in the last 7 days
    let habitActive = 0;
    for (const m of members) {
      const habits = await db.getMemberHabits(m.id, 7);
      if (habits && habits.length > 0) habitActive++;
    }
    const habitRate = currentMembers ? habitActive / currentMembers : 0;

    res.json({
      current_members: currentMembers,
      target_members: targetMembers,
      progress_percent: Math.round((currentMembers / targetMembers) * 100),
      habit_completion_rate: Number(habitRate.toFixed(2)),
      target_habit_rate: 0.70,
      status: currentMembers >= targetMembers ? 'target_reached' : (habitRate >= 0.5 ? 'on_track' : 'needs_attention')
    });
  } catch (error) {
    console.error('Scaling progress error:', error.message);
    res.status(500).json({ error: 'Failed to compute scaling progress' });
  }
});

module.exports = router;
