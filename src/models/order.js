/**
 * Order model — Funnel OS
 * Represents a product purchase with commission tracking
 * Uses DatabaseAdapter for D1 persistence
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

class Order {
  constructor(data = {}) {
    this.id = data.id || uid();
    this.leadId = data.leadId || null;
    this.leadName = data.leadName || null;
    this.leadEmail = data.leadEmail || null;
    this.leadPhone = data.leadPhone || null;
    this.memberId = data.memberId || null;
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
    this.orgId = data.orgId || data.org_id || null;
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
      orgId: this.orgId,
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
      metadata: this.metadata,
    };
  }

  /* ---- Database operations using DatabaseAdapter ---- */

  static async findById(db, id) {
    const row = await db.getOrder(id);
    if (!row) return null;
    return new Order({
      id: row.id,
      memberId: row.member_id,
      orgId: row.org_id,
      productId: row.product_id,
      quantity: row.quantity,
      unitPriceVND: row.unit_price_vnd,
      totalVND: row.total_vnd,
      status: row.status,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      paymentReference: row.payment_reference,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }

  static async findAll(db, filters = {}) {
    const results = await db.listOrders(filters);
    const rows = results.results || results;
    return rows.map(row => new Order({
      id: row.id,
      memberId: row.member_id,
      orgId: row.org_id,
      productId: row.product_id,
      quantity: row.quantity,
      unitPriceVND: row.unit_price_vnd,
      totalVND: row.total_vnd,
      status: row.status,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      paymentReference: row.payment_reference,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  static async create(db, data) {
    const order = new Order(data);
    order.recalculate();
    const created = await db.createOrder({
      id: order.id,
      memberId: order.memberId,
      org_id: order.orgId,
      productId: order.productId,
      productName: order.productName,
      productTier: order.productTier,
      quantity: order.quantity,
      unitPriceVND: order.unitPriceVND,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paymentReference: order.paymentReference
    });
    // db.createOrder returns a raw row; wrap it back into an Order so callers
    // can use the same toJSON()/toJSON_Admin() API as the in-memory path
    return new Order({
      id: created.id,
      memberId: created.member_id,
      productId: created.product_id,
      productName: created.product_name,
      productTier: created.product_tier,
      quantity: created.quantity,
      unitPriceVND: created.unit_price_vnd,
      totalVND: created.total_vnd,
      status: created.status,
      paymentMethod: created.payment_method,
      paymentStatus: created.payment_status,
      paymentReference: created.payment_reference,
      createdAt: created.created_at,
      updatedAt: created.updated_at
    });
  }

  static async update(db, id, data) {
    const updateData = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
    if (data.paymentReference !== undefined) updateData.paymentReference = data.paymentReference;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.totalVND !== undefined) updateData.totalVND = data.totalVND;
    const updated = await db.updateOrder(id, updateData);
    if (!updated) return null;
    return new Order({
      id: updated.id,
      memberId: updated.member_id,
      productId: updated.product_id,
      quantity: updated.quantity,
      unitPriceVND: updated.unit_price_vnd,
      totalVND: updated.total_vnd,
      status: updated.status,
      paymentMethod: updated.payment_method,
      paymentStatus: updated.payment_status,
      paymentReference: updated.payment_reference,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    });
  }

  static async delete(db, id) {
    return await db.deleteOrder(id);
  }

  static async markPaid(db, orderId, paymentReference, paymentMethod, actorId) {
    const order = await Order.findById(db, orderId);
    if (!order) return null;
    if (order.paymentStatus === 'paid') return order;
    if (order.status === 'cancelled' || order.status === 'refunded') {
      throw new Error(`Cannot mark paid from ${order.status}`);
    }
    return await Order.update(db, orderId, {
      paymentStatus: 'paid',
      paymentReference: paymentReference || order.paymentReference,
      status: 'confirmed'
    });
  }

  static async seedIfEmpty(db) {
    const existing = await db.listOrders({ limit: 1 });
    const rows = existing.results || existing;
    if (rows.length > 0) return;

    // Reference real member ids — Member.seedIfEmpty runs first and assigns
    // UUIDs, so hardcoding 'admin-001' / 'pilot-001' here would violate the
    // orders.member_id foreign key. Query the members table instead.
    const members = (await db.listMembers({ limit: 4 })).results || [];
    const seeds = [
      { productId: 'health-active', quantity: 1, unitPriceVND: 1500000, status: 'delivered', paymentMethod: 'cod', paymentStatus: 'paid' },
      { productId: 'trial-pack', quantity: 2, unitPriceVND: 500000, status: 'confirmed', paymentMethod: 'bank_transfer', paymentStatus: 'paid' },
      { productId: 'combo-pack', quantity: 1, unitPriceVND: 3500000, status: 'shipped', paymentMethod: 'momo', paymentStatus: 'paid' },
      { productId: 'ctv-bundle', quantity: 1, unitPriceVND: 5000000, status: 'pending', paymentMethod: 'vnpay', paymentStatus: 'pending' }
    ];

    for (let i = 0; i < seeds.length; i++) {
      await Order.create(db, { ...seeds[i], memberId: members[i]?.id || null });
    }
  }
}

// In-memory fallback store, used when no D1 database is configured
let orderStore = [];

function initStore() {
  // Orders are seeded via Order.seedIfEmpty(db) at DB level; no in-memory seeds by default
}

function setStore(newOrders) {
  orderStore.length = 0;
  if (newOrders && Array.isArray(newOrders)) {
    orderStore.push(...newOrders);
  }
  return orderStore;
}

function useDb() {
  return !!global.db;
}

function db() {
  return global.db;
}

// Helper functions mirroring the members/leads API surface.
// The orders API handler calls these by name without threading db through,
// so they resolve the active adapter from global.db at call time.
async function allOrders() {
  if (useDb()) return await Order.findAll(db());
  return [...orderStore];
}

function findById(id) {
  if (useDb()) return Order.findById(db(), id);
  return orderStore.find(o => o.id === id) || null;
}

async function findByLeadId(leadId) {
  if (useDb()) return await Order.findAll(db(), { leadId });
  return orderStore.filter(o => o.leadId === leadId);
}

function createOrder(data) {
  const order = new Order(data);
  order.recalculate();
  if (useDb()) return Order.create(db(), data);
  orderStore.push(order);
  return order;
}

function updateOrder(id, data) {
  if (useDb()) return Order.update(db(), id, data);
  const idx = orderStore.findIndex(o => o.id === id);
  if (idx === -1) return null;
  Object.assign(orderStore[idx], data);
  return orderStore[idx];
}

function deleteOrder(id) {
  if (useDb()) return Order.delete(db(), id);
  const idx = orderStore.findIndex(o => o.id === id);
  if (idx === -1) return false;
  orderStore.splice(idx, 1);
  return true;
}

function resetStore() {
  orderStore = [];
}

module.exports = {
  Order,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  PRODUCT_TIERS,
  TIER_LABELS,
  allOrders,
  findById,
  findByLeadId,
  createOrder,
  updateOrder,
  deleteOrder,
  markPaid: (orderId, paymentReference, paymentMethod, actorId) =>
    useDb() ? Order.markPaid(db(), orderId, paymentReference, paymentMethod, actorId) : (() => {
      const order = orderStore.find(o => o.id === orderId);
      if (!order) return null;
      if (order.paymentStatus === 'paid') return order;
      if (order.status === 'cancelled' || order.status === 'refunded') {
        throw new Error(`Cannot mark paid from ${order.status}`);
      }
      order.paymentStatus = 'paid';
      order.paymentReference = paymentReference || order.paymentReference;
      order.status = 'confirmed';
      return order;
    })(),
  resetStore,
  initStore,
  getStore: () => orderStore,
};