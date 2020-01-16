const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth');

router.get('/login', authCtrl.getLogin);
router.post('/login', authCtrl.postLogin);
router.get('/signup', authCtrl.getSignup);
router.post('/signup', authCtrl.postSignup);
router.post('/logout', authCtrl.postLogout);
router.get('/forgot-password', authCtrl.getForgotPassword);
router.post('/forgot-password', authCtrl.postForgotPassword);
router.get('/reset-password/:token', authCtrl.getResetPassword);
router.post('/reset-password', authCtrl.postResetPassword);

module.exports = router;