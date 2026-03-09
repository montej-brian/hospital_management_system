const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { verifyToken, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const audit = require('../middleware/audit');

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Medical Records management
 */

// Create Record
router.post('/', 
    verifyToken, 
    authorize(['doctor']), 
    audit('CREATE_RECORD', 'medical_record'),
    medicalRecordController.createRecord
);

// Get Patient History
router.get('/patient/:patientId', 
    verifyToken, 
    authorize(['doctor', 'nurse', 'admin', 'patient']), 
    audit('VIEW_HISTORY', 'medical_record'),
    medicalRecordController.getPatientHistory
);

// Add Lab Test
router.post('/:id/lab-tests', 
    verifyToken, 
    authorize(['doctor']), 
    audit('ADD_LAB_TEST', 'lab_test'),
    medicalRecordController.addLabTest
);

// Upload Document
router.post('/:id/documents', 
    verifyToken, 
    authorize(['doctor', 'nurse', 'admin']), 
    upload.single('document'),
    audit('UPLOAD_DOCUMENT', 'medical_document'),
    medicalRecordController.uploadDocument
);

// Generate Prescription PDF
router.get('/:id/prescription', 
    verifyToken, 
    authorize(['doctor', 'nurse', 'admin', 'patient']), 
    audit('GENERATE_PDF', 'prescription'),
    medicalRecordController.generatePrescriptionPDF
);

module.exports = router;
