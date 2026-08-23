/**
 * Rate limiting middleware — production hardening.
 * Disabled in dev/test so local runs and the Jest suite are never throttled.
 * Auth routes are the strictest tier.
 */
const rateLimit = require('express-rate-limit');

const isDevOrTest = process.env.NODE_ENV !== 'production';

const baseOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: { error: 'Too many requests, please try again later', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevOrTest,
};

const authLimiter = rateLimit({
  ...baseOptions,
  max: 10, // 10 requests per window per IP
});

const apiLimiter = rateLimit({
  ...baseOptions,
  max: 100, // 100 requests per window per IP
});

const webhookLimiter = rateLimit({
  ...baseOptions,
  max: 50, // 50 requests per window per IP
  skip: () => isDevOrTest,
});

module.exports = { authLimiter, apiLimiter, webhookLimiter };