// @ts-check
const demyConfig = require('../utils/config');
const Product = demyConfig.useMongoDB ? require('../models/mongo/product') : require('../models/product');

exports.getIndex = (req, res, next) => {
  const productsPromise = demyConfig.useMongoDB ? Product.getAll() : Product.findAll();

  productsPromise.then(products => {
    res.render('shop/index', {
      pageTitle: 'Shop',
      path: '/',
      prods: products
    });
  }).catch(error => {
    console.log(error);
  });
}

exports.getProducts = (req, res, next) => {
  const productsPromise = demyConfig.useMongoDB ? Product.getAll() : Product.findAll();

  productsPromise.then(products => {
    res.render('shop/product-list', {
      pageTitle: 'All products',
      path: '/products',
      prods: products
    });
  }).catch(error => {
    console.log(error);
  });
}

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  const productPromise = demyConfig.useMongoDB ? Product.findById : Product.findByPk;

  productPromise(productId).then(product => {
    res.render('shop/product-details', {
      pageTitle: 'Product detail', 
      product: product,
      path: '/products'
    });
  }).catch(error => {
    console.log(error);
  });
}

exports.getCart = (req, res, next) => {
  const cartPromise = demyConfig.useMongoDB ? req.user.getCartItems() :
                      req.user.getCart().then(cart => {
                        return cart.getProducts()
                      });

  cartPromise.then(products => {
    res.render('shop/cart', {
      pageTitle: 'My cart',
      path: '/cart',
      products: products
    });
  }).catch(error => {
    console.log(error);
  });
}

exports.postCartDeleteProduct = (req, res, next) => {
  let productId = req.body.productId;
  const cartPromise = demyConfig.useMongoDB ? req.user.deleteCartItem(productId) :
                      req.user.getCart().then(cart => {
                        return cart.getProducts({ where: { id: productId }});
                      }).then(productsArr => {
                        if (productsArr && productsArr.length) {
                          const product = productsArr[0];
                          return product.destroy();
                        }
                        return false; // invalid product id
                      });

  cartPromise.then(() => {
    res.redirect('/cart');
  }).catch(error => {
    console.log(error);
  });
}

exports.addToCart = (req, res, next) => {
  const productId = req.body.productId;
  if (demyConfig.useMongoDB) {
    // MongoDB
    Product.findById(productId).then(product => {
      return req.user.addToCart(product);
    }).then(result => {
      res.redirect('/cart');
    }).catch(error => {
      console.log(error);
    });
  } else {
    // Sequelize
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart().then(cart => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: productId }})
    }).then(productArr => {
      let product;
      if (productArr && productArr.length) {
        product = productArr[0];
      }
      if (product) {
        const oldQuantity = product.CartItem.quantity;
        newQuantity += oldQuantity;
        return product;
      }
      return Product.findByPk(productId);
    }).then(product => {
      return fetchedCart.addProduct(product, { through: { quantity: newQuantity }});
    }).then(() => {
      res.redirect('/cart');
    }).catch(error => {
      console.log(error);
    });
  }
}

exports.getOrders = (req, res, next) => {
  const ordersPromise = demyConfig.useMongoDB ? req.user.getOrders() : req.user.getOrders({ include: ['Products'] });
  ordersPromise.then(orders => {
    res.render('shop/orders', {
      pageTitle: 'My orders',
      path: '/orders',
      orders
    });
  }).catch(error => {
    console.log(error);
  });
}

exports.postOrders = (req, res, next) => {
  let fetchedCart;
  const orderPromise = demyConfig.useMongoDB ? req.user.addOrder(): 
                      req.user.getCart().then(cart => {
                        fetchedCart = cart;
                        return cart.getProducts();
                      }).then(products => {
                        return req.user.createOrder().then(order => {
                          return order.addProducts(products.map(product => {
                            product.OrderItem = {
                              quantity: product.CartItem.quantity
                            };
                            return product;
                          }));
                        });
                      }).then(result => {
                        return fetchedCart.setProducts(null); // empty the cart
                      });

  orderPromise.then(() => {
    res.redirect('/orders');
  }).catch(error => {
    console.log(error);
  });
}