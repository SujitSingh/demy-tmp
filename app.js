const path = require('path');
const rootDir = require('./utils/paths');
const http = require('http');
const express = require('express');

const port = process.env.PORT || 3300;
const app = express();

// database models
const sequelize = require('./utils/database');
const Product = require('./models/product');
const User = require('./models/user');

// defining templating engine
app.set('view engine', 'ejs'); // templating engine to use
app.set('views', 'views'); // path of views

// importing routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorCtrl = require('./controllers/error');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(rootDir, 'public')));

app.use((req, res, next) => {
  User.findByPk(1).then(user => {
    req.user = user;
    next();
  }).catch(error => {
    console.log(error);
  });
});

// using routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
// 404 route
app.use(errorCtrl.notFound);

const appServer = http.createServer(app);

// table model association
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);

// sync database and tables
sequelize.sync({ logging: false }).then(result => {
  console.log('Database sync complete');
  User.findByPk(1).then(user => {
    if (!user) {
      return User.create({name: 'User1', email: 'user1@test.com'});
    }
    return user;
  }).then(user => {
    appServer.listen(port, () => {
      console.log(`Listening at http://localhost:${port}/`);
    });
  });
}).catch(error => {
  console.log('Failed to sync Database', error);
});