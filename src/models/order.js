/**
 * Order model — Funnel OS
 * Represents a product purchase with commission tracking
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

function isoNow() {
  return new Date().toISOString();
}

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}

class Order {
  constructor(data = {}) {
    this.id = data.id || uid();
    this.leadId = data.leadId || null;
    this.leadName = data.leadName || '';
    this.leadEmail = data.leadEmail || '';
    this.leadPhone = data.leadPhone || '';
    this.productId = data.productId || null;
    this.productName = data.productName || '';
    this.productTier = PRODUCT_TIERS.includes(data.productTier) ? data.productTier : 1;
    this.quantity = data.quantity || 1;
    this.unitPriceVND = data.unitPriceVND || 0;
    this.totalVND = data.totalVND || (this.unitPriceVND * this.quantity);
    this.commissionVND = data.commissionVND || 0;
    this.commissionRate = data.commissionRate || 0;
    this.paymentMethod = PAYMENT_METHODS.includes(data.paymentMethod) ? data.paymentMethod : 'cod';
    this.paymentStatus = PAYMENT_STATUSES.includes(data.paymentStatus) ? data.paymentStatus : 'pending';
    this.paymentReference = data.paymentReference || null;
    this.shippingAddress = data.shippingAddress || '';
    this.notes = data.notes || '';
    this.status = ORDER_STATUSES.includes(data.status) ? data.status : 'pending';
    this.createdAt = data.createdAt || isoNow();
    this.updatedAt = data.updatedAt || isoNow();
    this.shippedAt = data.shippedAt || null;
    this.deliveredAt = data.deliveredAt || null;
    this.cancelledAt = data.cancelledAt || null;
    this.metadata = data.metadata || {};
  }

  /* ---- Validation helpers ---- */

  isValidStatus(s) {
    return ORDER_STATUSES.includes(s);
  }

  isValidPaymentStatus(s) {
    return PAYMENT_STATUSES.includes(s);
  }

  isValidTier(t) {
    return PRODUCT_TIERS.includes(t);
  }

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

    // Valid transitions
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

    // Timestamps for key transitions
    if (toStatus === 'shipped') this.shippedAt = isoNow();
    if (toStatus === 'delivered') this.deliveredAt = isoNow();
    if (toStatus === 'cancelled') this.cancelledAt = isoNow();

    // Log transition
    const entry = {
      event: 'status_transition',
      fromStatus: prev,
      toStatus,
      actorId,
      at: this.updatedAt,
    };
    if (!this.metadata.transitions) this.metadata.transitions = [];
    this.metadata.transitions.push(entry);
  }

  /* ---- Serialization ---- */

  toJSON() {
    return {
      id: this.id,
      leadId: this.leadId,
      leadName: this.leadName,
      leadEmail: this.leadEmail,
      leadPhone: this.leadPhone,
      productId: this.productId,
      productName: this.productName,
      productTier: this.productTier,
      tierLabel: TIER_LABELS[this.productTier],
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

  toJSON_Admin() {
    return this.toJSON();
  }
}

/* ---- In-memory store ---- */

let orders = [];
let nextDisplayId = 1;

Order.prototype.displayId = null;

Order.createSeededOrders = function () {
  if (orders.length) return orders.slice();

  const make = (overrides) => {
    const o = new Order(overrides);
    o.displayId = nextDisplayId++;
    return o;
  };

  // Seed with some test orders
  const seededLeads = require('./lead').Lead.createSeededLeads();
  const leads = seededLeads;

  orders = [
    make({
      leadId: leads[0]?.id,
      leadName: leads[0]?.getName?.() || 'Nguyễn Văn A',
      leadEmail: leads[0]?.getEmail?.() || 'nguyena@test.vn',
      leadPhone: leads[0]?.getPhone?.() || '+84901234567',
      productName: 'Health Active Starter Kit',
      productTier: 2,
      quantity: 1,
      unitPriceVND: 1500000,
      commissionRate: 15,
      paymentMethod: 'cod',
      paymentStatus: 'paid',
      status: 'delivered',
      commissionVND: 225000,
      shippingAddress: '123 Đường A, Quận 1, TP.HCM',
    }),
    make({
      leadId: leads[3]?.id,
      leadName: leads[3]?.getName?.() || 'Phạm Thị D',
      leadEmail: leads[3]?.getEmail?.() || 'phamd@test.vn',
      leadPhone: leads[3]?.getPhone?.() || '+84911223344',
      productName: 'Trial Pack - Weight Loss',
      productTier: 1,
      quantity: 2,
      unitPriceVND: 500000,
      commissionRate: 10,
      paymentMethod: 'bank_transfer',
      paymentStatus: 'paid',
      status: 'confirmed',
      commissionVND: 100000,
      shippingAddress: '456 Đường B, Quận 2, TP.HCM',
    }),
    make({
      leadId: leads[7]?.id,
      leadName: leads[7]?.getName?.() || 'Bùi Thị H',
      leadEmail: leads[7]?.getEmail?.() || 'buih@test.vn',
      leadPhone: leads[7]?.getPhone?.() || '+84922334455',
      productName: 'Combo Health Active + Vitamins',
      productTier: 3,
      quantity: 1,
      unitPriceVND: 3500000,
      commissionRate: 20,
      paymentMethod: 'momo',
      paymentStatus: 'paid',
      status: 'shipped',
      commissionVND: 700000,
      shippingAddress: '789 Đường C, Quận 3, TP.HCM',
    }),
    make({
      leadId: leads[10]?.id,
      leadName: leads[10]?.getName?.() || 'Lý Thị M',
      leadEmail: leads[10]?.getEmail?.() || 'lym@test.vn',
      leadPhone: leads[10]?.getPhone?.() || '+84955667722',
      productName: 'CTV Partner Bundle',
      productTier: 4,
      quantity: 1,
      unitPriceVND: 5000000,
      commissionRate: 25,
      paymentMethod: 'vnpay',
      paymentStatus: 'paid',
      status: 'pending',
      commissionVND: 1250000,
      shippingAddress: '321 Đường D, Quận 4, TP.HCM',
    }),
  ];

  return orders;
};

/* ------------------------------------------------------------------ */
/* markPaid(orderId, paymentReference, paymentMethod, actorId)       */
/* ------------------------------------------------------------------ */
function markPaid(orderId, paymentReference, paymentMethod, actorId) {
  const order = findById(orderId);
  if (!order) return null;
  if (order.paymentStatus === 'paid') return order; // idempotent
  if (order.status === 'cancelled' || order.status === 'refunded') {
    throw new Error(`Cannot mark paid from ${order.status}`);
  }
  order.paymentStatus = 'paid';
  order.paymentReference = paymentReference || order.paymentReference;
  order.paymentMethod = PAYMENT_METHODS.includes(paymentMethod)
    ? paymentMethod
    : order.paymentMethod;
  order.status = 'confirmed';
  order.updatedAt = isoNow();
  const entry = {
    event: 'mark_paid',
    fromStatus: 'pending',
    toStatus: 'confirmed',
    paymentMethod: order.paymentMethod,
    actorId: actorId || 'system',
    at: order.updatedAt,
  };
  order.metadata.transitions = order.metadata.transitions || [];
  order.metadata.transitions.push(entry);
  updateOrder(order.id, order);
  return order;
}

function allOrders() {
  Order.createSeededOrders();
  return orders;
}

function findById(id) {
  return orders.find(o => o.id === id) || null;
}

function findByLeadId(leadId) {
  return orders.filter(o => o.leadId === leadId);
}

function createOrder(data) {
  const order = new Order(data);
  order.recalculate();
  orders.unshift(order);
  return order;
}

function updateOrder(id, data) {
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return null;
  const order = orders[idx];
  Object.assign(order, data);
  order.recalculate();
  order.updatedAt = isoNow();
  return order;
}

function deleteOrder(id) {
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return false;
  orders.splice(idx, 1);
  return true;
}

module.exports = {
  Order,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  PRODUCT_TIERS,
  TIER_LABELS,
 markPaid,
  allOrders,
  findById,
  findByLeadId,
  createOrder,
  updateOrder,
  deleteOrder,
  setStore: () => orders,
  getStore: () => orders,
};