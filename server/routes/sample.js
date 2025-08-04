const express = require('express');
const router = express.Router();
const { createSampleCustomers, createSampleOrders } = require('../controllers/sample.controller');

// POST /api/sample/customers - Create sample customers
router.post('/customers', createSampleCustomers);

// POST /api/sample/orders - Create sample orders
router.post('/orders', createSampleOrders);

module.exports = router;
