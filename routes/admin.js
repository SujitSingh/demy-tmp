const express = require('express');
const router = express.Router();

const prodCtrl = require('../controllers/products');

router.get('/add-product', prodCtrl.getAddProduct);
router.post('/add-product', prodCtrl.postAddProduct);

module.exports = router;