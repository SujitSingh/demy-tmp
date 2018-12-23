const express = require('express');
const router = express.Router();

const prodCtrl = require('../controllers/products');

router.get('/', prodCtrl.getProducts);

module.exports = router;