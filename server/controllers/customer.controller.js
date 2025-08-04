
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const getCustomers = async (req, res) => {
    try {
        console.log("Starting customer fetch...");
        const startTime = Date.now();
        
        // Extract pagination parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Optimized aggregation pipeline using $facet for parallel processing
        const pipeline = [
            {
                $facet: {
                    // Get paginated customers
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
                        { $sort: { id: 1 } },
                        { $skip: skip },
                        { $limit: limit },
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
                    // Get total count in parallel
                    "totalCount": [
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
