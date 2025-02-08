// controllers/userController.js
const ContractUser = require('../Models/userModel');
const { generateToken } = require('../utils/generateToken');

const userController = {
    getProfile: async (req, res) => {
        try {
            const user = await ContractUser.findById(req.user.id)
                .select('-password');
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.json(user);
        } catch (error) {
            console.error('Profile fetch error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getCurrentUser: async (req, res) => {
        try {
            const user = await ContractUser.findById(req.user.id)
                .select('-password');
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    },

    logout: async (req, res) => {
        try {
            req.logout((err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error logging out' });
                }
                res.clearCookie('jwt');
                res.json({ message: 'Logged out successfully' });
            });
        } catch (error) {
            res.status(500).json({ message: 'Error logging out' });
        }
    },

    generateToken: (user) => {
        return generateToken(user);
    },

    updateRole: async (req, res) => {
        try {
            const { role } = req.body;
            const userId = req.user.id;

            // Validate role
            if (!['doctor', 'patient'].includes(role)) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid role'
                });
            }

            // Update user role
            const user = await ContractUser.findByIdAndUpdate(
                userId,
                { role },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Generate new token with updated role
            const token = generateToken(user);

            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    name: user.displayName || `${user.firstName} ${user.lastName}`.trim()
                }
            });
        } catch (error) {
            console.error('Role update error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating role'
            });
        }
    }
};





module.exports = userController;