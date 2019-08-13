const path = require('path');
const rootDir = require('./utils/paths');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3300;

const app = express();

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

// using routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
// 404 route
app.use(errorCtrl.notFound);

const appServer = http.createServer(app);
appServer.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});