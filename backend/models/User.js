const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    // Create new user
    async create(userData) {
        const { username, password, email, role } = userData;
        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
            [username, passwordHash, email, role]
        );
        return result.insertId;
    },

    // Find user by username
    async findByUsername(username) {
        const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0]; 
    },

    // Find user by email
    async findByEmail(email) {
        const rows = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    // Find user by ID
    async findById(id) {
        const rows = await pool.query('SELECT id, username, email, role FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    // Compare passwords
    async comparePassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
};

module.exports = User;
