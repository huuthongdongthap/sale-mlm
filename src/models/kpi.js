const crypto = require('crypto');

/**
 * KPI tracking model for Droppii Training OS
 * Tracks member performance against tier-specific targets
 */
class KPI {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.memberId = data.memberId || null;
    this.date = data.date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Daily KPI metrics per tier requirements
    this.connectsPerDay = data.connectsPerDay || 0;
    this.followUpsPerDay = data.followUpsPerDay || 0;
    this.firstOrderIn14Days = data.firstOrderIn14Days || false; // boolean flag

    // Additional tracking fields
    this.habitScore = data.habitScore || 0;
    this.ordersCount = data.ordersCount || 0;
    this.revenue = data.revenue || 0;

    this.createdAt = data.createdAt || new Date().toISOString();
  }

  toJSON() {
    return { ...this };
  }

  /**
   * Get tier targets from company.json training_architecture
   */
  static getTierTargets() {
    const fs = require('fs');
    const path = require('path');

    try {
      const companyPath = path.join(__dirname, '../../.mekong/company.json');
      const company = JSON.parse(fs.readFileSync(companyPath, 'utf8'));

      return {
        1: company.training_architecture.tier_1_warrior.kpis,
        2: company.training_architecture.tier_2_commander.kpis,
        3: company.training_architecture.tier_3_general.kpis
      };
    } catch (error) {
      console.error('Failed to load tier targets:', error.message);
      // Fallback defaults
      return {
        1: { connects_per_day: 15, follow_ups_per_day: 3, first_order_deadline_days: 14 },
        2: { connects_per_day: 20, follow_ups_per_day: 5, first_order_deadline_days: 14 },
        3: { connects_per_day: 25, follow_ups_per_day: 8, first_order_deadline_days: 14 }
      };
    }
  }

  /**
   * Calculate status (RED/YELLOW/GREEN) for a KPI value vs target
   */
  static calculateStatus(current, target, type = 'default') {
    if (!target || target === 0) return 'GREEN'; // No target set

    const ratio = current / target;

    if (type === 'boolean') {
      return current ? 'GREEN' : 'RED';
    }

    if (ratio >= 1.0) return 'GREEN';      // 100%+ of target
    if (ratio >= 0.7) return 'YELLOW';     // 70-99% of target
    return 'RED';                          // <70% of target
  }
}

module.exports = KPI;
