// @ts-check
const Product = require('../models/product');

exports.getIndex = (req, res, next) => {
  Product.findAll().then(products => {
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
  Product.findAll().then(products => {
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
  Product.findByPk(productId).then(product => {
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
  req.user.getCart().then(cart => {
    return cart.getProducts();
  }).then(products => {
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
  req.user.getCart().then(cart => {
    return cart.getProducts({ where: { id: productId }});
  }).then(productsArr => {
    if (productsArr && productsArr.length) {
      const product = productsArr[0];
      return product.destroy();
    }
    return false; // invalid product id
  }).then(() => {
    res.redirect('/cart');
  }).catch(error => {
    console.log(error);
  });
}

exports.addToCart = (req, res, next) => {
  const productId = req.body.productId;
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

exports.getOrders = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('shop/orders', {
      pageTitle: 'My orders',
      path: '/orders'
    });
  }).catch(error => {
    console.log(error);
  });
}

exports.postOrders = (req, res, next) => {
  req.user.getCart().then(cart => {
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
    res.redirect('/orders');
  }).catch(error => {
    console.log(error);
  });
}

exports.getCheckout = (req, res, next) => {
  Product.findAll().then(products => {
    res.render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout'
    });
  }).catch(error => {
    console.log(error);
  });
}