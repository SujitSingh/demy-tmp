const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema, 'Users');