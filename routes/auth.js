const express = require('express');
const { check, body } = require('express-validator');
const router = express.Router();

const authCtrl = require('../controllers/auth');

router.get('/login', authCtrl.getLogin);
router.post('/login', authCtrl.postLogin);
router.get('/signup', authCtrl.getSignup);
router.post('/signup', 
  [
    body('name', 'Name is required')
      .isLength({ min: 5 }),
    body('email')
      .isEmail()
      .withMessage('Invalid email value')
      .custom((value, { req }) => {
        if (value.indexOf('mailinator') > -1) {
          throw new Error('Email is not allowed')
        }
        return true;
      }),
    body('password', 'Alpha numeric password atleast 5 characters long')
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Confirm password need to match');
        }
        return true;
      })
  ],
  authCtrl.postSignup);
router.post('/logout', authCtrl.postLogout);
router.get('/forgot-password', authCtrl.getForgotPassword);
router.post('/forgot-password', authCtrl.postForgotPassword);
router.get('/reset-password/:token', authCtrl.getResetPassword);
router.post('/reset-password', authCtrl.postResetPassword);

module.exports = router;