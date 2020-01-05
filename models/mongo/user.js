const mongoose = require('mongoose');
const Order = require('./order');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  cart: {
    items: [
      {
        productId: { 
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: { type: Number, require: true }
      }
    ]
  }
});

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(item => {
    return item.productId.toString() === product._id.toString();
  });
  const updatedCartItems = [...this.cart.items || []];
  if (cartProductIndex === -1) {
    // add new cart item
    updatedCartItems.push({
      productId: product._id,
      quantity: 1
    });
  } else {
    // increment existing item quantity
    updatedCartItems[cartProductIndex].quantity++;
  }
  const updatedCart = {
    items: updatedCartItems
  };
  this.cart = updatedCart;
  return this.save(); // save changes
}

userSchema.methods.getCartItems = function() {
  // fetch user details while populating on productId
  return this.populate('cart.items.productId').execPopulate().then(userDetails => {
    userDetails = userDetails ? userDetails.toJSON() : userDetails;
    const cartItems = userDetails && userDetails.cart && userDetails.cart.items || [];
    return cartItems;
  });
}

userSchema.methods.deleteCartItem = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() === productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
}

userSchema.methods.getOrders = function() {
  return Order.find({'user.userId': this._id});
}

userSchema.methods.addOrder = function() {
  // get user cart
  return this.getCartItems().then(cartItems => {
    const products = cartItems.map(item => {
      return {
        product: item.productId,
        quantity: item.quantity
      }
    });
    // create new order
    const order = new Order({
      user: {
        name: this.name,
        userId: this
      },
      products: products
    });
    return order.save(); // save the order
  });
}

userSchema.methods.clearCart = function() {
  this.cart = { items: [] };
  return this.save();
}

module.exports = mongoose.model('User', userSchema, 'Users');