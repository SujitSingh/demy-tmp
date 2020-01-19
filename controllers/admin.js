// @ts-check
const { validationResult } = require('express-validator');

const demyConfig = require('../utils/config');
const Product = demyConfig.useMongoDB ? require('../models/mongo/product') : require('../models/product');

exports.getProducts = (req, res, next) => {
  const userId = req.user._id;
  const productPromise = demyConfig.useMongoDB ? Product.find({ userId: userId }) : req.user.getProducts();

  productPromise.then(products => {
    res.render('admin/products', {
      pageTitle: 'Admin Products',
      path: '/admin/products',
      prods: products
    });
  }).catch(error => {
    return next(new Error(error));
  });
}

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add product', 
    path: '/admin/add-product',
    editing: false,
    errorMessage: '',
    hasError: false,
    validationErrors: []
  });
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;

  const errors = validationResult(req);
  if (!errors.isEmpty()) { // validation results
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add product', 
      path: '/admin/add-product',
      editing: false,
      product: { title, imageUrl, description, price },
      errorMessage: errors.array()[0].msg,
      hasError: true,
      validationErrors: errors.array()
    });
  }

  let productPromise;
  if (demyConfig.useMongoDB) {
    // using Mongoose
    const product = new Product({title, price, imageUrl, description, userId: req.user});
    productPromise = product.save();
  } else {
    // using Sequelize
    productPromise = req.user.createProduct({
      title, price, imageUrl, description
    });
  }

  productPromise.then(result => {
    res.redirect('/admin/products');
  }).catch(error => {
    return next(new Error(error));
  });
}

exports.getEditProduct = (req, res, next) => {
  const productId = req.params.productId;
  const userId = req.user._id;
  const productPromise = demyConfig.useMongoDB ? Product.findOne({ _id: productId, userId: userId }) 
                        : req.user.getProducts({ where: { id: productId }});

  productPromise.then(productResult => {
    const product = productResult && productResult.constructor === Array ? productResult[0] : productResult;
    if (product) {
      res.render('admin/edit-product', { 
        pageTitle: 'Edit product', 
        path: '/admin/edit-product',
        product: product,
        editing: true,
        errorMessage: '',
        hasError: false,
        validationErrors: []
      });
    } else {
      res.redirect('/admin/products');
    }
  }).catch(error => {
    return next(new Error(error));
  });
}

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const userId = req.user._id;

  const errors = validationResult(req);
  if (!errors.isEmpty()) { // validation results
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add product', 
      path: '/admin/add-product',
      editing: true,
      product: {
        _id: productId, 
        title, imageUrl, description, price
      },
      errorMessage: errors.array()[0].msg,
      hasError: true,
      validationErrors: errors.array()
    });
  }

  // check existing Product
  let getProductPromise = demyConfig.useMongoDB ? Product.findOne({ _id: productId, userId: userId }) : Product.findByPk(productId);

  getProductPromise.then(product => {
    if (!product) {
      return;
    }
    // update product
    if (demyConfig.useMongoDB) {
      // Mongoose
      product.title = title;
      product.price = price;
      product.imageUrl = imageUrl;
      product.description = description;
      return product.save();
    } else {
      // Sequelize
      product.title = title;
      product.imageUrl = imageUrl;
      product.price = price;
      product.description = description;
      return product.save();
    }
  }).then((result) => {
    res.redirect('/admin/products');
  }).catch(error => {
    return next(new Error(error));
  });
}

exports.postDeleteProduct = (req, res, next) => {
  const userId = req.user._id;
  const productId = req.body.productId && req.body.productId.trim();
  if (productId) {
    let productPromise;
    if (demyConfig.useMongoDB) {
      productPromise = Product.findOneAndRemove({ _id: productId, userId: userId });
    } else {
      productPromise = Product.findOne({ where: { id: productId, UserId: req.user.id}}).then(product => {
        return product.destroy(); // delete product
      });
    }

    productPromise.then((result) => {
      res.redirect('/admin/products');
    }).catch(error => {
      return next(new Error(error));
    });
  }
}