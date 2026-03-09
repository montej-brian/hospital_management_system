require('dotenv').config();
const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');

const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'montej_brian',
    password: process.env.DB_PASSWORD || 'hms@2026',
    database: process.env.DB_NAME || 'hospital_management_system',
    connectionLimit: 5
});

async function createTestUsers() {
    let conn;
    try {
        conn = await pool.getConnection();
        console.log('Connected to MariaDB successfully!');

        // Check if users exist
        const rows = await conn.query('SELECT username, role, email FROM users');
        console.log(`Found ${rows.length} existing users.`);

        if (rows.length === 0) {
            console.log('No users found. Creating test accounts...');
            const defaultPassword = 'password123';
            const passwordHash = await bcrypt.hash(defaultPassword, 10);

            const testUsers = [
                ['admin', passwordHash, 'admin@hms.com', 'admin'],
                ['doctor', passwordHash, 'doctor@hms.com', 'doctor'],
                ['patient', passwordHash, 'patient@hms.com', 'patient']
            ];

            // Setup the users table if it somehow doesn't exist
            await conn.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    role ENUM('admin', 'doctor', 'patient', 'nurse', 'receptionist') NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);

            // Insert users
            for (const user of testUsers) {
                await conn.query(
                    'INSERT IGNORE INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
                    user
                );
            }
            
            console.log('\n✅ Test accounts created successfully!');
            console.log('----------------------------------------------------');
            console.log('USERNAME       PASSWORD           ROLE');
            console.log('----------------------------------------------------');
            console.log('admin          password123        Admin');
            console.log('doctor         password123        Doctor');
            console.log('patient        password123        Patient');
            console.log('----------------------------------------------------');

        } else {
            console.log('\nUsers already exist in the database:');
            console.table(rows);
            console.log('\nIf you don\'t know the passwords, you can manually update a user\'s password hash.');
            console.log('Example query to set password to "password123":');
            console.log(`UPDATE users SET password_hash = '$2a$10$YourHashHere' WHERE username = 'admin';`);
        }

    } catch (err) {
        console.error('❌ Error connecting to or querying database:', err.message);
        console.log('\nPlease ensure MariaDB is actively running:');
        console.log('sudo systemctl start mariadb.service');
    } finally {
        if (conn) conn.release();
        await pool.end();
        process.exit();
    }
}

createTestUsers();
