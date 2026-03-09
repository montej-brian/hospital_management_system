const mariadb = require('mariadb');
require('dotenv').config();

async function testConnection() {
  console.log('Testing connection with MariaDB driver...');
  const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    connectionLimit: 1
  });

  try {
    const conn = await pool.getConnection();
    console.log('Connection successful!');
    const rows = await conn.query('SELECT 1 as val');
    console.log('Query result:', rows);
    conn.release();
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await pool.end();
    console.log('Pool closed.');
    process.exit();
  }
}

testConnection();
