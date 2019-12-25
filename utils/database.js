const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'passw0rd',
  database: process.env.DB_NAME || 'demy_sql'
});

module.exports = pool.promise();