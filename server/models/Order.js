const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: {
    type: Number,
    required: true,
    unique: true
  },
  user_id: {
    type: Number,
    required: true,
    ref: 'Customer'
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  gender: {
    type: String,
    enum: ['M', 'F']
  },
  num_of_item: {
    type: Number,
    default: 1,
    min: 1
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // Using custom created_at field
});

module.exports = mongoose.model('Order', orderSchema);
