// @ts-check
const path = require('path');
const rootDir = require('./utils/paths');
const http = require('http');
const express = require('express');
const demyConfig = require('./utils/config');
const dbConnections = require('./utils/database');

const sequelize = !demyConfig.useMongoDB ? dbConnections.sequelize : undefined;
const mongoConnection = demyConfig.useMongoDB ? dbConnections.mongoConnection : undefined;

const port = process.env.PORT || 3300;
const app = express();

let Product, User, Cart, CartItem, Order, OrderItem;
if (demyConfig.useMongoDB) {
  // MongoDB database models
  User = require('./models/mongo/user');
} else {
  // Sequelize database models
  Product = require('./models/product');
  User = require('./models/user');
  Cart = require('./models/cart');
  CartItem = require('./models/cart-item');
  Order = require('./models/order');
  OrderItem = require('./models/order-item');
}

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
  const adminEmail = 'admin1@test.com';
  const userPromise = demyConfig.useMongoDB ? 
                      User.findOne({ email: adminEmail }) : 
                      User.findOne({ where: { email: adminEmail }});
  userPromise.then(user => {
    req.user = user && demyConfig.useMongoDB ? new User(user._id, user.name, user.email, user.cart) : user;
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
const adminEmail = 'admin1@test.com';

if (demyConfig.useMongoDB) {
  // connect to MongoDB
  mongoConnection().then(connection => {
    console.log('MongoDB connected');
    return User.findOne({ email: adminEmail });
  }).then(user => {
    if (user) {
      return true; // user exists
    }
    // create new user
    const newUser = new User(null, 'Admin1', adminEmail);
    return newUser.addOne();
  }).then(() => {
    appServer.listen(port, () => {
      console.log(`Listening at http://localhost:${port}/`);
    });
  }).catch(error => {
    console.log(error.message || 'Failed to start server');
  });
} else {
  // connect to SQL DB
  // database tables association
  Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
  User.hasMany(Product);
  User.hasOne(Cart);
  Cart.belongsTo(User);
  Cart.belongsToMany(Product, { through: CartItem });
  Product.belongsToMany(Cart, { through: CartItem });
  Order.belongsTo(User);
  User.hasMany(Order);
  Order.belongsToMany(Product, { through: OrderItem });

  // sync database and tables
  sequelize.sync({ logging: false, force: false }).then(result => {
    console.log('Database sync complete');
    return User.findOne({ where: { email: adminEmail }}).then(user => {
      if (!user) {
        return User.create({name: 'Admin1', email: adminEmail});
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
}