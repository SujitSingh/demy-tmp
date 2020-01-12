const bcryptjs = require('bcryptjs');
const User = require('../models/mongo/user');
const demyConfig = require('../utils/config');

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path : '/login',
    pageTitle: 'Login',
    errorMessage: req.flash('error')
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
      req.flash('error', 'Invalid credentials');
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
  res.render('auth/signup', {
    path : '/signup',
    pageTitle: 'Sign Up',
    errorMessage: req.flash('error')
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