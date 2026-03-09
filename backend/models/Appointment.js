const pool = require('../config/db');

const Appointment = {
    // Check if a doctor is available at a specific time
    async isAvailable(doctorId, appointmentDate) {
        const dateObj = new Date(appointmentDate);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const timeStr = dateObj.toTimeString().substring(0, 5); // HH:MM

        // 1. Check doctor's working hours
        const [doctorRows] = await pool.query('SELECT availability FROM doctors WHERE id = ?', [doctorId]);
        if (doctorRows.length === 0) throw new Error('Doctor not found');

        const availability = doctorRows[0].availability; // JSON: {"monday": ["09:00-17:00"], ...}
        
        if (!availability || !availability[dayName]) {
            return { available: false, reason: `Doctor does not work on ${dayName}` };
        }

        const isWithinWorkingHours = availability[dayName].some(slot => {
            const [start, end] = slot.split('-');
            return timeStr >= start && timeStr <= end;
        });

        if (!isWithinWorkingHours) {
            return { available: false, reason: 'Requested time is outside doctor\'s working hours' };
        }

        // 2. Check for existing overlapping appointments
        // We assume appointments are 30 mins by default for now
        const [existing] = await pool.query(
            'SELECT * FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status = "scheduled"',
            [doctorId, appointmentDate]
        );

        if (existing.length > 0) {
            return { available: false, reason: 'Doctor already has an appointment at this time' };
        }

        return { available: true };
    },

    // Create new appointment
    async create(appointmentData) {
        const { patient_id, doctor_id, appointment_date, reason } = appointmentData;
        const [result] = await pool.query(
            'INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, reason) VALUES (?, ?, ?, "scheduled", ?)',
            [patient_id, doctor_id, appointment_date, reason]
        );
        return result.insertId;
    },

    // Get appointments by doctor
    async getByDoctor(doctorId, date = null) {
        let query = 'SELECT a.*, p.first_name as patient_first, p.last_name as patient_last FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.doctor_id = ?';
        const params = [doctorId];

        if (date) {
            query += ' AND DATE(a.appointment_date) = ?';
            params.push(date);
        }

        query += ' ORDER BY a.appointment_date ASC';
        const [rows] = await pool.query(query, params);
        return rows;
    },

    // Get appointments by patient
    async getByPatient(patientId) {
        const query = `
            SELECT a.*, d.first_name as doctor_first, d.last_name as doctor_last, d.specialization 
            FROM appointments a 
            JOIN doctors d ON a.doctor_id = d.id 
            WHERE a.patient_id = ? 
            ORDER BY a.appointment_date DESC`;
        const [rows] = await pool.query(query, [patientId]);
        return rows;
    },

    // Update appointment status
    async updateStatus(id, status) {
        const [result] = await pool.query(
            'UPDATE appointments SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    },

    // Cancel appointment with reason
    async cancel(id, reason) {
        const [result] = await pool.query(
            'UPDATE appointments SET status = "cancelled", reason = CONCAT(IFNULL(reason, ""), "\nCancellation Reason: ", ?) WHERE id = ?',
            [reason, id]
        );
        return result.affectedRows > 0;
    },

    // Get available time slots for a doctor on a specific date
    // Simple implementation: 30 min intervals within working hours
    async getAvailableSlots(doctorId, date) {
        const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        const [doctorRows] = await pool.query('SELECT availability FROM doctors WHERE id = ?', [doctorId]);
        if (doctorRows.length === 0 || !doctorRows[0].availability || !doctorRows[0].availability[dayName]) {
            return [];
        }

        const workingSlots = doctorRows[0].availability[dayName];
        const allPossibleSlots = [];

        workingSlots.forEach(slot => {
            const [start, end] = slot.split('-');
            let current = new Date(`${date}T${start}:00`);
            const finish = new Date(`${date}T${end}:00`);

            while (current < finish) {
                allPossibleSlots.push(current.toTimeString().substring(0, 5));
                current.setMinutes(current.getMinutes() + 30);
            }
        });

        // Filter out booked slots
        const [booked] = await pool.query(
            'SELECT appointment_date FROM appointments WHERE doctor_id = ? AND DATE(appointment_date) = ? AND status = "scheduled"',
            [doctorId, date]
        );

        const bookedTimes = booked.map(b => new Date(b.appointment_date).toTimeString().substring(0, 5));
        
        return allPossibleSlots.filter(time => !bookedTimes.includes(time));
    }
};

module.exports = Appointment;
