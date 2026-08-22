/**
 * Order model — Funnel OS
 * Represents a product purchase with commission tracking
 * Uses DatabaseAdapter for D1 persistence
 *
 * Backward-compatible barrel. Implementation split across:
 *   src/models/order/constants.js   — enums + uid helper
 *   src/models/order/order.js       — Order class, serialization, transitions
 *   src/models/order/db-ops.js      — DatabaseAdapter-backed CRUD + markPaid
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

const { Order } = require('./order');

function isoNow() {
  return new Date().toISOString();
}

// ─── In-memory store fallback (no DB configured) ───
const orderStore = [];

function useDb() {
  return !!(global.db && global.db.listOrders);
}

function db() {
  return global.db;
}

// ─── Database-backed operations ───
const dbOps = require('./db-ops');

Order.findById = async (db, id) => dbOps.findById(db, id);
Order.findAll = async (db, filters = {}) => dbOps.findAll(db, filters);
Order.create = async (db, data) => dbOps.create(db, data);
Order.update = async (db, id, data) => dbOps.update(db, id, data);
Order.delete = async (db, id) => dbOps.deleteOrder(db, id);
Order.markPaid = async (db, orderId, paymentReference, paymentMethod, actorId) =>
  dbOps.markPaid(db, orderId, paymentReference, paymentMethod, actorId);

Order.seedIfEmpty = async (db) => {
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
    const seed = seeds[i];
    const member = members[i % members.length];
    if (!member) continue;
    await dbOps.create(db, {
      ...seed,
      memberId: member.id,
      productName: seed.productId,
      productTier: seed.paymentStatus === 'paid' ? 2 : 1
    });
  }
};

// ─── Public API (mirrors original exports) ───

async function allOrders() {
  if (useDb()) return Order.findAll(db());
  return [...orderStore];
}

const findById = async (id) => useDb() ? Order.findById(db(), id) : orderStore.find(o => o.id === id) || null;

const findByLeadId = async (leadId) => {
  if (useDb()) {
    const results = await db.listOrders({ lead_id: leadId });
    const rows = results.results || results;
    return (rows || []).map(row => new Order({
      id: row.id,
      memberId: row.member_id,
      productId: row.product_id,
      productName: row.product_name,
      productTier: row.product_tier,
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
  return orderStore.filter(o => o.leadId === leadId);
};

const createOrder = async (data) => {
  const order = new Order(data);
  order.recalculate();
  if (useDb()) {
    return Order.create(db(), data);
  }
  orderStore.push(order);
  return order;
};

const updateOrder = async (id, data) => {
  if (useDb()) return Order.update(db(), id, data);
  const order = orderStore.find(o => o.id === id);
  if (!order) return null;
  Object.assign(order, data);
  order.recalculate();
  return order;
};

const deleteOrder = async (id) => {
  if (useDb()) return Order.delete(db(), id);
  const idx = orderStore.findIndex(o => o.id === id);
  if (idx === -1) return null;
  return orderStore.splice(idx, 1)[0];
};

const markPaid = (orderId, paymentReference, paymentMethod, actorId) =>
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
  })();

const resetStore = () => { orderStore.length = 0; };

module.exports = {
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
  markPaid,
  resetStore,
  Order
};