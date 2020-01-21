// @ts-check
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const filesUtil = require('../utils/files');
const demyConfig = require('../utils/config');
const Product = demyConfig.useMongoDB ? require('../models/mongo/product') : require('../models/product');
const Order = demyConfig.useMongoDB ? require('../models/mongo/order') : require('../models/order');

exports.getIndex = (req, res, next) => {
  const productsPromise = demyConfig.useMongoDB ? Product.find() : Product.findAll();

  productsPromise.then(products => {
    res.render('shop/index', {
      pageTitle: 'Shop',
      path: '/',
      prods: products
    });
  }).catch(error => {
    return next(new Error(error));
  });
}

exports.getProducts = (req, res, next) => {
  const productsPromise = demyConfig.useMongoDB ? Product.find() : Product.findAll();

  productsPromise.then(products => {
    res.render('shop/product-list', {
      pageTitle: 'All products',
      path: '/products',
      prods: products
    });
  }).catch(error => {
    return next(new Error(error));
  });
}

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  const productPromise = demyConfig.useMongoDB ? Product.findById(productId) : Product.findByPk(productId);

  productPromise.then(product => {
    res.render('shop/product-details', {
      pageTitle: 'Product detail', 
      product: product,
      path: '/products'
    });
  }).catch(error => {
    return next(new Error(error));
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
    return next(new Error(error));
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
    return next(new Error(error));
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
      return next(new Error(error));
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
      return next(new Error(error));
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
    return next(new Error(error));
  });
}

exports.postOrders = (req, res, next) => {
  let fetchedCart;
  function mongoPostOrder() {
    return req.user.addOrder().then(result => {
      return req.user.clearCart();
    });
  }

  function sqlPostOrder() {
    return req.user.getCart().then(cart => {
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
  }

  const orderPromise = demyConfig.useMongoDB ? mongoPostOrder() : sqlPostOrder();

  orderPromise.then(() => {
    res.redirect('/orders');
  }).catch(error => {
    return next(new Error(error));
  });
}

exports.getInvoiceFile = (req, res, next) => {
  const orderId = req.params.orderId;
  if (!orderId) {
    return res.redirect('/orders');
  }
  // find the order
  Order.findById(orderId).then(order => {
    if (!order) {
      return next(new Error('Invalid order invoice request'));
    }
    // check user's authenticity
    if (order.user.userId.toString() === req.user._id.toString()) {
      const invoiceName = `invoice-${orderId}.pdf`; // file name
      const invoicePath = path.join(demyConfig.invoiceFilesRoot, invoiceName); // invoice path
  
      // response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);

      // generate PDF file
      const pdfDoc = new PDFDocument();
      const fileWriteStream = fs.createWriteStream(invoicePath)
      pdfDoc.pipe(fileWriteStream); // location for output PDF file
      pdfDoc.pipe(res); // Response - send file as stream
      // add contents of PDF file
      pdfDoc.fontSize(20).text('Order Invoice', {
        underline: true,
        align: 'center',
      });
      pdfDoc.fontSize(14).text('Invoice details', { underline: true });
      let totalPrice = 0;
      // add product details
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.text(`${prod.product.title}(Rs${prod.product.price}), Quantity - ${prod.quantity} = Rs${prod.quantity * prod.product.price}`);
      });
      pdfDoc.text('--------------------------------------------------');
      pdfDoc.text('Total price - Rs' + totalPrice);
      pdfDoc.end(); // editing complete
      fileWriteStream.on('finish', () => {
        filesUtil.deleteFile(invoicePath); // delete file when done
      });

      // send as file stream
      // const fileStream = fs.createReadStream(invoicePath); // read stream
      // return fileStream.pipe(res); // send file stream

      // send as file data
      // fs.readFile(invoicePath, (error, fileData) => {
      //   if (error) {
      //     return next(error);
      //   }
      //   // res.setHeader('Content-Length', fileData.length.toString());
      //   return res.send(fileData); // send file data buffer
      // });
    } else {
      next(new Error('Invalid user access'));
    }
  }).catch(error => {
    next(new Error(error));
  });
}