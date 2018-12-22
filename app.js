const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const server = express();
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

server.use(bodyParser.urlencoded({ extended: false }));

// routes
server.use('/admin', adminRoutes);
server.use(shopRoutes);

// 404 route
server.use((req, res, next) => {
  res.status(404).send('<h2>Routes not found</h2>')
});

const appServer = http.createServer(server);
appServer.listen(3000, ()=> {
  console.log('Listening');
});