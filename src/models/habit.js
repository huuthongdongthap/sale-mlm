/**
 * HABIT SCORE ALGORITHM (6-point daily scoring system)
 * ===================================================
 *
 * Based on Droppii Training OS methodology for Tier-1 Warriors (Tân Binh → Chiến Binh):
 *
 * Points breakdown:
 * - wakeUp5am (2 points): Foundation discipline from 5AM Club methodology
 * - connects target (2 points max):
 *   - 15+ connects = 2 points (tier target)
 *   - 10-14 connects = 1 point (partial credit)
 *   - <10 connects = 0 points
 * - zoomAttend (1 point): Team training/meeting participation
 * - kaizenJournal (1 point): Daily reflection & continuous improvement
 *
 * Total: 6 points maximum per day
 *
 * Streak Logic:
 * - Streak increments on habit_score >= 4/6 (minimum warrior standard)
 * - Streak resets to 0 after 1 missed day (grace window = 0)
 * - Tier-1 graduation requires: habit_score >= 4/6 for 3 consecutive weeks (21 days)
 */

const { randomUUID } = require('crypto');

class Habit {
  constructor(data = {}) {
    this.id = data.id || randomUUID();
    this.memberId = data.memberId || null;
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.wakeUp5am = data.wakeUp5am || false;
    this.connects = data.connects || 0;
    this.zoomAttend = data.zoomAttend || false;
    this.kaizenJournal = data.kaizenJournal || false;
    this.orders = data.orders || 0;
    this.streak = data.streak || 0;
    this.lastStreakDate = data.lastStreakDate || null;
  }

  get habitScore() {
    let score = 0;
    if (this.wakeUp5am) score += 2;
    if (this.connects >= 15) score += 2;
    else if (this.connects >= 10) score += 1;
    if (this.zoomAttend) score += 1;
    if (this.kaizenJournal) score += 1;
    return score; // max 6
  }

  // Update streak based on habit score and date continuity
  updateStreak(previousQualifyingHabit = null) {
    const currentDate = new Date(this.date);
    const score = this.habitScore;

    if (score >= 4) {
      if (previousQualifyingHabit) {
        const prevDate = new Date(previousQualifyingHabit.date);
        const dayDiff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);

        if (Math.abs(dayDiff - 1) < 0.1) { // Account for floating point precision
          // Consecutive day - increment streak from previous habit
          this.streak = (previousQualifyingHabit.streak || 1) + 1;
        } else if (dayDiff > 1) {
          // Gap detected - reset streak
          this.streak = 1;
        } else {
          // Same day or previous day, maintain current
          this.streak = previousQualifyingHabit.streak || 1;
        }
      } else {
        // First qualifying entry
        this.streak = 1;
      }
      this.lastStreakDate = this.date;
    } else {
      // Score below threshold - reset streak
      this.streak = 0;
      this.lastStreakDate = null;
    }
  }

  toJSON() {
    return {
      ...this,
      habitScore: this.habitScore,
      dailyScore: this.habitScore // backward compatibility
    };
  }
}

module.exports = Habit;
