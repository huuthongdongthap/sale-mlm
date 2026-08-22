/**
 * Orders API — POST /api/orders validation & payload assembly
 */
const {
  PRODUCT_TIERS,
  PAYMENT_METHODS,
  createOrder,
} = require('../../models/order');

/**
 * Validate the create-order request body and throw on the first failure.
 * Throws Error with a code-compatible message; the handler wraps it as 400.
 */
function validateCreateOrder(body) {
  const {
    leadId, leadName, productName, productTier, quantity, unitPriceVND,
  } = body || {};

  if (!leadId && !leadName) {
    const err = new Error('leadId or leadName required');
    err.code = 'INVALID_LEAD';
    throw err;
  }
  if (!productName || !PRODUCT_TIERS.includes(productTier)) {
    const err = new Error('Valid productName and productTier required');
    err.code = 'INVALID_PRODUCT';
    throw err;
  }
  if (!quantity || quantity < 1) {
    const err = new Error('Quantity must be >= 1');
    err.code = 'INVALID_QUANTITY';
    throw err;
  }
  if (!unitPriceVND || unitPriceVND < 0) {
    const err = new Error('Valid unitPriceVND required');
    err.code = 'INVALID_PRICE';
    throw err;
  }
}

/**
 * Build the canonical order payload from a validated request body.
 */
function buildOrderPayload(body) {
  const {
    leadId, leadName, leadEmail, leadPhone, productId, productName, productTier,
    quantity, unitPriceVND, commissionRate, paymentMethod, shippingAddress, notes,
  } = body || {};

  return {
    leadId: leadId || null,
    leadName: leadName || '',
    leadEmail: leadEmail || '',
    leadPhone: leadPhone || '',
    productId: productId || `tier-${productTier}`,
    productName,
    productTier,
    quantity: parseInt(quantity),
    unitPriceVND: parseInt(unitPriceVND),
    commissionRate: commissionRate
      || (productTier >= 4 ? 25 : productTier >= 3 ? 20 : productTier >= 2 ? 15 : 10),
    paymentMethod: PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : 'cod',
    shippingAddress: shippingAddress || '',
    notes: notes || '',
  };
}

module.exports = { validateCreateOrder, buildOrderPayload, createOrder };