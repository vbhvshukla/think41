const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById } = require('../controllers/customer.controller');

// GET /api/customers - Get all customers with pagination and order count
// Query parameters: 
//   - page (default: 1), limit (default: 10)
//   - orderCount: exact number of orders (e.g., ?orderCount=0 for customers with no orders)
//   - minOrders: minimum number of orders (e.g., ?minOrders=1)
//   - maxOrders: maximum number of orders (e.g., ?maxOrders=5)
//   - hasOrders: true/false for customers with/without orders (e.g., ?hasOrders=false)
// Examples: 
//   /api/customers?orderCount=0 (customers with no orders)
//   /api/customers?minOrders=1&maxOrders=5 (customers with 1-5 orders)
//   /api/customers?hasOrders=true (customers with at least one order)
router.get('/', getCustomers);

// GET /api/customers/:id - Get single customer with orders
router.get('/:id', getCustomerById);

module.exports = router;
