const pool = require('../config/db');

const Patient = {
    // Create new patient profile
    async create(patientData) {
        const { user_id, first_name, last_name, gender, dob, phone, address, blood_group, emergency_contact } = patientData;
        const [result] = await pool.query(
            'INSERT INTO patients (user_id, first_name, last_name, gender, dob, phone, address, blood_group, emergency_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [user_id, first_name, last_name, gender, dob, phone, address, blood_group, emergency_contact]
        );
        return result.insertId;
    },

    // Get all patients with pagination and search
    async getAll(options) {
        const { page = 1, limit = 10, search = '' } = options;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM patients WHERE is_deleted = FALSE';
        let countQuery = 'SELECT COUNT(*) as total FROM patients WHERE is_deleted = FALSE';
        const params = [];

        if (search) {
            const searchPattern = `%${search}%`;
            const searchClause = ' AND (first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR id = ?)';
            query += searchClause;
            countQuery += searchClause;
            params.push(searchPattern, searchPattern, searchPattern, search);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        const finalParams = [...params, parseInt(limit), parseInt(offset)];

        const [rows] = await pool.query(query, finalParams);
        const [totalResult] = await pool.query(countQuery, params);
        
        return {
            data: rows,
            total: totalResult[0].total,
            page: parseInt(page),
            limit: parseInt(limit)
        };
    },

    // Get single patient with medical history
    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM patients WHERE id = ? AND is_deleted = FALSE', [id]);
        if (rows.length === 0) return null;
        
        const [history] = await pool.query('SELECT * FROM medical_records WHERE patient_id = ? ORDER BY created_at DESC', [id]);
        
        return {
            ...rows[0],
            medical_history: history
        };
    },

    // Update patient information
    async update(id, patientData) {
        const fields = Object.keys(patientData);
        const values = Object.values(patientData);
        
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const [result] = await pool.query(
            `UPDATE patients SET ${setClause} WHERE id = ? AND is_deleted = FALSE`,
            [...values, id]
        );
        return result.affectedRows > 0;
    },

    // Soft delete patient
    async delete(id) {
        const [result] = await pool.query(
            'UPDATE patients SET is_deleted = TRUE WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = Patient;
