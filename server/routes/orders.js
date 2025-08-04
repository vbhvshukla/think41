const express = require('express');
const router = express.Router();
const { 
    getCustomerOrdersFast, 
    getAllOrdersFast, 
    getOrderAnalytics 
} = require('../controllers/orders.controller');

// GET /api/orders - Get all orders with customer and product details
// Query parameters: page, limit, status (optional)
// Example: /api/orders?page=1&limit=5&status=Shipped
router.get('/', getAllOrdersFast);

// GET /api/orders/analytics - Get order summary and analytics
router.get('/analytics', getOrderAnalytics);

// GET /api/orders/customer/:customerId - Get specific customer's orders with full details
// Query parameters: page, limit
// Example: /api/orders/customer/457?page=1&limit=5
router.get('/customer/:customerId', getCustomerOrdersFast);

module.exports = router;
