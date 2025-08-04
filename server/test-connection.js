const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connection successful');
    console.log('Database:', mongoose.connection.name);
    
    // Test data access
    const customersCount = await mongoose.connection.db.collection('customers').countDocuments();
    const ordersCount = await mongoose.connection.db.collection('orders').countDocuments();
    
    console.log(`📊 Customers: ${customersCount}`);
    console.log(`📦 Orders: ${ordersCount}`);
    
    // Test a simple aggregation query
    const sampleCustomer = await mongoose.connection.db.collection('customers').findOne();
    console.log('📄 Sample customer:', {
      id: sampleCustomer.id,
      name: `${sampleCustomer.first_name} ${sampleCustomer.last_name}`,
      email: sampleCustomer.email
    });
    
    await mongoose.connection.close();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testConnection();
