const express = require('express');
const router = express.Router();

const shopCtrl = require('../controllers/shop');

router.get('/', shopCtrl.getIndex);
router.get('/products', shopCtrl.getProducts);
router.get('/products/:productId', shopCtrl.getProduct);
router.get('/cart', shopCtrl.getCart);
router.post('/cart-delete-item', shopCtrl.postCartDeleteProduct);
router.post('/cart', shopCtrl.addToCart);
router.get('/orders', shopCtrl.getOrders);
router.get('/checkout', shopCtrl.getCheckout);

module.exports = router;