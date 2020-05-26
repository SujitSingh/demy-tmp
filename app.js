// @ts-check
const path = require('path');
const rootDir = require('./utils/paths');
const http = require('http');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const csurf = require('csurf');
const flash = require('connect-flash');
const MongoDBStrore = require('connect-mongodb-session')(session);

const demyConfig = require('./utils/config');
const dbConnections = require('./utils/database');

const sequelize = !demyConfig.useMongoDB ? dbConnections.sequelize : undefined;
const mongoConnection = demyConfig.useMongoDB ? dbConnections.mongoConnection : undefined;

const port = demyConfig.serverPort;
const app = express();
const adminEmail = 'admin1@test.com';
const sessionStore = new MongoDBStrore(
  { uri: demyConfig.mongoDBPath, collection: 'Sessions' },
  function(error) {
    if (error) {
      console.log('MongoDB(sessions) connection error');
    }
  }
);

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
const authRoutes = require('./routes/auth');
const checkAuth = require('./middleware/check-auth');

const errorCtrl = require('./controllers/error');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: demyConfig.sessionSecret,
  resave: false, 
  saveUninitialized: false,
  store: sessionStore
}));
// multer file storage
const multerFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, demyConfig.productImgsRoot);
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + '-' + file.originalname);
  }
});
const multerFileFilter = (req, file, cb) => {
  // multer file type filter
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true); // save file
  } else {
    cb(null, false); // don't save file
  }
};
app.use(multer({ storage: multerFileStorage, fileFilter: multerFileFilter }).single('image'));
app.use(csurf({ }));
app.use(flash());
// public folders
app.use(express.static(path.join(rootDir, 'public')));
app.use(`/${demyConfig.productImgsRoot}`, express.static(path.join(rootDir, demyConfig.productImgsRoot)));

// add user details/object under request
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  const userPromise = demyConfig.useMongoDB ? 
                      User.findById(req.session.user._id) : 
                      User.findOne({ where: { email: adminEmail }});
  userPromise.then(user => {
    if (!user) {
      return next();
    }
    req.user = user && demyConfig.useMongoDB ? user : user;
    next();
  }).catch(error => {
    throw new Error(error);
  });
});
// common values for template views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// using routes
app.use('/admin', checkAuth.isLoggedIn, adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
// error handlers
app.use(errorCtrl.notFound); // 404 route
app.use(errorCtrl.serverError); // server error handler

const appServer = http.createServer(app);

if (demyConfig.useMongoDB) {
  // connect to MongoDB
  mongoConnection().then(connection => {
    console.log('MongoDB connected');
    return User.findOne({ email: adminEmail });
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