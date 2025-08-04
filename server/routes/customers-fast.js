const express = require('express');
const router = express.Router();
const { getCustomersFast, getCustomerByIdFast } = require('../controllers/customer-fast.controller');

// Ultra-fast routes
// GET /api/customers-fast - Get all customers with pagination and order count (OPTIMIZED)
router.get('/', getCustomersFast);

// GET /api/customers-fast/:id - Get single customer with orders (OPTIMIZED)
router.get('/:id', getCustomerByIdFast);

module.exports = router;
