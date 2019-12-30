// @ts-check
const demyConfig = require('../utils/config');

let Product;
if (!demyConfig.useMongoDB) {
  Product = require('../models/product');
}

exports.getProducts = (req, res, next) => {
  req.user.getProducts().then(products => {
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
  const imageUrl = req.body.imgUrl;
  const description = req.body.description;
  const price = req.body.price;
  req.user.createProduct({
    title, price, imageUrl, description
  }).then(result => {
    res.redirect('/admin/products');
  }).catch(error => {
    console.log(error);
  });
}

exports.getEditProduct = (req, res, next) => {
const productId = req.params.productId;
  req.user.getProducts({ where: { id: productId }}).then(product => {
    if (product && product.length) {
      res.render('admin/edit-product', { 
        pageTitle: 'Edit product', 
        path: '/admin/edit-product',
        product: product[0],
        editing: true
      });  
    } else {
      res.redirect('/admin/products');
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
  Product.findByPk(productId).then(product => {
    if (!product) {
      return;
    }
    product.title = title;
    product.imageUrl = imgUrl;
    product.price = price;
    product.description = description;
    return product.save(); // save changes
  }).then(() => {
    res.redirect('/admin/products');
  }).catch(error => {
    console.log(error);
  });
}

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId && req.body.productId.trim();
  if (productId) {
    Product.findOne({ where: { id: productId, UserId: req.user.id}}).then(product => {
      return product.destroy(); // delete product
    }).then(() => {
      res.redirect('/admin/products');
    }).catch(error => {
      console.log(error);
    });
  }
}