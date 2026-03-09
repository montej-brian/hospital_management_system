const { validationResult } = require('express-validator');
const Patient = require('../models/Patient');

const patientController = {
    // Create patient profile
    createPatient: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const patientId = await Patient.create(req.body);
            res.status(201).json({
                message: 'Patient profile created successfully.',
                patientId
            });
        } catch (error) {
            console.error('Create Patient Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Get all patients (with search and pagination)
    getPatients: async (req, res) => {
        try {
            const { page, limit, search } = req.query;
            const result = await Patient.getAll({ page, limit, search });
            res.json(result);
        } catch (error) {
            console.error('Get Patients Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Get single patient by ID
    getPatientById: async (req, res) => {
        try {
            const patient = await Patient.getById(req.params.id);
            if (!patient) {
                return res.status(404).json({ message: 'Patient not found.' });
            }
            res.json(patient);
        } catch (error) {
            console.error('Get Patient Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Update patient information
    updatePatient: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const success = await Patient.update(req.params.id, req.body);
            if (!success) {
                return res.status(404).json({ message: 'Patient not found or already deleted.' });
            }
            res.json({ message: 'Patient information updated successfully.' });
        } catch (error) {
            console.error('Update Patient Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    // Delete patient (soft delete)
    deletePatient: async (req, res) => {
        try {
            const success = await Patient.delete(req.params.id);
            if (!success) {
                return res.status(404).json({ message: 'Patient not found.' });
            }
            res.json({ message: 'Patient deleted successfully.' });
        } catch (error) {
            console.error('Delete Patient Error:', error.message);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }
};

module.exports = patientController;
