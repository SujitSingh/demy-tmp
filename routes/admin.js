const express = require('express');
const router = express.Router();

const adminCtrl = require('../controllers/admin');

router.get('/products', adminCtrl.getProducts);
router.get('/add-product', adminCtrl.getAddProduct);
router.post('/add-product', adminCtrl.postAddProduct);
router.get('/edit-product/:productId', adminCtrl.getEditProduct);
router.post('/edit-product', adminCtrl.postEditProduct);

module.exports = router;