// Run this script to create indexes for better performance
// Execute: node create-indexes.js

const mongoose = require('mongoose');
require('dotenv').config();

const createIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Create indexes for customers collection
    await db.collection('customers').createIndex({ id: 1 });
    console.log('✅ Created index on customers.id');
    
    await db.collection('customers').createIndex({ email: 1 });
    console.log('✅ Created index on customers.email');
    
    // Create indexes for orders collection
    await db.collection('orders').createIndex({ user_id: 1 });
    console.log('✅ Created index on orders.user_id');
    
    await db.collection('orders').createIndex({ order_id: 1 });
    console.log('✅ Created index on orders.order_id');
    
    // Compound index for better aggregation performance
    await db.collection('orders').createIndex({ user_id: 1, status: 1 });
    console.log('✅ Created compound index on orders.user_id + status');

    console.log('🎉 All indexes created successfully!');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
};

createIndexes();
