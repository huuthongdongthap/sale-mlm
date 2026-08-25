/**
 * Order model — Funnel OS
 * Represents a product purchase with commission tracking
 * Uses DatabaseAdapter for D1 persistence
 */

const crypto = require('crypto');
const {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  PRODUCT_TIERS,
  TIER_LABELS,
  uid
} = require('./constants');

function isoNow() {
  return new Date().toISOString();
}

class Order {
  constructor(data = {}) {
    this.id = data.id || uid();
    this.leadId = data.leadId || null;
    this.leadName = data.leadName || null;
    this.leadEmail = data.leadEmail || null;
    this.leadPhone = data.leadPhone || null;
    this.memberId = data.memberId || null;
    this.orgId = data.orgId || data.org_id || null;
    this.productId = data.productId || null;
    this.productName = data.productName || null;
    this.productTier = data.productTier || null;
    this.quantity = data.quantity || 1;
    this.unitPriceVND = data.unitPriceVND || 0;
    this.totalVND = data.totalVND || (this.unitPriceVND * this.quantity);
    this.commissionVND = data.commissionVND || 0;
    this.commissionRate = data.commissionRate || 0;
    this.paymentMethod = PAYMENT_METHODS.includes(data.paymentMethod) ? data.paymentMethod : 'cod';
    this.paymentStatus = PAYMENT_STATUSES.includes(data.paymentStatus) ? data.paymentStatus : 'pending';
    this.paymentReference = data.paymentReference || null;
    this.shippingAddress = data.shippingAddress || null;
    this.notes = data.notes || '';
    this.status = ORDER_STATUSES.includes(data.status) ? data.status : 'pending';
    this.createdAt = data.createdAt || isoNow();
    this.updatedAt = data.updatedAt || isoNow();
    this.shippedAt = data.shippedAt || null;
    this.deliveredAt = data.deliveredAt || null;
    this.cancelledAt = data.cancelledAt || null;
    this.metadata = data.metadata || {};
  }

  /* ---- Validation ---- */

  isValidStatus(s) { return ORDER_STATUSES.includes(s); }
  isValidPaymentStatus(s) { return PAYMENT_STATUSES.includes(s); }
  isValidTier(t) { return PRODUCT_TIERS.includes(t); }

  /* ---- Calculations ---- */

  recalculate() {
    this.totalVND = this.unitPriceVND * this.quantity;
    this.commissionVND = Math.round(this.totalVND * (this.commissionRate / 100));
    this.updatedAt = isoNow();
  }

  /* ---- Status transitions ---- */

  static canTransition(fromStatus, toStatus) {
    if (fromStatus === toStatus) return { ok: false, reason: 'Same status' };
    if (!ORDER_STATUSES.includes(toStatus)) return { ok: false, reason: 'Invalid target status' };
    const transitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['refunded'],
      cancelled: [],
      refunded: []
    };
    return transitions[fromStatus]?.includes(toStatus)
      ? { ok: true }
      : { ok: false, reason: `Cannot transition from ${fromStatus} to ${toStatus}` };
  }

  applyStatus(toStatus, actorId) {
    const result = Order.canTransition(this.status, toStatus);
    if (!result.ok) throw new Error(result.reason);
    const prev = this.status;
    this.status = toStatus;
    this.updatedAt = isoNow();
    if (toStatus === 'shipped') this.shippedAt = isoNow();
    if (toStatus === 'delivered') this.deliveredAt = isoNow();
    if (toStatus === 'cancelled') this.cancelledAt = isoNow();
    const entry = { event: 'status_transition', fromStatus: prev, toStatus, actorId, at: this.updatedAt };
    if (!this.metadata.transitions) this.metadata.transitions = [];
    this.metadata.transitions.push(entry);
  }

  /* ---- Serialization ---- */

  toJSON() {
    return {
      id: this.id,
      memberId: this.memberId,
      orgId: this.orgId,
      productId: this.productId,
      productName: this.productName,
      productTier: this.productTier,
      quantity: this.quantity,
      unitPriceVND: this.unitPriceVND,
      totalVND: this.totalVND,
      commissionVND: this.commissionVND,
      commissionRate: this.commissionRate,
      paymentMethod: this.paymentMethod,
      paymentStatus: this.paymentStatus,
      paymentReference: this.paymentReference,
      shippingAddress: this.shippingAddress,
      notes: this.notes,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      shippedAt: this.shippedAt,
      deliveredAt: this.deliveredAt,
      cancelledAt: this.cancelledAt,
    };
  }

  // Full representation including PII-ish lead fields, for authenticated detail views
  toJSON_Admin() {
    return {
      ...this.toJSON(),
      leadId: this.leadId,
      leadName: this.leadName,
      leadEmail: this.leadEmail,
      leadPhone: this.leadPhone,
      orgId: this.orgId,
      metadata: this.metadata,
    };
  }
}

module.exports = { Order, isoNow };