// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generateToken } = require('../utils/generateToken');

router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

router.get('/google/callback', 
    passport.authenticate('google', { 
        session: false,
        failureRedirect: 'http://localhost:3000/login'
    }),
    async (req, res) => {
        try {
            const token = generateToken(req.user);
            const encodedToken = encodeURIComponent(token);
            
            // Redirect to role selection if no role
            if (!req.user.role) {
                res.redirect(`http://localhost:3000/google-callback?token=${encodedToken}`);
            } else {
                res.redirect(`http://localhost:3000/google-callback?token=${encodedToken}`);
            }
        } catch (error) {
            console.error('Token generation error:', error);
            res.redirect('http://localhost:3000/login');
        }
    }
);

module.exports = router;