const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  products: [
    {
      product: { type: Object, require: true },
      quantity: { type: Number, require: true }
    }
  ],
  user: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      require: true
    },
    name: { type: String, require: true }
  }
});

module.exports = mongoose.model('Orders', orderSchema, 'Orders');