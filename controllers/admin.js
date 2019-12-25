const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(([products]) => {
    res.render('admin/products', {
      pageTitle: 'Admin Products',
      path: '/admin/products',
      prods: products
    });
  }).catch(error => {
    console.log(error);
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
  product.save().then(() => {
    res.redirect('/');
  }).catch(error => {
    console.log(error);
  });
}

exports.getEditProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId).then(([product]) => {
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
  }).catch(error => {
    console.log(error);
  });
}

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const title = req.body.title;
  const imgUrl = req.body.imgUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(productId, title, imgUrl, description, price);
  product.save().then(() => {
    res.redirect('/admin/products');
  }).catch(error => {
    console.log(error);
  });
}

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId && req.body.productId.trim();
  if (productId) {
    Product.deleteById(productId).then(() => {
      res.redirect('/admin/products');
    }).catch(error => {
      console.log(error);
    });
  }
}