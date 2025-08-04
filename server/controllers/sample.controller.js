const Customer = require('../models/Customer');
const Order = require('../models/Order');

// Create sample customers
const createSampleCustomers = async (req, res) => {
    try {
        const sampleCustomers = [
            {
                id: 457,
                first_name: "Timothy",
                last_name: "Bush",
                email: "timothybush@example.net",
                age: 65,
                gender: "M",
                state: "Acre",
                street_address: "87620 Johnson Hills",
                postal_code: "69917-400",
                city: "Rio Branco",
                country: "Brasil",
                latitude: -9.945567619,
                longitude: -67.83560991,
                traffic_source: "Search",
                created_at: new Date("2022-07-19T13:51:00Z")
            },
            {
                id: 458,
                first_name: "Sarah",
                last_name: "Johnson",
                email: "sarah.johnson@example.com",
                age: 32,
                gender: "F",
                state: "California",
                street_address: "123 Main Street",
                postal_code: "90210",
                city: "Beverly Hills",
                country: "USA",
                latitude: 34.0736,
                longitude: -118.4004,
                traffic_source: "Social Media",
                created_at: new Date("2022-08-15T10:30:00Z")
            },
            {
                id: 459,
                first_name: "Michael",
                last_name: "Davis",
                email: "michael.davis@example.org",
                age: 45,
                gender: "M",
                state: "Texas",
                street_address: "456 Oak Avenue",
                postal_code: "75001",
                city: "Dallas",
                country: "USA",
                latitude: 32.7767,
                longitude: -96.7970,
                traffic_source: "Email",
                created_at: new Date("2022-09-20T14:15:00Z")
            }
        ];

        // Clear existing customers
        await Customer.deleteMany({});
        
        // Insert sample customers
        const createdCustomers = await Customer.insertMany(sampleCustomers);

        res.status(201).json({
            success: true,
            message: 'Sample customers created successfully',
            data: createdCustomers
        });

    } catch (error) {
        console.error('Error creating sample customers:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating sample customers',
            error: error.message
        });
    }
};

// Create sample orders
const createSampleOrders = async (req, res) => {
    try {
        const sampleOrders = [
            {
                order_id: 8,
                user_id: 457,
                status: "Cancelled",
                gender: "M",
                created_at: new Date("2022-10-20T10:03:00Z"),
                num_of_item: 3
            },
            {
                order_id: 9,
                user_id: 457,
                status: "Delivered",
                gender: "M",
                created_at: new Date("2022-11-15T16:20:00Z"),
                num_of_item: 1
            },
            {
                order_id: 10,
                user_id: 458,
                status: "Processing",
                gender: "F",
                created_at: new Date("2022-12-01T09:45:00Z"),
                num_of_item: 2
            },
            {
                order_id: 11,
                user_id: 458,
                status: "Shipped",
                gender: "F",
                created_at: new Date("2022-12-10T11:30:00Z"),
                num_of_item: 5
            },
            {
                order_id: 12,
                user_id: 459,
                status: "Delivered",
                gender: "M",
                created_at: new Date("2023-01-05T13:15:00Z"),
                num_of_item: 1
            }
        ];

        // Clear existing orders
        await Order.deleteMany({});
        
        // Insert sample orders
        const createdOrders = await Order.insertMany(sampleOrders);

        res.status(201).json({
            success: true,
            message: 'Sample orders created successfully',
            data: createdOrders
        });

    } catch (error) {
        console.error('Error creating sample orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating sample orders',
            error: error.message
        });
    }
};

module.exports = {
    createSampleCustomers,
    createSampleOrders
};
