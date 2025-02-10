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
        city: String,
        state: String,
        country: String,
        pincode: String,
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
            year: Number,
            duration: String
        }],
        currentPractice: {
            hospitalName: String,
            address: String,
            position: String
        },
        languages: [String]
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
            default: 'INR'
        },
        followUpFee: {
            type: Number
        },
        emergencyFee: {
            type: Number
        },
        videoConsultationFee: {
            type: Number
        }
    },
    availability: {
        days: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }],
        timeSlots: [{
            startTime: String,
            endTime: String,
            maxPatients: {
                type: Number,
                default: 1
            }
        }],
        appointmentDuration: {
            type: Number, // in minutes
            default: 30
        },
        customTimeSlots: [{
            date: Date,
            slots: [{
                startTime: String,
                endTime: String,
                available: {
                    type: Boolean,
                    default: true
                }
            }]
        }]
    },
    calendarSettings: {
        breakTime: {
            type: Number, // in minutes
            default: 15
        },
        maxAppointmentsPerDay: {
            type: Number,
            default: 20
        },
        appointmentBuffer: {
            type: Number, // in minutes
            default: 10
        },
        workingHours: {
            start: {
                type: String,
                default: '09:00'
            },
            end: {
                type: String,
                default: '17:00'
            }
        },
        notifications: {
            email: {
                type: Boolean,
                default: true
            },
            sms: {
                type: Boolean,
                default: true
            },
            whatsapp: {
                type: Boolean,
                default: false
            }
        },
        autoConfirm: {
            type: Boolean,
            default: false
        },
        allowEmergency: {
            type: Boolean,
            default: true
        }
    },
    bio: {
        type: String,
        required: true
    },
    services: [{
        name: String,
        description: String,
        duration: Number,
        fee: Number
    }],
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        },
        reviews: [{
            patientId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Patient'
            },
            rating: Number,
            review: String,
            date: {
                type: Date,
                default: Date.now
            }
        }]
    },
    statistics: {
        totalPatients: {
            type: Number,
            default: 0
        },
        totalAppointments: {
            type: Number,
            default: 0
        },
        cancelledAppointments: {
            type: Number,
            default: 0
        },
        emergencyConsultations: {
            type: Number,
            default: 0
        }
    },
    verified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to update the updatedAt field
doctorSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;