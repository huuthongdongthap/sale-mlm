/**
 * Lead model — constants
 */

const crypto = require('crypto');

const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost', 'archived'];
const FUNNEL_LEVELS = [0, 1, 2, 3, 4];
const TIER_LABELS = [
  'Lead Magnet', // 0
  'Trial', // 1
  'Health Active', // 2
  'Combo', // 3
  'CTV Partner' // 4
];
const TIER_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];
const SOURCES = ['zalo', 'social', 'event', 'referral', 'organic', 'ads', 'shopee', 'tiktokshop'];

function uid() {
  return crypto.randomUUID();
}

module.exports = { STATUSES, FUNNEL_LEVELS, TIER_LABELS, TIER_COLORS, SOURCES, uid };