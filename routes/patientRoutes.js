// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const patientController = require('../controllers/patientController');
const appointmentController = require('../controllers/appointmentController');

// Patient Profile Routes
router.post('/register', authMiddleware, patientController.register);
router.get('/profile', authMiddleware, patientController.getProfile);
router.put('/update', authMiddleware, patientController.updateProfile);

// Patient Appointment Routes
router.get('/appointments', authMiddleware, appointmentController.getPatientAppointments);
router.post('/appointments/book', authMiddleware, appointmentController.bookAppointment);
router.get('/appointments/:appointmentId', authMiddleware, appointmentController.getAppointmentDetails);
router.put('/appointments/:appointmentId/cancel', authMiddleware, appointmentController.updateAppointmentStatus);

module.exports = router;