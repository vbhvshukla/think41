const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById } = require('../controllers/customer.controller');

// GET /api/customers - Get all customers with pagination and order count
// Query parameters: page (default: 1), limit (default: 10)
// Example: /api/customers?page=1&limit=5
router.get('/', getCustomers);

// GET /api/customers/:id - Get single customer with orders
router.get('/:id', getCustomerById);

module.exports = router;
