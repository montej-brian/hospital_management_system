const express = require('express');
const { body, query } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       required:
 *         - patient_id
 *         - doctor_id
 *         - appointment_date
 *       properties:
 *         patient_id:
 *           type: integer
 *         doctor_id:
 *           type: integer
 *         appointment_date:
 *           type: string
 *           format: date-time
 *         reason:
 *           type: string
 *         status:
 *           type: string
 *           enum: [scheduled, completed, cancelled, no_show]
 */

// Validation
const appointmentValidation = [
    body('patient_id').isInt().withMessage('Valid patient ID is required'),
    body('doctor_id').isInt().withMessage('Valid doctor ID is required'),
    body('appointment_date').isISO8601().withMessage('Valid ISO8601 date-time is required').custom(value => {
        if (new Date(value) < new Date()) {
            throw new Error('Appointment date cannot be in the past');
        }
        return true;
    }),
    body('reason').optional().isString()
];

// Routes

/**
 * @swagger
 * /api/appointments/availability:
 *   get:
 *     summary: Get doctor's available time slots for a specific date
 *     tags: [Appointments]
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of available slots
 */
router.get('/availability', verifyToken, appointmentController.checkAvailability);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Appointment'
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       409:
 *         description: Conflict (doctor unavailable or double-booked)
 */
router.post('/', verifyToken, authorize(['admin', 'receptionist', 'patient']), appointmentValidation, appointmentController.bookAppointment);

/**
 * @swagger
 * /api/appointments/doctor/{id}:
 *   get:
 *     summary: Get appointments for a specific doctor
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/doctor/:id', verifyToken, authorize(['admin', 'doctor', 'receptionist']), appointmentController.getDoctorAppointments);

/**
 * @swagger
 * /api/appointments/patient/{id}:
 *   get:
 *     summary: Get appointments for a specific patient
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of appointments
 */
router.get('/patient/:id', verifyToken, authorize(['admin', 'patient', 'receptionist', 'doctor']), appointmentController.getPatientAppointments);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Appointments]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled, no_show]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', verifyToken, authorize(['admin', 'doctor', 'receptionist']), appointmentController.updateStatus);

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   post:
 *     summary: Cancel an appointment with a reason
 *     tags: [Appointments]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment cancelled
 */
router.post('/:id/cancel', verifyToken, authorize(['admin', 'patient', 'receptionist']), appointmentController.cancelAppointment);

module.exports = router;
