// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generateToken } = require('../utils/generateToken');

// Get frontend URL from environment variable
const FRONTEND_URL = process.env.FRONTEND_URI || 'https://mediconnect-frontend.vercel.app';

router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

router.get('/google/callback', 
    passport.authenticate('google', { 
        session: false,
        failureRedirect: `${FRONTEND_URL}/login`
    }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            const encodedToken = encodeURIComponent(token);
            
            // Redirect to role selection if no role
            // Using template literals with environment variable
            res.redirect(`${FRONTEND_URL}/google-callback?token=${encodedToken}`);
        } catch (error) {
            console.error('Token generation error:', error);
            res.redirect(`${FRONTEND_URL}/login`);
        }
    }
);

module.exports = router;