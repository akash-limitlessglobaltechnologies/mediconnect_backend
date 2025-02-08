// Models/userModel.js
const mongoose = require('mongoose');

const contractUserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    displayName: String,
    firstName: String,
    lastName: String,
    profilePhoto: String,
    role: {
        type: String,
        enum: ['doctor', 'patient', 'admin', null], // Allow null
        default: null // Set default as null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    collection: 'contractusers'
});

const ContractUser = mongoose.model('ContractUser', contractUserSchema);
module.exports = ContractUser;