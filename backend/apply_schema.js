const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function applySchema() {
  let conn;
  try {
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    const statements = sql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    conn = await pool.getConnection();
    console.log('--- Database Connected ---');
    console.log(`Applying ${statements.length} SQL statements...`);

    for (const statement of statements) {
      const summary = statement.split('\n')[0].substring(0, 50);
      console.log(`Executing: ${summary}...`);
      await conn.query(statement);
    }

    console.log('--- Schema Applied Successfully ---');
  } catch (err) {
    console.error('CRITICAL ERROR:', err.message);
    if (err.sql) console.error('SQL:', err.sql.substring(0, 200));
  } finally {
    if (conn) {
        console.log('Releasing connection...');
        await conn.release();
    }
    console.log('Closing pool...');
    await pool.end();
    console.log('Process complete.');
    process.exit(0);
  }
}

applySchema();
