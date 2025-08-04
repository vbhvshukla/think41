// Ultra-fast customer controller using native MongoDB driver
const mongoose = require('mongoose');

const getCustomersFast = async (req, res) => {
    try {
        console.log("🚀 Starting ultra-fast customer fetch...");
        const startTime = Date.now();
        
        // Extract pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get native MongoDB collection (bypasses Mongoose overhead)
        const db = mongoose.connection.db;
        const customersCollection = db.collection('customers');
        const ordersCollection = db.collection('orders');

        // Use Promise.all for parallel execution
        const [customers, totalCount] = await Promise.all([
            // Get paginated customers
            customersCollection.find({}, {
                projection: { id: 1, first_name: 1, last_name: 1, email: 1 }
            })
            .sort({ id: 1 })
            .skip(skip)
            .limit(limit)
            .toArray(),
            
            // Get total count in parallel
            customersCollection.countDocuments()
        ]);

        // Get order counts for the fetched customers only
        const customerIds = customers.map(c => c.id);
        const orderCounts = await ordersCollection.aggregate([
            { $match: { user_id: { $in: customerIds } } },
            { $group: { _id: '$user_id', count: { $sum: 1 } } }
        ]).toArray();

        // Create a map for quick lookup
        const orderCountMap = {};
        orderCounts.forEach(item => {
            orderCountMap[item._id] = item.count;
        });

        // Enrich customers with order counts
        const enrichedCustomers = customers.map(customer => ({
            _id: customer._id,
            id: customer.id,
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email,
            full_name: `${customer.first_name} ${customer.last_name}`,
            order_count: orderCountMap[customer.id] || 0
        }));

        // Calculate pagination info
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        const endTime = Date.now();
        console.log(`⚡ Ultra-fast fetch: ${enrichedCustomers.length} customers in ${endTime - startTime}ms`);

        return res.status(200).json({
            success: true,
            data: {
                customers: enrichedCustomers,
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_customers: totalCount,
                    per_page: limit,
                    has_next_page: hasNextPage,
                    has_prev_page: hasPrevPage
                }
            },
            performance: {
                execution_time_ms: endTime - startTime,
                method: "ultra-fast-native-mongodb",
                total_customers: totalCount
            }
        });

    } catch (error) {
        console.error('❌ Error in ultra-fast fetch:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching customers',
            error: error.message
        });
    }
};

// Super optimized single customer fetch
const getCustomerByIdFast = async (req, res) => {
    try {
        const startTime = Date.now();
        const customerId = parseInt(req.params.id);
        
        const db = mongoose.connection.db;
        
        // Use Promise.all for parallel queries
        const [customer, orders] = await Promise.all([
            db.collection('customers').findOne({ id: customerId }),
            db.collection('orders').find({ user_id: customerId }).toArray()
        ]);
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        const endTime = Date.now();

        res.status(200).json({
            success: true,
            data: {
                customer: {
                    _id: customer._id,
                    id: customer.id,
                    first_name: customer.first_name,
                    last_name: customer.last_name,
                    full_name: `${customer.first_name} ${customer.last_name}`,
                    email: customer.email,
                    order_count: orders.length
                },
                orders: orders
            },
            performance: {
                execution_time_ms: endTime - startTime,
                method: "ultra-fast-parallel-queries"
            }
        });

    } catch (error) {
        console.error('❌ Error fetching customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer',
            error: error.message
        });
    }
};

module.exports = {
    getCustomersFast,
    getCustomerByIdFast
};
