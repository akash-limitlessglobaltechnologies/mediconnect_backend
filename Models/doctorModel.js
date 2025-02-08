// models/doctorModel.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ContractUser',
        required: true,
        unique: true
    },
    personalInfo: {
        fullName: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: true
        },
        contactNumber: {
            type: String,
            required: true
        },
        address: String,
        profilePhoto: String
    },
    professionalInfo: {
        specialization: {
            type: String,
            required: true
        },
        licenseNumber: {
            type: String,
            required: true,
            unique: true
        },
        experience: {
            type: Number,
            required: true
        },
        qualification: [{
            degree: String,
            institution: String,
            year: Number
        }],
        currentPractice: String
    },
    expertise: [{
        type: String
    }],
    pricing: {
        consultationFee: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    bio: {
        type: String,
        required: true
    },
    portfolio: [{
        title: String,
        description: String,
        link: String
    }],
    availability: {
        days: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }],
        timeSlots: [{
            startTime: String,
            endTime: String
        }]
    },
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    verified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;