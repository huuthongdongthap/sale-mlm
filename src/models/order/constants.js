/**
 * Order constants — Funnel OS
 */

const crypto = require('crypto');

const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
const PAYMENT_METHODS = ['cod', 'bank_transfer', 'momo', 'vnpay', 'zalopay'];
const PRODUCT_TIERS = [0, 1, 2, 3, 4];
const TIER_LABELS = ['Lead Magnet', 'Trial', 'Health Active', 'Combo', 'CTV Partner'];

function uid() {
  return crypto.randomUUID();
}

module.exports = {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  PRODUCT_TIERS,
  TIER_LABELS,
  uid
};