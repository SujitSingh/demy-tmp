const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  res.render('shop', {
    pageTitle: 'Shop',
    path: '/',
    prods: Product.fetchAll(),
    hasProds: products.length > 0,
  });
}

exports.getAddProduct = (req, res, next) => {
  res.render('add-product', { 
    pageTitle: 'Add product', 
    path: '/admin/add-product'
  });  
}

exports.postAddProduct = (req, res, next) => {
  const product = new Product(req.body.title);
  product.save();
  res.redirect('/');
}