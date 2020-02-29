const express = require('express');
const router = express.Router();

const shopCtrl = require('../controllers/shop');
const checkAuth = require('../middleware/check-auth');

router.get('/', shopCtrl.getIndex);
router.get('/products', shopCtrl.getProducts);
router.get('/products/:productId', shopCtrl.getProduct);
router.get('/cart', checkAuth.isLoggedIn, shopCtrl.getCart);
router.post('/cart-delete-item', checkAuth.isLoggedIn, shopCtrl.postCartDeleteProduct);
router.post('/cart', checkAuth.isLoggedIn, shopCtrl.addToCart);
router.get('/orders', checkAuth.isLoggedIn, shopCtrl.getOrders);
router.get('/order/:orderId', checkAuth.isLoggedIn, shopCtrl.getInvoiceFile);
router.get('/checkout', checkAuth.isLoggedIn, shopCtrl.getCheckout);
router.get('/checkout/success', checkAuth.isLoggedIn, shopCtrl.getCheckoutSuccess);
router.get('/checkout/cancel', checkAuth.isLoggedIn, shopCtrl.getCheckout);

module.exports = router;