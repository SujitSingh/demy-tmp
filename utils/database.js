// @ts-check
const Sequelize = require('sequelize');
const mongodb = require('mongodb');
const demyConfig = require('./config');
let _mongoDbConnect;

function sequelizeConnection() {
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

function mongoConnection() {
  const MongoClient = mongodb.MongoClient;
  const mongoDBURL = 'mongodb://root:passw0rd@localhost:27017/demy_nosql';
  return MongoClient.connect(mongoDBURL);
}


// export sequelize connection object
exports.sequelize = !demyConfig.useMongoDB ? sequelizeConnection() : undefined;

// export MongoDB connection function
exports.mongoConnect = demyConfig.useMongoDB ? function(callBack) {
                      mongoConnection().then(connection => {
                        _mongoDbConnect = connection.db(); // save in variable
                        callBack();
                      }).catch(error => {
                        console.log('MongoDB connection error', error);
                      });
                    } : undefined

// export MongoDB connection object
exports.mongoDBConnect = function() {
  if (_mongoDbConnect) {
    return _mongoDbConnect;
  }
  throw 'MongoDB connection error';
}


// const mysql = require('mysql2');

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || 'passw0rd',
//   database: process.env.DB_NAME || 'demy_sql'
// });

// module.exports = pool.promise();