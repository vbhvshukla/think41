
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const getCustomers = async (req, res) => {
    try {
        console.log("Starting customer fetch with order count filters...");
        const startTime = Date.now();
        
        // Extract pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Extract order count filter parameters
        const orderCount = req.query.orderCount; // exact order count
        const minOrders = req.query.minOrders; // minimum orders
        const maxOrders = req.query.maxOrders; // maximum orders
        const hasOrders = req.query.hasOrders; // 'true' for customers with orders, 'false' for no orders

        // Optimized aggregation pipeline using $facet for parallel processing
        const pipeline = [
            {
                $facet: {
                    // Get filtered customers with order counts
                    "customers": [
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
                                let: { customerId: '$id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$user_id', '$$customerId'] }
                                        }
                                    },
                                    { $count: "count" }
                                ],
                                as: 'orderData'
                            }
                        },
                        {
                            $addFields: {
                                full_name: { $concat: ['$first_name', ' ', '$last_name'] },
                                order_count: {
                                    $ifNull: [
                                        { $arrayElemAt: ['$orderData.count', 0] },
                                        0
                                    ]
                                }
                            }
                        },
                        // Apply order count filters
                        {
                            $match: (() => {
                                let matchConditions = {};
                                
                                // Exact order count filter
                                if (orderCount !== undefined) {
                                    matchConditions.order_count = parseInt(orderCount);
                                }
                                
                                // Range filters
                                if (minOrders !== undefined || maxOrders !== undefined) {
                                    matchConditions.order_count = {};
                                    if (minOrders !== undefined) {
                                        matchConditions.order_count.$gte = parseInt(minOrders);
                                    }
                                    if (maxOrders !== undefined) {
                                        matchConditions.order_count.$lte = parseInt(maxOrders);
                                    }
                                }
                                
                                // Has orders filter (boolean)
                                if (hasOrders !== undefined) {
                                    if (hasOrders.toLowerCase() === 'true') {
                                        matchConditions.order_count = { $gt: 0 };
                                    } else if (hasOrders.toLowerCase() === 'false') {
                                        matchConditions.order_count = 0;
                                    }
                                }
                                
                                return Object.keys(matchConditions).length > 0 ? matchConditions : {};
                            })()
                        },
                        // Sort by order count (descending) then by id
                        { $sort: { order_count: -1, id: 1 } },
                        { $skip: skip },
                        { $limit: limit },
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
                        }
                    ],
                    // Get total count with same filters in parallel
                    "totalCount": [
                        {
                            $project: {
                                id: 1
                            }
                        },
                        {
                            $lookup: {
                                from: 'orders',
                                let: { customerId: '$id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$user_id', '$$customerId'] }
                                        }
                                    },
                                    { $count: "count" }
                                ],
                                as: 'orderData'
                            }
                        },
                        {
                            $addFields: {
                                order_count: {
                                    $ifNull: [
                                        { $arrayElemAt: ['$orderData.count', 0] },
                                        0
                                    ]
                                }
                            }
                        },
                        // Apply same filters for count
                        {
                            $match: (() => {
                                let matchConditions = {};
                                
                                if (orderCount !== undefined) {
                                    matchConditions.order_count = parseInt(orderCount);
                                }
                                
                                if (minOrders !== undefined || maxOrders !== undefined) {
                                    matchConditions.order_count = {};
                                    if (minOrders !== undefined) {
                                        matchConditions.order_count.$gte = parseInt(minOrders);
                                    }
                                    if (maxOrders !== undefined) {
                                        matchConditions.order_count.$lte = parseInt(maxOrders);
                                    }
                                }
                                
                                if (hasOrders !== undefined) {
                                    if (hasOrders.toLowerCase() === 'true') {
                                        matchConditions.order_count = { $gt: 0 };
                                    } else if (hasOrders.toLowerCase() === 'false') {
                                        matchConditions.order_count = 0;
                                    }
                                }
                                
                                return Object.keys(matchConditions).length > 0 ? matchConditions : {};
                            })()
                        },
                        { $count: "count" }
                    ]
                }
            }
        ];

        // Execute optimized aggregation pipeline
        const result = await Customer.aggregate(pipeline);
        
        const customers = result[0].customers;
        const totalCustomers = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0;

        // Calculate pagination info
        const totalPages = Math.ceil(totalCustomers / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        const endTime = Date.now();
        console.log(`✅ Fetched ${customers.length} customers in ${endTime - startTime}ms`);

        // Build filter summary for response
        const appliedFilters = {};
        if (orderCount !== undefined) appliedFilters.exact_order_count = parseInt(orderCount);
        if (minOrders !== undefined) appliedFilters.min_orders = parseInt(minOrders);
        if (maxOrders !== undefined) appliedFilters.max_orders = parseInt(maxOrders);
        if (hasOrders !== undefined) appliedFilters.has_orders = hasOrders.toLowerCase() === 'true';

        return res.status(200).json({
            success: true,
            data: {
                customers: customers,
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_customers: totalCustomers,
                    per_page: limit,
                    has_next_page: hasNextPage,
                    has_prev_page: hasPrevPage
                },
                filters: {
                    applied: appliedFilters,
                    available: {
                        orderCount: "Exact number of orders (e.g., ?orderCount=0)",
                        minOrders: "Minimum number of orders (e.g., ?minOrders=1)", 
                        maxOrders: "Maximum number of orders (e.g., ?maxOrders=5)",
                        hasOrders: "true/false for customers with/without orders (e.g., ?hasOrders=false)"
                    }
                }
            },
            performance: {
                execution_time_ms: endTime - startTime,
                total_customers: totalCustomers
            }
        });

    } catch (error) {
        console.error('Error fetching customers:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching customers',
            error: error.message
        });
    }
};

// Get single customer with order details using aggregation
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customerId = parseInt(id);
        
        // Aggregation pipeline to get customer with all order details
        const pipeline = [
            // Stage 1: Match the specific customer
            { $match: { id: customerId } },
            // Stage 2: Lookup all orders for this customer
            {
                $lookup: {
                    from: 'orders',
                    localField: 'id',
                    foreignField: 'user_id',
                    as: 'orders'
                }
            },
            // Stage 3: Add computed fields
            {
                $addFields: {
                    full_name: { $concat: ['$first_name', ' ', '$last_name'] },
                    order_count: { $size: '$orders' }
                }
            },
            // Stage 4: Project only required customer fields
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

        const result = await Customer.aggregate(pipeline);
        
        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result[0] // result[0] contains both customer and orders
        });

    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer',
            error: error.message
        });
    }
};

module.exports = {
    getCustomers,
    getCustomerById
};
