const express = require('express');
const router = express.Router();
const { getCustomersFast, getCustomerByIdFast } = require('../controllers/customer-fast.controller');

// Ultra-fast routes with order count filtering
// GET /api/customers-fast - Get all customers with pagination and order count (ULTRA-OPTIMIZED)
// Query parameters: 
//   - page (default: 1), limit (default: 10)
//   - orderCount: exact number of orders (e.g., ?orderCount=0 for customers with no orders)
//   - minOrders: minimum number of orders (e.g., ?minOrders=1)
//   - maxOrders: maximum number of orders (e.g., ?maxOrders=5)
//   - hasOrders: true/false for customers with/without orders (e.g., ?hasOrders=false)
// Examples: 
//   /api/customers-fast?orderCount=0 (customers with no orders)
//   /api/customers-fast?minOrders=1&maxOrders=5 (customers with 1-5 orders)
//   /api/customers-fast?hasOrders=true (customers with at least one order)
router.get('/', getCustomersFast);

// GET /api/customers-fast/no-orders - LIGHTNING FAST for customers with 0 orders (most common query)
// router.get('/no-orders', getCustomersWithNoOrders);

// GET /api/customers-fast/:id - Get single customer with orders (ULTRA-OPTIMIZED)
router.get('/:id', getCustomerByIdFast);

module.exports = router;
