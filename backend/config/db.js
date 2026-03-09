const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  connectionLimit: 10
});

// Simple test to verify connection
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to the MariaDB database.');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err.message);
  });

module.exports = pool;
