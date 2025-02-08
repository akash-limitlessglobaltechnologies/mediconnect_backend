// controllers/doctorController.js
const Doctor = require('../Models/doctorModel');

const doctorController = {
    register: async (req, res) => {
        try {
            const userId = req.user.id;

            // Check if doctor profile already exists
            const existingDoctor = await Doctor.findOne({ userId });
            if (existingDoctor) {
                return res.status(400).json({
                    success: false,
                    message: 'Doctor profile already exists'
                });
            }

            // Create new doctor profile
            const newDoctor = new Doctor({
                userId,
                ...req.body
            });

            await newDoctor.save();

            res.status(201).json({
                success: true,
                data: newDoctor
            });
        } catch (error) {
            console.error('Doctor registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Error registering doctor'
            });
        }
    },

    getProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const doctor = await Doctor.findOne({ userId });

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found'
                });
            }

            res.json({
                success: true,
                data: doctor
            });
        } catch (error) {
            console.error('Get doctor profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching doctor profile'
            });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const doctor = await Doctor.findOneAndUpdate(
                { userId },
                { $set: req.body },
                { new: true, runValidators: true }
            );

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found'
                });
            }

            res.json({
                success: true,
                data: doctor
            });
        } catch (error) {
            console.error('Update doctor profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating doctor profile'
            });
        }
    }
};

module.exports = doctorController;