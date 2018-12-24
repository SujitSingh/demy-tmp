const express = require('express');
const router = express.Router();

const adminCtrl = require('../controllers/admin');

router.get('/products', adminCtrl.getProducts);
router.get('/add-product', adminCtrl.getAddProduct);
router.post('/add-product', adminCtrl.postAddProduct);

module.exports = router;