/**
 * KPI API — composition barrel
 */
const express = require('express');
const { registerKpiRoutes } = require('./handlers');

const router = express.Router();
registerKpiRoutes(router);

module.exports = router;