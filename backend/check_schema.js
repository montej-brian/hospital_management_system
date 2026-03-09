const pool = require('./config/db');

async function checkSchema() {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SHOW TABLES');
    
    if (rows.length === 0) {
      console.log('No tables found in the database: ' + process.env.DB_NAME);
    } else {
      console.log('Tables found in ' + process.env.DB_NAME + ':');
      rows.forEach(row => {
        console.log(`- ${Object.values(row)[0]}`);
      });
      
      for (const row of rows) {
        const tableName = Object.values(row)[0];
        console.log(`\nSchema for ${tableName}:`);
        const columns = await conn.query(`DESCRIBE ${tableName}`);
        console.table(columns);
      }
    }
  } catch (err) {
    console.error('Error checking schema:', err.message);
  } finally {
    if (conn) conn.release();
    process.exit();
  }
}

checkSchema();
