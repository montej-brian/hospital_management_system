const pool = require('../config/db');
const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.JWT_SECRET || 'fallback-key'; // Using JWT_SECRET as key for simplicity

const encrypt = (text) => CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
const decrypt = (ciphertext) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

const MedicalRecord = {
    // Create new medical record
    async create(recordData) {
        const { patient_id, doctor_id, appointment_id, diagnosis, prescriptions, notes } = recordData;
        
        // Encrypt sensitive information
        const encryptedDiagnosis = encrypt(diagnosis);
        const encryptedNotes = notes ? encrypt(notes) : null;
        const prescriptionsJson = JSON.stringify(prescriptions);

        const [result] = await pool.query(
            'INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescriptions, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [patient_id, doctor_id, appointment_id, encryptedDiagnosis, prescriptionsJson, encryptedNotes]
        );
        return result.insertId;
    },

    // Get patient history
    async getByPatient(patientId) {
        const [rows] = await pool.query(
            'SELECT mr.*, d.first_name as doctor_first, d.last_name as doctor_last FROM medical_records mr JOIN doctors d ON mr.doctor_id = d.id WHERE mr.patient_id = ? ORDER BY mr.created_at DESC',
            [patientId]
        );

        return rows.map(row => ({
            ...row,
            diagnosis: decrypt(row.diagnosis),
            notes: row.notes ? decrypt(row.notes) : null,
            prescriptions: JSON.parse(row.prescriptions)
        }));
    },

    // Add lab test
    async addLabTest(testData) {
        const { medical_record_id, test_name } = testData;
        const [result] = await pool.query(
            'INSERT INTO lab_tests (medical_record_id, test_name) VALUES (?, ?)',
            [medical_record_id, test_name]
        );
        return result.insertId;
    },

    // Upload document info
    async addDocument(docData) {
        const { medical_record_id, file_name, file_path, file_type } = docData;
        const [result] = await pool.query(
            'INSERT INTO medical_documents (medical_record_id, file_name, file_path, file_type) VALUES (?, ?, ?, ?)',
            [medical_record_id, file_name, file_path, file_type]
        );
        return result.insertId;
    },

    // Audit login
    async logAudit(auditData) {
        const { user_id, action, resource, resource_id } = auditData;
        await pool.query(
            'INSERT INTO audit_logs (user_id, action, resource, resource_id) VALUES (?, ?, ?, ?)',
            [user_id, action, resource, resource_id]
        );
    },

    // Get full detail by ID (for PDF/viewing)
    async getById(id) {
        const [rows] = await pool.query(
            'SELECT mr.*, p.first_name as p_first, p.last_name as p_last, d.first_name as d_first, d.last_name as d_last, d.specialization FROM medical_records mr JOIN patients p ON mr.patient_id = p.id JOIN doctors d ON mr.doctor_id = d.id WHERE mr.id = ?',
            [id]
        );
        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            ...row,
            diagnosis: decrypt(row.diagnosis),
            notes: row.notes ? decrypt(row.notes) : null,
            prescriptions: JSON.parse(row.prescriptions)
        };
    }
};

module.exports = MedicalRecord;
