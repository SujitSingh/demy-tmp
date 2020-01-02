const mongodb = require('mongodb');
const mongoConnect = require('../../utils/database').mongoDBConnect;

class User {
  constructor(id, userName, email, cart) {
    this._id = id ? new mongodb.ObjectId(id) : undefined,
    this.name = userName;
    this.email = email;
    this.cart = cart || {items: []};
  }

  addOne() {
    return mongoConnect().collection('Users').insertOne(this);
  }

  static findById(userId) {
    return mongoConnect().collection('Users').findOne({ _id: new mongodb.ObjectId(userId) });
  }

  static findOne(filter) {
    return mongoConnect().collection('Users').findOne(filter);
  }
  
  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex(item => {
      return item.productId.toString() === product._id.toString();
    });
    const updatedCartItems = [...this.cart.items || []];
    if (cartProductIndex === -1) {
      // add new cart item
      updatedCartItems.push({ productId: product._id, quantity: 1 });
    } else {
      // increment existing item quantity
      updatedCartItems[cartProductIndex].quantity++;
    }
    const updatedCart = {
      items: updatedCartItems
    };
    return mongoConnect().collection('Users').updateOne(
      { _id: new mongodb.ObjectId(this._id) },
      { $set: { cart: updatedCart } }
    );
  }

  getCartItems() {
    const productIds = this.cart.items.map(item => item.productId);
    const self = this;
    return mongoConnect().collection('Products').find({_id: { $in: productIds }}).toArray().then(products => {
      return products.map(product => {
        return {
          ...product,
          quantity: (() => {
            const prod = self.cart.items.find(cartItem => {
              return cartItem.productId.toString() === product._id.toString();
            });
            return prod.quantity;
          })()
        }
      });
    })
  }
}

module.exports = User;