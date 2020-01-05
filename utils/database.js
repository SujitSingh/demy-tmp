// @ts-check
const Sequelize = require('sequelize');
const mongoose = require('mongoose');
const demyConfig = require('./config');

function connectSqlDB() {
  return new Sequelize(
    process.env.DB_NAME || 'demy_sql',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'passw0rd',
    {
      dialect: 'mysql',
      host: process.env.DB_HOST || 'localhost'
    }
  )
}

function connectMongoDB() {
  const mongoConnectURL = 'mongodb://root:passw0rd@localhost:27017/demy_nosql';
  return mongoose.connect(mongoConnectURL, {useNewUrlParser: true, useFindAndModify: false});
}

// export sequelize connection object
exports.sequelize = !demyConfig.useMongoDB ? connectSqlDB() : undefined;

// export MongoDB connection function
exports.mongoConnection = demyConfig.useMongoDB ? connectMongoDB : undefined;


// const mysql = require('mysql2');

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || 'passw0rd',
//   database: process.env.DB_NAME || 'demy_sql'
// });

// module.exports = pool.promise();