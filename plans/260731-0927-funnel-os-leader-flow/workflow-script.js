export const meta = {
  name: 'funnel-os-leader-revenue-flow',
  description: 'Build the complete Funnel OS operational flow so a leader can generate revenue in Droppii',
  phases: [
    { title: 'Backend endpoints', detail: 'Add mark-paid, wire transition/assign in server' },
    { title: 'Funnel dashboard UI', detail: 'Fix runtime SVG bug, make API base configurable, add action buttons' },
    { title: 'Verify', detail: 'Smoke-test route + API contract + syntax' }
  ]
};

phase('Backend endpoints');

// 1) Add mark-paid endpoint to orders API
const markPaidInOrders = await agent('Read src/api/orders.js and add a new route handler to export a markPaid function that marks an order as paid/confirmed with validation. The function should: accept orderId + paymentReference + paymentMethod, find order by id, validate status must be pending, set paymentStatus=paid, status=confirmed, paymentReference, updatedAt, log transition in metadata.transitions, return updated order JSON. Export the function alongside existing module.exports.', {
  label: 'orders-mark-paid',
  phase: 'Backend endpoints',
  effort: 'medium',
  agentType: 'fullstack-developer'
});

// 2) Wire the new route in server.js
const wireOrders = await agent('Read src/server.js and add: app.post("/api/orders/mark-paid", verify, requireRole(["admin", "manager", "ctv"]), async (req, res) => { ... }) that calls the markPaid function from ./api/orders. Also verify server.js already mounts the leads transition/assign endpoints (POST /api/leads/:id/assign and POST /api/leads/:id/transition from router file). If missing, add them. Return the exact lines added.', {
  label: 'server-wire',
  phase: 'Backend endpoints',
  effort: 'medium',
  agentType: 'fullstack-developer'
});

// 3) Verify leads transition/assign endpoints exist
const leadsEndpoints = await agent('Check src/api/leads.js has POST /:id/assign and POST /:id/transition handlers that change assignedCtvId and funnelLevel respectively. If either is missing, add minimal handlers. Report status.', {
  label: 'leads-endpoints-check',
  phase: 'Backend endpoints',
  effort: 'low',
  agentType: 'Explore'
});

phase('Funnel dashboard UI');

// 4) Fix the runtime SVG bug and API base in funnel-view.js
const fixFunnelUI = await agent('Fix src/dashboard/funnel-view.js: (a) Replace all inline SVG path data that contains XML entity "&" with "and" (the template literal is JS, not HTML — "&" will throw a parse error at runtime). (b) Replace hardcoded apiBase with window.location.origin || location.origin fallback so it works on localhost and deployed worker. (c) Wrap page chrome in .page-header div for consistent spacing matching other pages. Report exact changes.', {
  label: 'funnel-ui-fix',
  phase: 'Funnel dashboard UI',
  effort: 'medium',
  agentType: 'fullstack-developer'
});

// 5) Add action buttons to funnel view for leader revenue actions
const funnelActions = await agent('Enhance src/dashboard/funnel-view.js to add 3 action buttons at the bottom: (a) "Chuyển tier" for each lead row that calls POST /api/leads/:id/transition with toLevel + actorId from auth token, (b) "Tạo đơn" that opens a mini form creating an order via POST /api/orders with productName/productTier/qty/price pre-filled by tier, (c) "Xác nhận thanh toán" button on pending orders calling POST /api/orders/mark-paid. Keep it simple — no new files, just extend the existing render function. Return the new button HTML and event handling code.', {
  label: 'funnel-action-buttons',
  phase: 'Funnel dashboard UI',
  effort: 'high',
  agentType: 'fullstack-developer'
});

phase('Verify');

// 6) Final smoke check
const smoke = await agent('Run: (1) node --check src/api/orders.js, (2) node --check src/api/leads.js, (3) node --check src/api/alerts.js, (4) node --check src/server.js, (5) grep src/server.js for "mark-paid" and ":id/transition" and ":id/assign", (6) grep src/dashboard/funnel-view.js for "window.location.origin" and confirm NO "&" remains in SVG path data. Report pass/fail for each.', {
  label: 'final-smoke',
  phase: 'Verify',
  effort: 'low',
  agentType: 'shell-runner-agent'
});
