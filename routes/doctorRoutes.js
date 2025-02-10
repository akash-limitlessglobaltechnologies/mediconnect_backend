// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const appointmentController = require('../controllers/appointmentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public Routes (No auth required)
router.get('/list', (req, res, next) => {
    console.log('List route hit with query:', req.query);
    next();
}, doctorController.searchDoctors);
router.get('/:doctorId/details', doctorController.getDoctorDetails);
router.get('/:doctorId/available-slots', doctorController.getAvailableSlots);

// Protected Routes
router.use(authMiddleware);

// Profile Management Routes
router.post('/register', doctorController.register);
router.get('/profile', doctorController.getProfile);
router.put('/profile', doctorController.updateProfile);


// Dashboard Data Routes
router.get('/dashboard', doctorController.getDashboardData);
router.get('/stats', doctorController.getStats);

// Doctor's Appointment Management Routes
router.get('/appointments/today', doctorController.getTodayAppointments);
router.get('/appointments/stats', doctorController.getStatistics);
router.get('/appointments', appointmentController.getDoctorAppointments);
router.get('/appointments/:id', appointmentController.getAppointmentDetails);
router.put('/appointments/:id/status', appointmentController.updateAppointmentStatus);
router.put('/appointments/:id/notes', appointmentController.updateAppointmentNotes);
router.post('/appointments/:id/prescriptions', appointmentController.addPrescription);

// Patient's Appointment Routes
router.get('/patient/appointments', appointmentController.getPatientAppointments);
router.post('/patient/appointments/book', appointmentController.bookAppointment);

// Availability Management Routes
router.get('/availability', doctorController.getAvailability);
router.put('/availability', doctorController.updateAvailability);
router.get('/slots', doctorController.getAvailableSlots);
router.post('/slots/block', doctorController.blockTimeSlots);
router.post('/slots/unblock', doctorController.unblockTimeSlots);

// Calendar Settings Routes
router.put('/settings/calendar', doctorController.updateCalendarSettings);

// Service Management Routes
router.put('/services', doctorController.updateServices);

module.exports = router;