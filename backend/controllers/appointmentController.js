const { validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');

const appointmentController = {
    // Check doctor availability
    checkAvailability: async (req, res) => {
        const { doctorId, date } = req.query;
        try {
            const slots = await Appointment.getAvailableSlots(doctorId, date);
            res.json({ doctorId, date, availableSlots: slots });
        } catch (error) {
            console.error('Check Availability Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Create new appointment
    bookAppointment: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { patient_id, doctor_id, appointment_date, reason } = req.body;

        try {
            // 1. Conflict Check
            const availability = await Appointment.isAvailable(doctor_id, appointment_date);
            if (!availability.available) {
                return res.status(409).json({ message: availability.reason });
            }

            // 2. Create Appointment
            const appointmentId = await Appointment.create({ patient_id, doctor_id, appointment_date, reason });

            // 3. Notification Placeholder
            console.log(`[NOTIFICATION] Appointment booked for patient ${patient_id} with doctor ${doctor_id} on ${appointment_date}`);

            res.status(201).json({
                message: 'Appointment scheduled successfully.',
                appointmentId
            });
        } catch (error) {
            console.error('Book Appointment Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Get appointments by doctor
    getDoctorAppointments: async (req, res) => {
        const { id } = req.params;
        const { date } = req.query; // Optional date filter
        try {
            const appointments = await Appointment.getByDoctor(id, date);
            res.json(appointments);
        } catch (error) {
            console.error('Get Doctor Appointments Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Get appointments by patient
    getPatientAppointments: async (req, res) => {
        const { id } = req.params;
        try {
            const appointments = await Appointment.getByPatient(id);
            res.json(appointments);
        } catch (error) {
            console.error('Get Patient Appointments Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Update status
    updateStatus: async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        try {
            const success = await Appointment.updateStatus(id, status);
            if (!success) {
                return res.status(404).json({ message: 'Appointment not found.' });
            }
            res.json({ message: `Appointment status updated to ${status}.` });
        } catch (error) {
            console.error('Update Status Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Cancel appointment
    cancelAppointment: async (req, res) => {
        const { id } = req.params;
        const { reason } = req.body;
        try {
            const success = await Appointment.cancel(id, reason || 'No reason provided');
            if (!success) {
                return res.status(404).json({ message: 'Appointment not found.' });
            }
            res.json({ message: 'Appointment cancelled successfully.' });
        } catch (error) {
            console.error('Cancel Appointment Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }
};

module.exports = appointmentController;
