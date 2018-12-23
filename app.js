const path = require('path');
const rootDir = require('./utils/paths');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');

const app = express();

// defining handlebars engine
// app.engine('hbs', expressHbs({
//   layoutsDir: 'views/layout/',
//   defaultLayout: 'base',
//   extname: 'hbs'
// }));
// app.set('view engine', 'hbs'); // to use handlebars templating engine
app.set('view engine', 'ejs'); // templating engine to use
app.set('views', 'views'); // path of views

// importing routes
const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'public')));

// using routes
app.use('/admin', adminData.routes);
app.use(shopRoutes);
// 404 route
app.use((req, res, next) => {
  res.status(404).render('404', { pageTitle: '404' });
});

const appServer = http.createServer(app);
appServer.listen(3000, ()=> {
  console.log('Listening');
});