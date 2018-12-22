const path = require('path');
const rootDir = require('./utils/paths');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const server = express();
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

server.use(bodyParser.urlencoded({ extended: false }));
server.use(express.static(path.join(rootDir, 'public')));

// routes
server.use('/admin', adminRoutes);
server.use(shopRoutes);

// 404 route
server.use((req, res, next) => {
  res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
});

const appServer = http.createServer(server);
appServer.listen(3000, ()=> {
  console.log('Listening');
});