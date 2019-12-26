// @ts-check
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
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

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
  User.findOne({ where: { email: 'admin1@test.com' }}).then(user => {
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

// database tables association
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

// sync database and tables
sequelize.sync({ logging: false }).then(result => {
  console.log('Database sync complete');
  return User.findOne({ where: { email: 'admin1@test.com' }}).then(user => {
    if (!user) {
      return User.create({name: 'Admin1', email: 'admin1@test.com'});
    }
    return user;
  });
}).then(user => {
  // get cart
  return user.getCart().then(cart => {
    if (!cart) {
      return user.createCart(); // create cart for user
    }
    return cart;
  });
}).then(() => {
  appServer.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/`);
  });
}).catch(error => {
  console.log('Failed to sync Database', error);
});