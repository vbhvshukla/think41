const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db.config');
const User = require('./models/User');

// Import routes
const customerRoutes = require('./routes/customers');
const customersFastRoutes = require('./routes/customers-fast');
const sampleRoutes = require('./routes/sample');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5550;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/customers-fast', customersFastRoutes);
app.use('/api/sample', sampleRoutes);

// In-memory data store (for demo purposes)
let users = [
  {
    id: 1,
    name: 'Demo User',
    email: 'demo@think41.com',
    password: 'password123',
    role: 'user'
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Think41 API Server is running!',
    info: 'This is a demo API server using Express.js and MongoDB',
    endpoints: {
      customers: {
        'GET /api/customers': 'Get all customers with pagination and order count (OPTIMIZED)',
        'GET /api/customers/:id': 'Get single customer with order details (OPTIMIZED)'
      },
      customers_ultra_fast: {
        'GET /api/customers-fast': 'Get all customers with pagination and order count (ULTRA-FAST)',
        'GET /api/customers-fast/:id': 'Get single customer with order details (ULTRA-FAST)'
      },
      sample_data: {
        'POST /api/sample/customers': 'Create sample customers',
        'POST /api/sample/orders': 'Create sample orders'
      },
      users: {
        'GET /api/users': 'Get all users',
        'POST /api/users': 'Create new user'
      }
    }
  });
});

// Get all users from MongoDB using Mongoose
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Add a new user to MongoDB using Mongoose
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const newUser = new User({ name, email });
    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: savedUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Think41 Server is running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}`);
});
