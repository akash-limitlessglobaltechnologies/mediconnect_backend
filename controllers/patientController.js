// controllers/patientController.js
const Patient = require('../Models/patientModel');

const patientController = {
    register: async (req, res) => {
        try {
            const userId = req.user.id;

            // Check if patient profile already exists
            const existingPatient = await Patient.findOne({ userId });
            if (existingPatient) {
                return res.status(400).json({
                    success: false,
                    message: 'Patient profile already exists'
                });
            }

            // Create new patient profile
            const newPatient = new Patient({
                userId,
                ...req.body
            });

            await newPatient.save();

            res.status(201).json({
                success: true,
                data: newPatient
            });
        } catch (error) {
            console.error('Patient registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Error registering patient'
            });
        }
    },

    getProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const patient = await Patient.findOne({ userId });

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient profile not found'
                });
            }

            res.json({
                success: true,
                data: patient
            });
        } catch (error) {
            console.error('Get patient profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching patient profile'
            });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const patient = await Patient.findOneAndUpdate(
                { userId },
                { $set: req.body },
                { new: true, runValidators: true }
            );

            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient profile not found'
                });
            }

            res.json({
                success: true,
                data: patient
            });
        } catch (error) {
            console.error('Update patient profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating patient profile'
            });
        }
    }
};

module.exports = patientController;