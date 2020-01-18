const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const adminCtrl = require('../controllers/admin');

router.get('/products', adminCtrl.getProducts);
router.get('/add-product', adminCtrl.getAddProduct);

router.post('/add-product',
  [
    body('title', 'Invalid product title')
      .trim()
      .isLength({ min: 5 })
      .isString(),
    body('imgUrl', 'Invalid image URL')
      .trim()
      .isLength({ min: 3 }),
    body('price', 'Invalid price value')
      .trim()
      .isFloat(),
    body('description', 'Invalid product description')
      .trim()
      .isString()
  ],
  adminCtrl.postAddProduct
);

router.get('/edit-product/:productId', adminCtrl.getEditProduct);

router.post('/edit-product',
  [
    body('title', 'Invalid product title')
      .trim()
      .isLength({ min: 5 })
      .isString(),
    body('imgUrl', 'Invalid image URL')
      .trim()
      .isLength({ min: 3 }),
    body('price', 'Invalid price value')
      .trim()
      .isFloat(),
    body('description', 'Invalid product description')
      .trim()
      .isLength({ min: 5 })
      .isString()
  ],
  adminCtrl.postEditProduct
);

router.post('/delete-product', adminCtrl.postDeleteProduct);

module.exports = router;