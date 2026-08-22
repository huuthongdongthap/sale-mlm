/**
 * Orders API — query parsing, filtering, pagination
 */
const {
  allOrders,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PRODUCT_TIERS,
} = require('../../models/order');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

function parseQuery(query) {
  const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
  const status = ORDER_STATUSES.includes(query.status) ? query.status : null;
  const paymentStatus = PAYMENT_STATUSES.includes(query.payment_status) ? query.paymentStatus : null;
  const tier = PRODUCT_TIERS.includes(parseInt(query.tier)) ? parseInt(query.tier) : null;
  const ctvId = query.ctv_id || null;
  const leadId = query.lead_id || null;
  const search = query.search ? query.search.trim().toLowerCase() : null;
  return { page, limit, status, paymentStatus, tier, ctvId, leadId, search };
}

function filterOrders(orders, filters) {
  let result = [...orders];

  if (filters.status) {
    result = result.filter(o => o.status === filters.status);
  }
  if (filters.paymentStatus) {
    result = result.filter(o => o.paymentStatus === filters.paymentStatus);
  }
  if (filters.tier != null) {
    result = result.filter(o => o.productTier === filters.tier);
  }
  if (filters.ctvId) {
    result = result.filter(o => o.metadata?.ctvId === filters.ctvId);
  }
  if (filters.leadId) {
    result = result.filter(o => o.leadId === filters.leadId);
  }
  if (filters.search) {
    const q = filters.search;
    result = result.filter(o =>
      (o.leadName?.toLowerCase().includes(q)) ||
      (o.leadEmail?.toLowerCase().includes(q)) ||
      (o.leadPhone?.includes(q)) ||
      (o.productName?.toLowerCase().includes(q)) ||
      (o.id?.includes(q))
    );
  }

  // Sort by createdAt desc
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return result;
}

function paginate(array, page, limit) {
  const total = array.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const items = array.slice(start, start + limit);
  return { items, total, page, limit, totalPages };
}

module.exports = { parseQuery, filterOrders, paginate, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT };