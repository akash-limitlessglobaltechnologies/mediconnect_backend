// routes/doctorRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const doctorController = require('../controllers/doctorController');

router.post('/register', authMiddleware, doctorController.register);
router.get('/profile', authMiddleware, doctorController.getProfile);
router.put('/update', authMiddleware, doctorController.updateProfile);

module.exports = router;