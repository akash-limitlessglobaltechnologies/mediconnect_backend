const jwt = require('jsonwebtoken');

// backend/utils/generateToken.js
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.displayName || `${user.firstName} ${user.lastName}`.trim()
        }, 
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};


const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = { generateToken, authMiddleware };