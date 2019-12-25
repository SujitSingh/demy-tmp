const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'demy_sql', 
  process.env.DB_USER || 'root', 
  process.env.DB_PASSWORD || 'passw0rd',
  {
    dialect: 'mysql', 
    host: process.env.DB_HOST || 'localhost'
  }
);

module.exports = sequelize;


// const mysql = require('mysql2');

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || 'passw0rd',
//   database: process.env.DB_NAME || 'demy_sql'
// });

// module.exports = pool.promise();