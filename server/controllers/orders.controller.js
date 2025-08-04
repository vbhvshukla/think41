// Ultra-efficient customer orders controller with all related data
const mongoose = require('mongoose');

// Get customer orders with full product details - ULTRA OPTIMIZED
const getCustomerOrdersFast = async (req, res) => {
    try {
        console.log("🚀 Starting ultra-fast customer orders fetch...");
        const startTime = Date.now();
        
        const { customerId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const db = mongoose.connection.db;

        // Single aggregation pipeline to get everything efficiently
        const pipeline = [
            // Stage 1: Match specific customer's orders
            { $match: { user_id: parseInt(customerId) } },
            
            // Stage 2: Sort by creation date (newest first) and apply pagination
            { $sort: { created_at: -1 } },
            { $skip: skip },
            { $limit: limit },
            
            // Stage 3: Lookup order items for each order
            {
                $lookup: {
                    from: 'order_items',
                    localField: 'order_id',
                    foreignField: 'order_id',
                    as: 'order_items',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'product_id',
                                foreignField: 'id',
                                as: 'product',
                                pipeline: [
                                    {
                                        $project: {
                                            id: 1,
                                            name: 1,
                                            brand: 1,
                                            category: 1,
                                            retail_price: 1,
                                            cost: 1,
                                            department: 1,
                                            sku: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                product: { $arrayElemAt: ['$product', 0] }
                            }
                        },
                        {
                            $project: {
                                id: 1,
                                product_id: 1,
                                inventory_item_id: 1,
                                status: 1,
                                sale_price: 1,
                                created_at: 1,
                                shipped_at: 1,
                                delivered_at: 1,
                                returned_at: 1,
                                product: 1
                            }
                        }
                    ]
                }
            },
            
            // Stage 4: Lookup customer details
            {
                $lookup: {
                    from: 'customers',
                    localField: 'user_id',
                    foreignField: 'id',
                    as: 'customer',
                    pipeline: [
                        {
                            $project: {
                                id: 1,
                                first_name: 1,
                                last_name: 1,
                                email: 1
                            }
                        }
                    ]
                }
            },
            
            // Stage 5: Add computed fields
            {
                $addFields: {
                    customer: { $arrayElemAt: ['$customer', 0] },
                    total_items: { $size: '$order_items' },
                    total_sale_price: {
                        $sum: '$order_items.sale_price'
                    },
                    total_retail_price: {
                        $sum: '$order_items.product.retail_price'
                    }
                }
            },
            
            // Stage 6: Add customer full name
            {
                $addFields: {
                    'customer.full_name': {
                        $concat: ['$customer.first_name', ' ', '$customer.last_name']
                    }
                }
            },
            
            // Stage 7: Final projection
            {
                $project: {
                    _id: 1,
                    order_id: 1,
                    status: 1,
                    created_at: 1,
                    shipped_at: 1,
                    delivered_at: 1,
                    returned_at: 1,
                    num_of_item: 1,
                    total_items: 1,
                    total_sale_price: 1,
                    total_retail_price: 1,
                    customer: 1,
                    order_items: 1
                }
            }
        ];

        // Execute the aggregation
        const orders = await db.collection('orders').aggregate(pipeline).toArray();

        // Get total count for pagination
        const totalOrders = await db.collection('orders').countDocuments({ 
            user_id: parseInt(customerId) 
        });

        const totalPages = Math.ceil(totalOrders / limit);
        const endTime = Date.now();

        console.log(`⚡ Fetched ${orders.length} orders with full details in ${endTime - startTime}ms`);

        return res.status(200).json({
            success: true,
            data: {
                orders: orders,
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_orders: totalOrders,
                    per_page: limit,
                    has_next_page: page < totalPages,
                    has_prev_page: page > 1
                }
            },
            performance: {
                execution_time_ms: endTime - startTime,
                method: "single-aggregation-pipeline",
                customer_id: customerId
            }
        });

    } catch (error) {
        console.error('❌ Error fetching customer orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching customer orders',
            error: error.message
        });
    }
};

// Get all orders with customer and product details - ULTRA OPTIMIZED
const getAllOrdersFast = async (req, res) => {
    try {
        console.log("🚀 Starting ultra-fast all orders fetch...");
        const startTime = Date.now();
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status; // Optional status filter

        const db = mongoose.connection.db;

        // Build match stage
        let matchStage = {};
        if (status) {
            matchStage.status = status;
        }

        const pipeline = [
            // Stage 1: Match with optional status filter
            ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
            
            // Stage 2: Sort and paginate
            { $sort: { created_at: -1 } },
            { $skip: skip },
            { $limit: limit },
            
            // Stage 3: Lookup customer info
            {
                $lookup: {
                    from: 'customers',
                    localField: 'user_id',
                    foreignField: 'id',
                    as: 'customer',
                    pipeline: [
                        {
                            $project: {
                                id: 1,
                                first_name: 1,
                                last_name: 1,
                                email: 1
                            }
                        }
                    ]
                }
            },
            
            // Stage 4: Lookup order items with products
            {
                $lookup: {
                    from: 'order_items',
                    localField: 'order_id',
                    foreignField: 'order_id',
                    as: 'items',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'products',
                                localField: 'product_id',
                                foreignField: 'id',
                                as: 'product',
                                pipeline: [
                                    {
                                        $project: {
                                            id: 1,
                                            name: 1,
                                            brand: 1,
                                            category: 1,
                                            retail_price: 1,
                                            cost: 1,
                                            department: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                product: { $arrayElemAt: ['$product', 0] }
                            }
                        },
                        {
                            $project: {
                                product_id: 1,
                                sale_price: 1,
                                status: 1,
                                product: 1
                            }
                        }
                    ]
                }
            },
            
            // Stage 5: Add computed fields
            {
                $addFields: {
                    customer: { $arrayElemAt: ['$customer', 0] },
                    total_items: { $size: '$items' },
                    total_sale_amount: { $sum: '$items.sale_price' },
                    total_retail_amount: { $sum: '$items.product.retail_price' }
                }
            },
            
            // Stage 6: Add customer full name
            {
                $addFields: {
                    'customer.full_name': {
                        $concat: ['$customer.first_name', ' ', '$customer.last_name']
                    }
                }
            },
            
            // Stage 7: Final projection
            {
                $project: {
                    order_id: 1,
                    status: 1,
                    created_at: 1,
                    customer: 1,
                    total_items: 1,
                    total_sale_amount: 1,
                    total_retail_amount: 1,
                    items: 1
                }
            }
        ];

        // Execute aggregation and count in parallel
        const [orders, totalCount] = await Promise.all([
            db.collection('orders').aggregate(pipeline).toArray(),
            db.collection('orders').countDocuments(matchStage)
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const endTime = Date.now();

        console.log(`⚡ Fetched ${orders.length} orders with all details in ${endTime - startTime}ms`);

        return res.status(200).json({
            success: true,
            data: {
                orders: orders,
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_orders: totalCount,
                    per_page: limit,
                    has_next_page: page < totalPages,
                    has_prev_page: page > 1
                }
            },
            performance: {
                execution_time_ms: endTime - startTime,
                method: "parallel-aggregation-with-filtering",
                filters: matchStage
            }
        });

    } catch (error) {
        console.error('❌ Error fetching all orders:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// Get order summary analytics - SUPER FAST
const getOrderAnalytics = async (req, res) => {
    try {
        const startTime = Date.now();
        const db = mongoose.connection.db;

        // Analytics aggregation
        const analyticsResult = await db.collection('orders').aggregate([
            {
                $facet: {
                    "statusSummary": [
                        { $group: { _id: "$status", count: { $sum: 1 } } },
                        { $sort: { count: -1 } }
                    ],
                    "totalOrders": [
                        { $count: "total" }
                    ],
                    "recentOrders": [
                        { $sort: { created_at: -1 } },
                        { $limit: 5 },
                        {
                            $lookup: {
                                from: 'customers',
                                localField: 'user_id',
                                foreignField: 'id',
                                as: 'customer',
                                pipeline: [
                                    { $project: { first_name: 1, last_name: 1 } }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                customer_name: {
                                    $concat: [
                                        { $arrayElemAt: ['$customer.first_name', 0] },
                                        ' ',
                                        { $arrayElemAt: ['$customer.last_name', 0] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                order_id: 1,
                                status: 1,
                                created_at: 1,
                                customer_name: 1
                            }
                        }
                    ]
                }
            }
        ]).toArray();

        const endTime = Date.now();

        return res.status(200).json({
            success: true,
            data: {
                summary: {
                    total_orders: analyticsResult[0].totalOrders[0]?.total || 0,
                    status_breakdown: analyticsResult[0].statusSummary,
                    recent_orders: analyticsResult[0].recentOrders
                }
            },
            performance: {
                execution_time_ms: endTime - startTime,
                method: "faceted-analytics-aggregation"
            }
        });

    } catch (error) {
        console.error('❌ Error fetching order analytics:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching order analytics',
            error: error.message
        });
    }
};

module.exports = {
    getCustomerOrdersFast,
    getAllOrdersFast,
    getOrderAnalytics
};
