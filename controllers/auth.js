const User = require('../models/mongo/user');
const demyConfig = require('../utils/config');
const adminEmail = 'admin1@test.com';

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path : '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn
  });
}

exports.postLogin = (req, res, next) => {
  const userPromise = demyConfig.useMongoDB ? 
                      User.findOne({ email: adminEmail }) : 
                      User.findOne({ where: { email: adminEmail }});

  userPromise.then(user => {
    req.session.isLoggedIn = true;
    req.session.user = user;
    // optional. Confirm if session saves
    req.session.save(error => {
      if (error) { 
        console.log('Error while saving user session');
      } else {
        res.redirect('/');
      }
    });
  }).catch(error => {
    console.log(error);
  });
}

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path : '/signup',
    pageTitle: 'Sign Up',
    isAuthenticated: req.session.isLoggedIn
  });
}

exports.postSignup = (req, res, next) => { }

exports.postLogout = (req, res, next) => {
  req.session.destroy((error) => {
    console.log(error);
    res.redirect('/login');
  });
}