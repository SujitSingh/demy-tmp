const bcryptjs = require('bcryptjs');
const User = require('../models/mongo/user');
const demyConfig = require('../utils/config');
const adminEmail = 'admin1@test.com';

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path : '/login',
    pageTitle: 'Login'
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
      res.redirect('/login'); // password don't match
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
    pageTitle: 'Sign Up'
  });
}

exports.postSignup = (req, res, next) => {
  const name = req.body.name,
        email = req.body.email,
        password = req.body.password,
        confirmPassword = req.body.confirmPassword;

  if (!name || !email || !password || !confirmPassword || password !== confirmPassword) {
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