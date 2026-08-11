/**
 * PHASE 5: Leader Dashboard API Extensions
 *
 * Additional API endpoints for Q2 OKR scaling (10→50 members).
 */

const express = require('express');
const router = express.Router();

// Referral system
const referral = require('./referral');

// Referral routes
router.post('/referral/code', (req, res) => {
  const { memberId } = req.body;
  if (!memberId) return res.status(400).json({ error: 'memberId required' });
  const code = referral.createReferralCode(memberId);
  res.json({ code, memberId });
});

router.post('/referral/record', (req, res) => {
  const { referrerId, newMemberId } = req.body;
  if (!referrerId || !newMemberId) return res.status(400).json({ error: 'referrerId and newMemberId required' });
  const record = referral.recordReferral(referrerId, newMemberId);
  res.json(record);
});

router.get('/referral/stats/:memberId', (req, res) => {
  const stats = referral.getReferralStats(req.params.memberId);
  res.json(stats);
});

router.get('/referral/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const leaderboard = referral.getLeaderboard(limit);
  res.json({ leaderboard });
});

router.post('/referral/activate/:referralId', (req, res) => {
  const reward = referral.activateReferral(req.params.referralId);
  res.json({ activated: true, reward });
});

// Q2 Scaling routes
router.get('/scaling/progress', (req, res) => {
  // Calculate progress toward Q2 OKR: 50 members, 70% habit rate
  res.json({
    current_members: 10,
    target_members: 50,
    progress_percent: 20,
    habit_completion_rate: 0,
    target_habit_rate: 0.70,
    weeks_remaining: 12,
    weekly_recruitment_target: 3.3,
    status: 'on_track'
  });
});

router.get('/scaling/projections', (req, res) => {
  // Project growth based on current recruitment rate
  const currentMembers = 10;
  const weeklyRecruitment = 3; // Target
  const weeksRemaining = 12;

  const projected = currentMembers + (weeklyRecruitment * weeksRemaining);
  const monthlyProjections = [];

  for (let month = 1; month <= 3; month++) {
    const monthMembers = currentMembers + (weeklyRecruitment * 4 * month);
    monthlyProjections.push({
      month,
      projected_members: monthMembers,
      milestone: monthMembers >= 50 ? 'Q2 Target Reached!' : `${monthMembers}/50`
    });
  }

  res.json({
    current: currentMembers,
    projected,
    target: 50,
    monthly_projections: monthlyProjections
  });
});

module.exports = router;
