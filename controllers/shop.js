// @ts-check
const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      pageTitle: 'Shop',
      path: '/',
      prods: products
    });
  });
}

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      pageTitle: 'All products',
      path: '/products',
      prods: products
    });
  });
}

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId, product => {
    res.render('shop/product-details', {
      pageTitle: 'Product detail', 
      product,
      path: '/products'
    });
  });
}

exports.getCart = (req, res, next) => {
  Cart.getCart(cart => {
    Product.fetchAll(products => {
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
    });
  });
}

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  const product = Product.findById(productId, product => {
    Cart.deleteProduct(productId, product.price);
    res.redirect('/cart');
  });
}

exports.addToCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId, product => {
    Cart.addProduct(productId, product.price);
  });
}

exports.getOrders = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/orders', {
      pageTitle: 'My orders',
      path: '/orders'
    });
  });
}

exports.getCheckout = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout'
    });
  });
}