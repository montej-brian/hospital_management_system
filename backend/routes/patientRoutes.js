const express = require('express');
const { body, query } = require('express-validator');
const patientController = require('../controllers/patientController');
const { verifyToken, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - gender
 *         - dob
 *         - phone
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the patient
 *         user_id:
 *           type: integer
 *           description: Associated user account ID
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         gender:
 *           type: string
 *           enum: [male, female, other]
 *         dob:
 *           type: string
 *           format: date
 *         phone:
 *           type: string
 *         address:
 *           type: string
 *         blood_group:
 *           type: string
 *         emergency_contact:
 *           type: string
 */

// Validation rules
const patientValidation = [
    body('first_name').notEmpty().withMessage('First name is required').trim(),
    body('last_name').notEmpty().withMessage('Last name is required').trim(),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('dob').isDate().withMessage('Invalid date of birth'),
    body('phone').notEmpty().withMessage('Phone number is required').isMobilePhone().withMessage('Invalid phone number'),
    body('blood_group').optional().isString(),
    body('emergency_contact').optional().isString()
];

// Routes

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Create a new patient profile
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', verifyToken, authorize(['admin', 'receptionist']), patientValidation, patientController.createPatient);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Get all patients with search and pagination
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of patients
 */
router.get('/', verifyToken, authorize(['admin', 'doctor', 'nurse', 'receptionist']), [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
], patientController.getPatients);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get patient details by ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient details retrieved
 *       404:
 *         description: Patient not found
 */
router.get('/:id', verifyToken, authorize(['admin', 'doctor', 'nurse', 'receptionist']), patientController.getPatientById);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Update patient information
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Patient'
 *     responses:
 *       200:
 *         description: Patient updated successfully
 */
router.put('/:id', verifyToken, authorize(['admin', 'receptionist', 'doctor']), patientValidation, patientController.updatePatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Soft delete a patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 */
router.delete('/:id', verifyToken, authorize(['admin']), patientController.deletePatient);

module.exports = router;
