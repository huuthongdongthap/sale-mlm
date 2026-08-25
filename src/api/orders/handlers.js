/**
 * Orders API — route handlers
 */
const { requireRole, isSystemAdmin } = require('../../middleware/requireRole');
const {
  allOrders,
  findById,
  findByLeadId,
  updateOrder,
  deleteOrder,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  markPaid,
} = require('../../models/order');
const { parseQuery, filterOrders, paginate } = require('./query');
const {
  validateCreateOrder,
  buildOrderPayload,
  createOrder,
} = require('./create');

function registerOrders(app) {
  // GET /api/orders — list with filters & pagination
  app.get('/api/orders', requireRole(['Member', 'PSN Leader', 'Core Leader', 'Admin']), async (req, res) => {
    try {
      const filters = parseQuery(req.query);

      // Org scoping - system admin sees all, others see only their org
      let orders = await allOrders();
      if (!isSystemAdmin(req.user)) {
        orders = orders.filter(o => o.orgId === req.user.orgId);
      }

      const filtered = filterOrders(orders, filters);
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

      // Org isolation - non system admins cannot view orders of other orgs
      if (!isSystemAdmin(req.user) && order.orgId !== req.user.orgId) {
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
      try {
        validateCreateOrder(req.body);
      } catch (err) {
        return res.status(400).json({ error: err.message, code: err.code });
      }

      // createOrder is async when the DB adapter is active — await so the
      // resolved Order (not a pending Promise) is serialized below.
      const payload = buildOrderPayload(req.body);
      payload.orgId = isSystemAdmin(req.user) ? null : req.user.orgId;
      const order = await createOrder(payload);

      res.status(201).json({ order: order.toJSON() });
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

      // Org isolation - non system admins cannot update orders of other orgs
      if (!isSystemAdmin(req.user) && order.orgId !== req.user.orgId) {
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

      // Check org access first
      const order = findById(orderId);
      if (!order) return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
      if (!isSystemAdmin(req.user) && order.orgId !== req.user.orgId) {
        return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
      }

      // markPaid is async when the DB adapter is active — await the
      // resolved Order before serializing.
      const updated = await markPaid(orderId, paymentReference, paymentMethod, req.user?.id);
      if (!updated) return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
      res.json({ order: updated.toJSON() });
    } catch (err) {
      res.status(400).json({ error: err.message, code: 'MARK_PAID_FAILED' });
    }
  });

  // DELETE /api/orders/:id — admin only
  app.delete('/api/orders/:id', requireRole(['Admin']), async (req, res) => {
    try {
      const order = findById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
      }

      // Org isolation - non system admins cannot delete orders of other orgs
      if (!isSystemAdmin(req.user) && order.orgId !== req.user.orgId) {
        return res.status(404).json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' });
      }

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
      // Org scoping
      let orders = await findByLeadId(req.params.leadId);
      if (!isSystemAdmin(req.user)) {
        orders = orders.filter(o => o.orgId === req.user.orgId);
      }
      res.json({ orders: orders.map(o => o.toJSON()) });
    } catch (err) {
      res.status(500).json({ error: err.message, code: 'LEAD_ORDERS_FETCH_FAILED' });
    }
  });

  return app; // return modified app for chaining
}

module.exports = { registerOrders };