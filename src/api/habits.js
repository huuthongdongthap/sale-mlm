const express = require('express');
const router = express.Router();
const Habit = require('../models/habit');

// In-memory store
const habits = [];

// POST /api/habits/checkin — Main checkin endpoint for habit tracking
router.post('/checkin', (req, res) => {
  try {
    const { member_id, date, items } = req.body;

    // Validation
    if (!member_id) {
      return res.status(400).json({ error: 'member_id is required' });
    }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'items must be an array' });
    }

    const checkinDate = date || new Date().toISOString().split('T')[0];

    // Find or create habit entry for this date
    let habit = habits.find(h => h.memberId === member_id && h.date === checkinDate);
    if (!habit) {
      habit = new Habit({ memberId: member_id, date: checkinDate });
      habits.push(habit);
    }

    // Process each checkin item
    items.forEach(item => {
      switch (item) {
        case '5am':
          habit.wakeUp5am = true;
          break;
        case 'zoom':
          habit.zoomAttend = true;
          break;
        case 'kaizen':
          habit.kaizenJournal = true;
          break;
        case 'connect':
          habit.connects += 1;
          break;
        case 'order':
          habit.orders += 1;
          break;
        default:
          // Allow numeric connects
          if (typeof item === 'number' && item > 0) {
            habit.connects = item;
          } else if (typeof item === 'string' && !isNaN(item) && parseInt(item) > 0) {
            habit.connects = parseInt(item);
          }
      }
    });

    // Calculate streak - find previous qualifying habit
    const memberHabits = habits
      .filter(h => h.memberId === member_id && h.date < checkinDate)
      .sort((a, b) => b.date.localeCompare(a.date));

    const previousQualifyingHabit = memberHabits.find(h => h.habitScore >= 4);
    habit.updateStreak(previousQualifyingHabit);

    res.status(200).json({
      success: true,
      message: 'Check-in thành công! 🐝',
      habit: habit.toJSON(),
      streak: habit.streak
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/habits?memberId=xxx — Get habits for a member
router.get('/', (req, res) => {
  const { memberId, date } = req.query;
  let result = habits;
  if (memberId) result = result.filter(h => h.memberId === memberId);
  if (date) result = result.filter(h => h.date === date);
  res.json(result.map(h => h.toJSON()));
});

// GET /api/habits/streak/:memberId — Get current streak for member
router.get('/streak/:memberId', (req, res) => {
  const { memberId } = req.params;
  const memberHabits = habits
    .filter(h => h.memberId === memberId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const currentStreak = memberHabits[0]?.streak || 0;
  const lastDate = memberHabits[0]?.date;

  res.json({
    memberId,
    currentStreak,
    lastDate,
    totalDays: memberHabits.length
  });
});

// POST /api/habits/snapshot — Midnight snapshot for streak management
router.post('/snapshot', (req, res) => {
  try {
    const { timezone = 'Asia/Ho_Chi_Minh' } = req.body;
    const now = new Date();
    const snapshot = {
      timestamp: now.toISOString(),
      timezone,
      memberCount: new Set(habits.map(h => h.memberId)).size,
      activeStreaks: habits
        .filter(h => h.streak > 0)
        .reduce((acc, h) => {
          if (!acc[h.memberId] || acc[h.memberId] < h.streak) {
            acc[h.memberId] = h.streak;
          }
          return acc;
        }, {}),
      snapshotStatus: 'completed'
    };

    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: 'Snapshot failed' });
  }
});

// POST /api/habits/quick — One-click habit report (backward compatibility)
router.post('/quick', (req, res) => {
  const { memberId, action } = req.body;
  const today = new Date().toISOString().split('T')[0];
  let habit = habits.find(h => h.memberId === memberId && h.date === today);
  if (!habit) {
    habit = new Habit({ memberId, date: today });
    habits.push(habit);
  }
  if (action === '5am') habit.wakeUp5am = true;
  if (action === 'zoom') habit.zoomAttend = true;
  if (action === 'kaizen') habit.kaizenJournal = true;
  if (action === 'connect') habit.connects += 1;
  if (action === 'order') habit.orders += 1;

  // Update streak after quick action
  const memberHabits = habits
    .filter(h => h.memberId === memberId && h.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  const previousQualifyingHabit = memberHabits.find(h => h.habitScore >= 4);
  habit.updateStreak(previousQualifyingHabit);

  res.json({ message: 'Đã ghi nhận! 🐝', habit: habit.toJSON() });
});

// Cron stub endpoint for midnight snapshots
router.get('/cron/midnight-snapshot', (req, res) => {
  // This would be called by a cron job at midnight Asia/Ho_Chi_Minh
  const snapshot = {
    timestamp: new Date().toISOString(),
    timezone: 'Asia/Ho_Chi_Minh',
    message: 'Midnight snapshot completed',
    note: 'This is a stub - production would trigger actual processing'
  };
  res.json(snapshot);
});

module.exports = router;
