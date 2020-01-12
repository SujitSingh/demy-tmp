const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth');

router.get('/login', authCtrl.getLogin);
router.post('/login', authCtrl.postLogin);
router.get('/signup', authCtrl.getSignup);
router.post('/signup', authCtrl.postSignup);
router.post('/logout', authCtrl.postLogout);

module.exports = router;