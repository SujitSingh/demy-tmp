// @ts-check
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
    console.log(error);
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
  const userId = req.user._id;
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
      product.imageUrl = imgUrl;
      product.description = description;
      return product.save();
    } else {
      // Sequelize
      product.title = title;
      product.imageUrl = imgUrl;
      product.price = price;
      product.description = description;
      return product.save();
    }
  }).then((result) => {
    res.redirect('/admin/products');
  }).catch(error => {
    console.log(error);
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
      console.log(error);
    });
  }
}