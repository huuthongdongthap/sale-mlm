/**
 * Order DB operations — wraps DatabaseAdapter rows into Order instances.
 * Shared by both D1 and local adapters.
 */

const { Order } = require('./order');

function rowToOrder(row) {
  if (!row) return null;
  return new Order({
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
  });
}

async function findById(db, id) {
  const row = await db.getOrder(id);
  return rowToOrder(row);
}

async function findAll(db, filters = {}) {
  const results = await db.listOrders(filters);
  const rows = results.results || results;
  return (rows || []).map(rowToOrder);
}

async function create(db, data) {
  const order = new Order(data);
  order.recalculate();
  const created = await db.createOrder({
    id: order.id,
    memberId: order.memberId,
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
  return rowToOrder(created);
}

async function update(db, id, data) {
  const updateData = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
  if (data.paymentReference !== undefined) updateData.paymentReference = data.paymentReference;
  if (data.quantity !== undefined) updateData.quantity = data.quantity;
  if (data.totalVND !== undefined) updateData.totalVND = data.totalVND;
  const updated = await db.updateOrder(id, updateData);
  return rowToOrder(updated);
}

async function deleteOrder(db, id) {
  return await db.deleteOrder(id);
}

async function markPaid(db, orderId, paymentReference, paymentMethod, actorId) {
  const order = await findById(db, orderId);
  if (!order) return null;
  if (order.paymentStatus === 'paid') return order;
  if (order.status === 'cancelled' || order.status === 'refunded') {
    throw new Error(`Cannot mark paid from ${order.status}`);
  }
  return await update(db, orderId, {
    paymentStatus: 'paid',
    paymentReference,
    status: 'confirmed'
  });
}

module.exports = {
  rowToOrder,
  findById,
  findAll,
  create,
  update,
  deleteOrder,
  markPaid
};