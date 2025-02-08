// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const patientController = require('../controllers/patientController');

// Patient routes
router.post('/register', authMiddleware, patientController.register);
router.get('/profile', authMiddleware, patientController.getProfile);
router.put('/update', authMiddleware, patientController.updateProfile);

module.exports = router;