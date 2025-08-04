const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const connectDB = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/project-db', (err) => {
            if (err) {
                console.error('❌ MongoDB connection error:', err);
                reject(err);
            } else {
                console.log('✅ MongoDB connected for index creation');
                resolve();
            }
        });
    });
};

const createIndexes = () => {
    return new Promise((resolve, reject) => {
        try {
            const db = mongoose.connection.db;
            
            console.log('🔧 Creating performance indexes...');
            
            // Create all indexes using promises
            const indexPromises = [];
            
            // CUSTOMERS indexes
            console.log('📝 Creating customer indexes...');
            indexPromises.push(
                db.collection('customers').createIndex({ id: 1 }, { unique: true }),
                db.collection('customers').createIndex({ email: 1 }),
                db.collection('customers').createIndex({ first_name: 1 }),
                db.collection('customers').createIndex({ last_name: 1 })
            );
            
            // ORDERS indexes  
            console.log('📝 Creating order indexes...');
            indexPromises.push(
                db.collection('orders').createIndex({ id: 1 }, { unique: true }),
                db.collection('orders').createIndex({ user_id: 1 }),
                db.collection('orders').createIndex({ order_date: -1 }),
                db.collection('orders').createIndex({ status: 1 }),
                db.collection('orders').createIndex({ user_id: 1, order_date: -1 })
            );
            
            // ORDER_ITEMS indexes
            console.log('📝 Creating order items indexes...');
            indexPromises.push(
                db.collection('order_items').createIndex({ order_id: 1 }),
                db.collection('order_items').createIndex({ product_id: 1 }),
                db.collection('order_items').createIndex({ order_id: 1, product_id: 1 })
            );
            
            // PRODUCTS indexes
            console.log('📝 Creating product indexes...');
            indexPromises.push(
                db.collection('products').createIndex({ id: 1 }, { unique: true }),
                db.collection('products').createIndex({ name: 1 }),
                db.collection('products').createIndex({ category: 1 }),
                db.collection('products').createIndex({ price: 1 })
            );
            
            Promise.all(indexPromises)
                .then(() => {
                    console.log('✅ All indexes created successfully!');
                    
                    // List indexes for verification
                    const collections = ['customers', 'orders', 'order_items', 'products'];
                    const listPromises = collections.map(collectionName => {
                        return db.collection(collectionName).listIndexes().toArray()
                            .then(indexes => {
                                console.log(`\n${collectionName.toUpperCase()}:`);
                                indexes.forEach(index => {
                                    console.log(`  - ${JSON.stringify(index.key)} ${index.unique ? '(UNIQUE)' : ''}`);
                                });
                            });
                    });
                    
                    return Promise.all(listPromises);
                })
                .then(() => {
                    console.log('\n🚀 All performance indexes created successfully!');
                    console.log('🔥 Your queries should now be BLAZING FAST!');
                    resolve();
                })
                .catch(reject);
                
        } catch (error) {
            console.error('❌ Error creating indexes:', error);
            reject(error);
        }
    });
};

// Run the index creation
connectDB()
    .then(() => createIndexes())
    .then(() => {
        console.log('📛 Database connection closing...');
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Script failed:', error);
        mongoose.connection.close();
        process.exit(1);
    });
