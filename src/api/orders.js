/**
 * Orders API — Funnel OS
 * Handles: GET /api/orders, GET /api/orders/:id, POST /api/orders, PATCH /api/orders/:id
 */

const { verify } = require('../auth/jwt');
const { requireRole } = require('../middleware/requireRole');
const {
  allOrders,
  findById,
  findByLeadId,
  createOrder,
  updateOrder,
  deleteOrder,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
 PAYMENT_METHODS,
  PRODUCT_TIERS,
  TIER_LABELS,
  markPaid,
} = require('../models/order');

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

async function handler(appOrReq, envOrRes) {
  // Detect if called as Express-style middleware (app, env) or as a route module (req, res)
  if (appOrReq && appOrReq.use) {
    // Express app passed — register routes
    const app = appOrReq;
    const env = envOrRes || process.env;

    // GET /api/orders — list with filters & pagination
    app.get('/api/orders', requireRole(['Member', 'PSN Leader', 'Core Leader', 'Admin']), async (req, res) => {
      try {
        const filters = parseQuery(req.query);
        const filtered = filterOrders(allOrders(), filters);
        const paginated = paginate(filtered, filters.page, filters.limit);

        res.json({
          orders: paginated.items.map(o => o.toJSON()),
          pagination: {
            page: paginated.page,
            limit: paginated.limit,
            total: paginated.total,
            totalPages: paginated.totalPages,
          },
          filters: {
            status: filters.status,
            paymentStatus: filters.paymentStatus,
            tier: filters.tier,
            ctvId: filters.ctvId,
            leadId: filters.leadId,
            search: filters.search,
          },
        });
      } catch (err) {
        res.status(500).json({ error: err.message, code: 'ORDERS_LIST_FAILED' });
      }
    });

    // GET /api/orders/:id — single order detail
    app.get('/api/orders/:id', requireRole(['Member', 'PSN Leader', 'Core Leader', 'Admin']), async (req, res) => {
      try {
        const order = findById(req.params.id);
        if (!order) {
          return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
        }
        // Members can only see their own orders (via metadata.ctvId)
        if (req.user.role === 'Member' && order.metadata?.ctvId !== req.user.id) {
          return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
        }
        res.json({ order: order.toJSON_Admin() });
      } catch (err) {
        res.status(500).json({ error: err.message, code: 'ORDER_FETCH_FAILED' });
      }
    });

    // POST /api/orders — create order (checkout flow)
    
app.post('/api/orders', requireRole(['Member', 'PSN Leader', 'Core Leader', 'Admin']), async (req, res) => {
      try {
        const {
          leadId,
          leadName,
          leadEmail,
          leadPhone,
          productId,
          productName,
          productTier,
          quantity,
          unitPriceVND,
          commissionRate,
          paymentMethod,
          shippingAddress,
          notes,
        } = req.body;

        // Minimal validation
        if (!leadId && !leadName) {
          return res.status(400).json({ error: 'leadId or leadName required', code: 'INVALID_LEAD' });
        }
        if (!productName || !PRODUCT_TIERS.includes(productTier)) {
          return res.status(400).json({ error: 'Valid productName and productTier required', code: 'INVALID_PRODUCT' });
        }
        if (!quantity || quantity < 1) {
          return res.status(400).json({ error: 'Quantity must be >= 1', code: 'INVALID_QUANTITY' });
        }
        if (!unitPriceVND || unitPriceVND < 0) {
          return res.status(400).json({ error: 'Valid unitPriceVND required', code: 'INVALID_PRICE' });
        }

        const order = createOrder({
          leadId: leadId || null,
          leadName: leadName || '',
          leadEmail: leadEmail || '',
          leadPhone: leadPhone || '',
          productId: productId || `tier-${productTier}`,
          productName,
          productTier,
          quantity: parseInt(quantity),
          unitPriceVND: parseInt(unitPriceVND),
          commissionRate: commissionRate || (productTier >= 4 ? 25 : productTier >= 3 ? 20 : productTier >= 2 ? 15 : 10),
          paymentMethod: PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : 'cod',
          shippingAddress: shippingAddress || '',
          notes: notes || '',
        });

        console.log('[orders:create] done id=', order?.id); res.status(201).json({ order: order.toJSON() });
      } catch (err) {
        res.status(400).json({ error: err.message, code: 'ORDER_CREATE_FAILED' });
      }
    });

    // PATCH /api/orders/:id — update order (admin/manager only)
    app.patch('/api/orders/:id', requireRole(['Core Leader', 'Admin']), async (req, res) => {
      try {
        const { status, paymentStatus, paymentReference, shippingAddress, notes, commissionRate, metadata } = req.body;
        const order = findById(req.params.id);
        if (!order) {
          return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
        }

        // Status transition
        if (status && ORDER_STATUSES.includes(status)) {
          try {
            order.applyStatus(status, req.user.id);
          } catch (e) {
            return res.status(400).json({ error: e.message, code: 'INVALID_STATUS_TRANSITION' });
          }
        }

        // Payment status
        if (paymentStatus && PAYMENT_STATUSES.includes(paymentStatus)) {
          order.paymentStatus = paymentStatus;
        }

        // Other fields
        if (paymentReference) order.paymentReference = paymentReference;
        if (shippingAddress) order.shippingAddress = shippingAddress;
        if (notes !== undefined) order.notes = notes;
        if (commissionRate !== undefined) {
          order.commissionRate = parseFloat(commissionRate);
          order.recalculate();
        }
        if (metadata) {
          order.metadata = { ...order.metadata, ...metadata };
        }

        order.updatedAt = new Date().toISOString();
        updateOrder(order.id, order);

        res.json({ order: order.toJSON() });
      } catch (err) {
        res.status(400).json({ error: err.message, code: 'ORDER_UPDATE_FAILED' });
      }
    });

// POST /api/orders/mark-paid
app.post('/api/orders/mark-paid', requireRole(['Member', 'PSN Leader', 'Core Leader', 'Admin']), async (req, res) => {
 try {
   const { orderId, paymentReference, paymentMethod } = req.body;
   if (!orderId) return res.status(400).json({ error: 'orderId required', code: 'INVALID_ORDER' });
   const order = markPaid(orderId, paymentReference, paymentMethod, req.user?.id);
   if (!order) return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
   res.json({ order: order.toJSON() });
 } catch (err) {
   res.status(400).json({ error: err.message, code: 'MARK_PAID_FAILED' });
 }
});


// DELETE /api/orders/:id — admin only
    app.delete('/api/orders/:id', requireRole(['Admin']), async (req, res) => {
      try {
        const ok = deleteOrder(req.params.id);
        if (!ok) {
          return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
        }
        res.json({ ok: true });
      } catch (err) {
        res.status(500).json({ error: err.message, code: 'ORDER_DELETE_FAILED' });
      }
    });

    // GET /api/orders/leads/:leadId — orders for a lead
    app.get('/api/orders/leads/:leadId', requireRole(['Member', 'PSN Leader', 'Core Leader', 'Admin']), async (req, res) => {
      try {
        const orders = findByLeadId(req.params.leadId).map(o => o.toJSON());
        res.json({ orders });
      } catch (err) {
        res.status(500).json({ error: err.message, code: 'LEAD_ORDERS_FETCH_FAILED' });
      }
    });

    return app; // return modified app for chaining
  }

  // Fallback: direct (req, res) call — for Workers compatibility
  // Not fully implemented; worker entrypoint should register routes directly
}

module.exports = { handler };