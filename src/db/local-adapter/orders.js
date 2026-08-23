/**
 * LocalDatabaseAdapter — Orders table operations
 */

const crypto = require('crypto');

function bindRun(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.run();
}
function bindAll(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.all();
}
function bindFirst(stmt, ...params) {
  if (params.length) stmt.bind(...params);
  return stmt.get();
}

class OrdersOps {
  constructor(db) {
    this.db = db;
  }

  async createOrder(data) {
    const totalVND = Math.round((data.unitPriceVND || 0) * (data.quantity || 1));
    bindRun(this.db.prepare("INSERT INTO orders (id, member_id, product_id, product_name, product_tier, quantity, unit_price_vnd, total_vnd, status, payment_method, payment_status, payment_reference, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(
      data.id, data.memberId || null, data.productId || null,
      data.productName || null, data.productTier || null,
      data.quantity || 1, data.unitPriceVND || 0, totalVND,
      data.status || 'pending', data.paymentMethod || 'cod',
      data.paymentStatus || 'pending', data.paymentReference || null,
      new Date().toISOString(), new Date().toISOString()
    ));
    return this.getOrder(data.id);
  }

  async getOrder(id) {
    return bindFirst(this.db.prepare("SELECT * FROM orders WHERE id = ?").bind(id));
  }

  async listOrders(filters = {}) {
    let sql = "SELECT * FROM orders WHERE 1=1";
    const params = [];
    if (filters.memberId) { sql += " AND member_id = ?"; params.push(filters.memberId); }
    if (filters.status) { sql += " AND status = ?"; params.push(filters.status); }
    if (filters.paymentStatus) { sql += " AND payment_status = ?"; params.push(filters.paymentStatus); }
    if (filters.productTier) { sql += " AND product_tier = ?"; params.push(filters.productTier); }
    sql += " ORDER BY created_at DESC";
    if (filters.limit) { sql += " LIMIT ?"; params.push(filters.limit); }
    if (filters.offset) { sql += " OFFSET ?"; params.push(filters.offset); }
    return bindAll(this.db.prepare(sql), ...params);
  }

  async updateOrder(id, data) {
    const fields = [];
    const params = [];
    if (data.status !== undefined) { fields.push("status = ?"); params.push(data.status); }
    if (data.paymentStatus !== undefined) { fields.push("payment_status = ?"); params.push(data.paymentStatus); }
    if (data.paymentReference !== undefined) { fields.push("payment_reference = ?"); params.push(data.paymentReference); }
    if (data.quantity !== undefined) { fields.push("quantity = ?"); params.push(data.quantity); }
    if (data.totalVND !== undefined) { fields.push("total_vnd = ?"); params.push(data.totalVND); }
    fields.push("updated_at = ?");
    params.push(new Date().toISOString(), id);
    bindRun(this.db.prepare(`UPDATE orders SET ${fields.join(", ")} WHERE id = ?`), ...params);
    // Return the updated row so model wrappers can rehydrate the Order.
    return this.getOrder(id);
  }

  async deleteOrder(id) {
    return bindRun(this.db.prepare("DELETE FROM orders WHERE id = ?").bind(id));
  }

  async clearOrders() {
    return bindRun(this.db.prepare("DELETE FROM orders"));
  }
}

module.exports = { OrdersOps };