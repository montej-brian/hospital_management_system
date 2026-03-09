const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const MedicalRecord = require('../models/MedicalRecord');

const medicalRecordController = {
    // Create new record
    createRecord: async (req, res) => {
        try {
            const recordId = await MedicalRecord.create(req.body);
            res.status(201).json({ message: 'Medical record created successfully.', recordId });
        } catch (error) {
            console.error('Create Record Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Get patient history
    getPatientHistory: async (req, res) => {
        try {
            const history = await MedicalRecord.getByPatient(req.params.patientId);
            res.json(history);
        } catch (error) {
            console.error('Get History Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Add lab test request
    addLabTest: async (req, res) => {
        try {
            const testId = await MedicalRecord.addLabTest({
                medical_record_id: req.params.id,
                test_name: req.body.test_name
            });
            res.status(201).json({ message: 'Lab test request added.', testId });
        } catch (error) {
            console.error('Add Lab Test Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Upload medical document
    uploadDocument: async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        try {
            const docId = await MedicalRecord.addDocument({
                medical_record_id: req.params.id,
                file_name: req.file.originalname,
                file_path: req.file.path,
                file_type: req.file.mimetype
            });
            res.status(201).json({ message: 'Document uploaded successfully.', docId });
        } catch (error) {
            console.error('Upload Document Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Generate Prescription PDF
    generatePrescriptionPDF: async (req, res) => {
        try {
            const record = await MedicalRecord.getById(req.params.id);
            if (!record) return res.status(404).json({ message: 'Record not found.' });

            const doc = new PDFDocument();
            const filename = `prescription-${record.id}.pdf`;
            
            res.setHeader('Content-Type', 'application/json'); // Temporarily sending info back as we won't serve the raw buffer in this tool directly
            
            // Setup response header for download
            res.setHeader('Content-disposition', `attachment; filename=${filename}`);
            res.setHeader('Content-type', 'application/pdf');

            doc.pipe(res);

            // PDF Content
            doc.fontSize(20).text('HOSPITAL MANAGEMENT SYSTEM', { align: 'center' });
            doc.moveDown();
            doc.fontSize(16).text('PRESCRIPTION', { align: 'center', underline: true });
            doc.moveDown();
            doc.fontSize(12).text(`Date: ${new Date(record.created_at).toLocaleDateString()}`);
            doc.text(`Patient: ${record.p_first} ${record.p_last}`);
            doc.text(`Doctor: Dr. ${record.d_first} ${record.d_last} (${record.specialization})`);
            doc.moveDown();
            doc.fontSize(14).text('Diagnosis:');
            doc.fontSize(12).text(record.diagnosis);
            doc.moveDown();
            doc.fontSize(14).text('Prescriptions:');
            
            record.prescriptions.forEach((p, index) => {
                doc.fontSize(12).text(`${index + 1}. ${p.medicine} - ${p.dosage} (${p.duration || 'N/A'})`);
            });

            if (record.notes) {
                doc.moveDown();
                doc.fontSize(14).text('Notes:');
                doc.fontSize(12).text(record.notes);
            }

            doc.moveDown(2);
            doc.text('-------------------------------------------', { align: 'right' });
            doc.text('Doctor\'s Digital Signature', { align: 'right' });

            doc.end();
            
        } catch (error) {
            console.error('PDF Generation Error:', error.message);
            if (!res.headersSent) res.status(500).json({ message: 'Internal server error.' });
        }
    }
};

module.exports = medicalRecordController;
