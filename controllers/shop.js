// @ts-check
const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getIndex = (req, res, next) => {
  Product.fetchAll().then(([products]) => {
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
  Product.fetchAll().then(([products]) => {
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
  Product.findById(productId).then(([product]) => {
    res.render('shop/product-details', {
      pageTitle: 'Product detail', 
      product: product[0],
      path: '/products'
    });
  }).catch(error => {
    console.log(error);
  });
}

exports.getCart = (req, res, next) => {
  Cart.getCart(cart => {
    Product.fetchAll().then(([products]) => {
      let cartProds = [];
      for (let product of products) {
        const cartProductData = cart.products.find(prod => prod.id === product.id);
        if (cartProductData) {
          cartProds.push({ productData: product, qty : cartProductData.qty });
        }
      }
      res.render('shop/cart', {
        pageTitle: 'My cart',
        path: '/cart',
        products: cartProds
      });
    }).catch(error => {
      console.log(error);
    })
  });
}

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  const product = Product.findById(productId).then(([product]) => {
    Cart.deleteProduct(productId, product[0].price);
    res.redirect('/cart');
  }).catch(error => {
    console.log(error);
  });
}

exports.addToCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId).then(([product]) => {
    Cart.addProduct(productId, product[0].price);
  }).catch(error => {
    console.log(error);
  });
}

exports.getOrders = (req, res, next) => {
  Product.fetchAll().then(([products]) => {
    res.render('shop/orders', {
      pageTitle: 'My orders',
      path: '/orders'
    });
  }).catch(error => {
    console.log(error);
  });
}

exports.getCheckout = (req, res, next) => {
  Product.fetchAll().then(([products]) => {
    res.render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout'
    });
  }).catch(error => {
    console.log(error);
  });
}