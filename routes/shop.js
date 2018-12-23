const path = require('path');
const rootDir = require('../utils/paths');
const express = require('express');
const router = express.Router();

const adminData = require('./admin');

router.get('/', (req, res, next) => {
  res.render('shop', {
    pageTitle: 'Shop',
    path: '/',
    prods: adminData.products,
    hasProds: adminData.products.length > 0,
    activeShop: true,
    productCSS: true
  });
});

module.exports = router;