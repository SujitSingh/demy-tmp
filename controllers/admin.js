const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('admin/products', {
      pageTitle: 'Admin Products',
      path: '/admin/products',
      prods: products
    });
  }); 
}

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', { 
    pageTitle: 'Add product', 
    path: '/admin/add-product',
    editing: false
  });  
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imgUrl = req.body.imgUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(null, title, imgUrl, description, price);
  product.save();
  res.redirect('/');
}

exports.getEditProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId, product => {
    if (product) {
      res.render('admin/edit-product', { 
        pageTitle: 'Edit product', 
        path: '/admin/edit-product',
        product,
        editing: true
      });  
    } else {
      res.redirect('/');
    }
  });
}

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const title = req.body.title;
  const imgUrl = req.body.imgUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(productId, title, imgUrl, description, price);
  product.save();
  res.redirect('/admin/products');
}