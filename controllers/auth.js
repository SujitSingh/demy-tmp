const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/mongo/user');
const demyConfig = require('../utils/config');
const demyEmail = require('../utils/email');

exports.getLogin = (req, res, next) => {
  let flashMessages = req.flash('error');
  flashMessages = flashMessages.length ? flashMessages : '';

  res.render('auth/login', {
    path : '/login',
    pageTitle: 'Login',
    errorMessage: flashMessages
  });
}

exports.postLogin = (req, res, next) => {
  const email = req.body.email,
        password = req.body.password;

  const userPromise = demyConfig.useMongoDB ? 
        User.findOne({ email: email }) : 
        User.findOne({ where: { email: email }});

  userPromise.then(user => {
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/login');
    }
    // compare password
    bcryptjs.compare(password, user.password).then(passwordMatch => {
      if (passwordMatch) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        // optional. Confirm if session saves
        return req.session.save(error => {
          if (error) { 
            console.log('Error while saving user session');
          } else {
            res.redirect('/');
          }
        });
      }
      // password don't match
      req.flash('error', 'Invalid credentials');
      res.redirect('/login');
    }).catch(error => {
      console.log(error);
    });
  }).catch(error => {
    console.log(error);
  });
}

exports.getSignup = (req, res, next) => {
  let flashMessages = req.flash('error');
  flashMessages = flashMessages.length ? flashMessages : '';

  res.render('auth/signup', {
    path : '/signup',
    pageTitle: 'Sign Up',
    errorMessage: flashMessages
  });
}

exports.postSignup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path : '/signup',
      pageTitle: 'Sign Up',
      errorMessage: errors.array()[0].msg
    });
  }

  const name = req.body.name,
        email = req.body.email,
        password = req.body.password;

  User.findOne({ email: email }).then(result => {
    if (result) {
      req.flash('error', 'This email already exists');
      return res.redirect('/signup'); // user already exists
    }
    // encrypt password
    return bcryptjs.hash(password, 12).then(hashPassword => {
      const newUser = new User({
        name, email,
        password: hashPassword,
        cart: { items: [] }
      });
      return newUser.save(); // save new user
    }).then(createdUser => {
      res.redirect('/login'); // redirect to login page
      // send signup email to user
      return demyEmail.sendEmail({
        to: createdUser.email,
        from: 'demy_email@mailinator.com',
        subject: 'Demy signup success',
        text: 'Thanks for signing.',
        html: '<h2>You successfully signed to demy.</h2>'
      });
    }).then(emailSent => {
      console.log('Email sent successfully');
    });
  }).catch(error => {
    console.log(error);
  });
}

exports.postLogout = (req, res, next) => {
  req.session.destroy((error) => {
    console.log(error);
    res.redirect('/login');
  });
}

exports.getForgotPassword = (req, res, next) => {
  let flashMessages = req.flash('error');
  flashMessages = flashMessages.length ? flashMessages : '';

  res.render('auth/forgot-password.ejs', {
    path : '/forgot-password',
    pageTitle: 'Forgot Password?',
    errorMessage: flashMessages
  });
}

exports.postForgotPassword = (req, res, next) => {
  let flashMessages = req.flash('error');
  flashMessages = flashMessages.length ? flashMessages : '';

  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      req.flash('error', 'Failed to generate reset token');
      return res.redirect('/forgot-password');
    }
    const token = buffer.toString('hex'); // generate token
    User.findOne({ email: req.body.email }).then(user => {
      if (!user) {
        req.flash('error', 'No user found with given email');
        return res.redirect('/forgot-password');
      }
      // set token details and save user
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + (60 * 60 * 1000); // one hour
      return user.save();
    }).then(result => {
      res.redirect('/login'); // redirect to home page
      // send reset password email to user
      return demyEmail.sendEmail({
        to: req.body.email,
        from: 'demy_email@mailinator.com',
        subject: 'Demy password reset link',
        text: 'Click the below password reset link',
        html: `<a href="http://localhost:3300/reset-password/${token}">http://localhost:3300/reset-password/${token}</a>`
      });
    }).then(emailSent => {
      console.log('Email sent successfully');
    }).catch(error => {
      console.log(error);
    });
  });
}

exports.getResetPassword = (req, res, next) => {
  let flashMessages = req.flash('error');
  flashMessages = flashMessages.length ? flashMessages : '';

  const token = req.params.token;
  if (!token) {
    return res.redirect('/forgot-password');
  }
  // find the user having token
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() } // token shouldn't have expired
  }).then(user => {
    if (!user) {
      req.flash('error', 'Token does not match or has expired');
      return res.redirect('/forgot-password');
    }
    res.render('auth/reset-password.ejs', {
      path : '/reset-password',
      pageTitle: 'Reset Password?',
      errorMessage: flashMessages,
      userId: user._id.toString(),
      passwordToken: token
    });
  }).catch(error => {
    console.log(error);
  });
}

exports.postResetPassword = (req, res, next) => {
  let newPassword = req.body.newPassword || '';
  let confirmPassword = req.body.confirmPassword || '';
  const passwordToken = req.body.passwordToken;
  const userId = req.body.userId;

  newPassword = newPassword.trim();
  confirmPassword = confirmPassword.trim();

  if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
    req.flash('error', 'Both passwords don\'t match');
    return res.redirect(`/reset-password/${passwordToken}`);
  }
  let userObj;
  User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() }
  }).then(user => {
    if (!user) {
      req.flash('error', 'Failed in reset password authentication')
    }
    userObj = user;
    return bcryptjs.hash(newPassword, 12); // hash the password
  }).then(hashPassword => {
    userObj.password = hashPassword;
    userObj.resetToken = null;
    userObj.resetTokenExpiration = undefined;
    return userObj.save();
  }).then(user => {
    res.redirect('/login');
  }).catch(error => {
    console.log(error);
  });
}