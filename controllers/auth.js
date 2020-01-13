const bcryptjs = require('bcryptjs');
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
  const name = req.body.name,
        email = req.body.email,
        password = req.body.password,
        confirmPassword = req.body.confirmPassword;

  if (!name || !email || !password || !confirmPassword) {
    req.flash('error', 'Provide all details');
    return res.redirect('/signup');
  } 
  if (password !== confirmPassword) {
    req.flash('error', 'Confirm password don\'t match');
    return res.redirect('/signup');
  }

  User.findOne({ email: email }).then(result => {
    if (result) {
      req.flash('error', 'This email already exists');
      return res.redirect('/signup'); // user already exists
    }
    return bcryptjs.hash(password, 12).then(hashPassword => {
      const newUser = new User({
        name, email,
        password: hashPassword,
        cart: { items: [] }
      });
      return newUser.save();
    }).then(createdUser => {
      // send signup email to user
      return demyEmail.sendEmail({
        to: createdUser.email,
        from: 'demy_email@mailinator.com',
        subject: 'Demy signup success',
        text: 'Thanks for signing.',
        html: '<h2>You successfully signed to demy.</h2>'
      });
    }).then(emailSent => {
      res.redirect('/login');
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