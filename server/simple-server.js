const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5550;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected:', mongoose.connection.host);
    console.log('📊 Database:', mongoose.connection.name);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Think41 API Server is running!',
    info: 'Connected to local MongoDB with imported CSV data',
    endpoints: {
      'GET /api/customers': 'Get customers with pagination and order count',
      'GET /api/customers/:id': 'Get single customer with orders',
      'GET /api/test': 'Test data access'
    }
  });
});

// Test data access
app.get('/api/test', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    
    const customersCount = await db.collection('customers').countDocuments();
    const ordersCount = await db.collection('orders').countDocuments();
    const sampleCustomer = await db.collection('customers').findOne();
    
    res.json({
      success: true,
      data: {
        customers_count: customersCount,
        orders_count: ordersCount,
        sample_customer: {
          id: sampleCustomer.id,
          name: `${sampleCustomer.first_name} ${sampleCustomer.last_name}`,
          email: sampleCustomer.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Customers API with aggregation pipeline
app.get('/api/customers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const db = mongoose.connection.db;
    
    // Aggregation pipeline for customers with order count
    const pipeline = [
      {
        $project: {
          _id: 1,
          id: 1,
          first_name: 1,
          last_name: 1,
          email: 1
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'id',
          foreignField: 'user_id',
          as: 'orders',
          pipeline: [{ $project: { _id: 1 } }]
        }
      },
      {
        $addFields: {
          full_name: { $concat: ['$first_name', ' ', '$last_name'] },
          order_count: { $size: '$orders' }
        }
      },
      {
        $project: {
          _id: 1,
          id: 1,
          first_name: 1,
          last_name: 1,
          email: 1,
          full_name: 1,
          order_count: 1
        }
      },
      { $sort: { id: 1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const customers = await db.collection('customers').aggregate(pipeline).toArray();
    const totalCustomers = await db.collection('customers').countDocuments();
    
    const totalPages = Math.ceil(totalCustomers / limit);
    
    res.json({
      success: true,
      data: {
        customers: customers,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_customers: totalCustomers,
          per_page: limit,
          has_next_page: page < totalPages,
          has_prev_page: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
});

// Single customer API
app.get('/api/customers/:id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const db = mongoose.connection.db;
    
    const pipeline = [
      { $match: { id: customerId } },
      {
        $lookup: {
          from: 'orders',
          localField: 'id',
          foreignField: 'user_id',
          as: 'orders'
        }
      },
      {
        $addFields: {
          full_name: { $concat: ['$first_name', ' ', '$last_name'] },
          order_count: { $size: '$orders' }
        }
      },
      {
        $project: {
          customer: {
            _id: '$_id',
            id: '$id',
            first_name: '$first_name',
            last_name: '$last_name',
            full_name: '$full_name',
            email: '$email',
            order_count: '$order_count'
          },
          orders: '$orders'
        }
      }
    ];

    const result = await db.collection('customers').aggregate(pipeline).toArray();
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: result[0]
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Think41 Server is running on port ${PORT}`);
  console.log(`🌐 API available at: http://localhost:${PORT}`);
  console.log(`📊 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`👥 Customers endpoint: http://localhost:${PORT}/api/customers`);
});

module.exports = app;
