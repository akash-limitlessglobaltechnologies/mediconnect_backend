// controllers/doctorController.js
const Doctor = require('../Models/doctorModel');
const ContractUser = require('../Models/userModel');
const Appointment = require('../Models/appointmentModel');

const doctorController = {
    // Register new doctor
    register: async (req, res) => {
        try {
            const userId = req.user.id;

            // Validate user exists and is a doctor
            const user = await ContractUser.findById(userId);
            if (!user || user.role !== 'doctor') {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized: User must be a doctor'
                });
            }

            // Check if doctor profile already exists
            const existingDoctor = await Doctor.findOne({ userId });
            if (existingDoctor) {
                return res.status(400).json({
                    success: false,
                    message: 'Doctor profile already exists'
                });
            }

            // Validate required fields
            const {
                personalInfo,
                professionalInfo,
                pricing,
                bio
            } = req.body;

            if (!personalInfo?.fullName || !professionalInfo?.specialization || !pricing?.consultationFee || !bio) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            // Create new doctor profile
            const newDoctor = new Doctor({
                userId,
                ...req.body,
                status: 'active'
            });

            await newDoctor.save();

            res.status(201).json({
                success: true,
                data: newDoctor
            });
        } catch (error) {
            console.error('Doctor registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Error registering doctor',
                error: error.message
            });
        }
    },

    // Get doctor profile
    getProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const doctor = await Doctor.findOne({ userId })
                .populate('ratings.reviews.patientId', 'fullName');

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found'
                });
            }

            res.json({
                success: true,
                data: doctor
            });
        } catch (error) {
            console.error('Get doctor profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching doctor profile',
                error: error.message
            });
        }
    },

    // Update doctor profile
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const updateData = req.body;

            // Remove fields that shouldn't be updated directly
            delete updateData.userId;
            delete updateData.statistics;
            delete updateData.ratings;
            delete updateData.verified;
            delete updateData.createdAt;

            const doctor = await Doctor.findOneAndUpdate(
                { userId },
                { 
                    $set: updateData,
                    updatedAt: Date.now()
                },
                { new: true, runValidators: true }
            );

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found'
                });
            }

            res.json({
                success: true,
                data: doctor
            });
        } catch (error) {
            console.error('Update doctor profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating doctor profile',
                error: error.message
            });
        }
    },

    // Update availability settings
    updateAvailability: async (req, res) => {
        try {
            const userId = req.user.id;
            const { 
                days, 
                timeSlots, 
                appointmentDuration,
                customTimeSlots 
            } = req.body;

            const doctor = await Doctor.findOneAndUpdate(
                { userId },
                { 
                    $set: { 
                        'availability.days': days,
                        'availability.timeSlots': timeSlots,
                        'availability.appointmentDuration': appointmentDuration,
                        'availability.customTimeSlots': customTimeSlots
                    },
                    updatedAt: Date.now()
                },
                { new: true }
            );

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found'
                });
            }

            res.json({
                success: true,
                data: doctor.availability
            });
        } catch (error) {
            console.error('Update availability error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating availability'
            });
        }
    },

    // Get doctor's availability
    getAvailability: async (req, res) => {
        try {
            const userId = req.user.id;
            const { date } = req.query;

            const doctor = await Doctor.findOne({ userId });
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found'
                });
            }

            let availability = {
                regular: doctor.availability,
                custom: null,
                appointments: []
            };

            // If date is provided, get custom slots and appointments for that date
            if (date) {
                const queryDate = new Date(date);
                
                // Get custom slots for the date
                const customSlot = doctor.availability.customTimeSlots.find(
                    slot => slot.date.toDateString() === queryDate.toDateString()
                );
                if (customSlot) {
                    availability.custom = customSlot.slots;
                }

                // Get appointments for the date
                const appointments = await Appointment.find({
                    doctorId: doctor._id,
                    appointmentDate: {
                        $gte: queryDate,
                        $lt: new Date(queryDate.setDate(queryDate.getDate() + 1))
                    }
                }).select('timeSlot status');

                availability.appointments = appointments;
            }

            res.json({
                success: true,
                data: availability
            });
        } catch (error) {
            console.error('Get availability error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching availability'
            });
        }
    },

    // Update calendar settings
    updateCalendarSettings: async (req, res) => {
        try {
            const userId = req.user.id;
            const {
                breakTime,
                maxAppointmentsPerDay,
                appointmentBuffer,
                workingHours,
                notifications,
                autoConfirm,
                allowEmergency
            } = req.body;

            const doctor = await Doctor.findOneAndUpdate(
                { userId },
                {
                    $set: {
                        'calendarSettings.breakTime': breakTime,
                        'calendarSettings.maxAppointmentsPerDay': maxAppointmentsPerDay,
                        'calendarSettings.appointmentBuffer': appointmentBuffer,
                        'calendarSettings.workingHours': workingHours,
                        'calendarSettings.notifications': notifications,
                        'calendarSettings.autoConfirm': autoConfirm,
                        'calendarSettings.allowEmergency': allowEmergency
                    },
                    updatedAt: Date.now()
                },
                { new: true }
            );

            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found'
                });
            }

            res.json({
                success: true,
                data: doctor.calendarSettings
            });
        } catch (error) {
            console.error('Update calendar settings error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating calendar settings'
            });
        }
    },

    // Get doctor's statistics
    getStatistics: async (req, res) => {
        try {
            const userId = req.user.id;
            const { startDate, endDate } = req.query;

            const doctor = await Doctor.findOne({ userId });
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor profile not found'
                });
            }

            let dateQuery = {};
            if (startDate && endDate) {
                dateQuery.appointmentDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            // Get appointments statistics
            const appointments = await Appointment.find({
                doctorId: doctor._id,
                ...dateQuery
            });

            const statistics = {
                totalAppointments: appointments.length,
                completed: appointments.filter(app => app.status === 'completed').length,
                cancelled: appointments.filter(app => app.status === 'cancelled').length,
                noShow: appointments.filter(app => app.status === 'no-show').length,
                emergency: appointments.filter(app => app.type === 'emergency').length,
                revenue: appointments
                    .filter(app => app.status === 'completed')
                    .reduce((sum, app) => sum + app.fee.amount,0),
                    uniquePatients: [...new Set(appointments.map(app => app.patientId.toString()))].length
                };
    
                res.json({
                    success: true,
                    data: {
                        overall: doctor.statistics,
                        period: statistics
                    }
                });
            } catch (error) {
                console.error('Get statistics error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching statistics'
                });
            }
        },
    
        // Update services offered
        updateServices: async (req, res) => {
            try {
                const userId = req.user.id;
                const { services } = req.body;
    
                const doctor = await Doctor.findOneAndUpdate(
                    { userId },
                    { 
                        $set: { services },
                        updatedAt: Date.now()
                    },
                    { new: true }
                );
    
                if (!doctor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Doctor profile not found'
                    });
                }
    
                res.json({
                    success: true,
                    data: doctor.services
                });
            } catch (error) {
                console.error('Update services error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error updating services'
                });
            }
        },
    
        // Block time slots
        blockTimeSlots: async (req, res) => {
            try {
                const userId = req.user.id;
                const { date, slots, reason } = req.body;
                
                const doctor = await Doctor.findOne({ userId });
                if (!doctor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Doctor profile not found'
                    });
                }
    
                // Find the custom time slots for this date
                const customSlotIndex = doctor.availability.customTimeSlots.findIndex(
                    slot => slot.date.toDateString() === new Date(date).toDateString()
                );
    
                if (customSlotIndex >= 0) {
                    // Update existing custom slots
                    slots.forEach(slot => {
                        const existingSlotIndex = doctor.availability.customTimeSlots[customSlotIndex].slots.findIndex(
                            s => s.startTime === slot.startTime && s.endTime === slot.endTime
                        );
    
                        if (existingSlotIndex >= 0) {
                            doctor.availability.customTimeSlots[customSlotIndex].slots[existingSlotIndex].available = false;
                        } else {
                            doctor.availability.customTimeSlots[customSlotIndex].slots.push({
                                ...slot,
                                available: false
                            });
                        }
                    });
                } else {
                    // Create new custom slots entry
                    doctor.availability.customTimeSlots.push({
                        date: new Date(date),
                        slots: slots.map(slot => ({
                            ...slot,
                            available: false
                        }))
                    });
                }
    
                await doctor.save();
    
                res.json({
                    success: true,
                    message: 'Time slots blocked successfully',
                    data: doctor.availability.customTimeSlots
                });
            } catch (error) {
                console.error('Block time slots error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error blocking time slots'
                });
            }
        },
    
        // Unblock time slots
        unblockTimeSlots: async (req, res) => {
            try {
                const userId = req.user.id;
                const { date, slots } = req.body;
                
                const doctor = await Doctor.findOne({ userId });
                if (!doctor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Doctor profile not found'
                    });
                }
    
                const customSlotIndex = doctor.availability.customTimeSlots.findIndex(
                    slot => slot.date.toDateString() === new Date(date).toDateString()
                );
    
                if (customSlotIndex >= 0) {
                    slots.forEach(slot => {
                        const existingSlotIndex = doctor.availability.customTimeSlots[customSlotIndex].slots.findIndex(
                            s => s.startTime === slot.startTime && s.endTime === slot.endTime
                        );
    
                        if (existingSlotIndex >= 0) {
                            doctor.availability.customTimeSlots[customSlotIndex].slots[existingSlotIndex].available = true;
                        }
                    });
    
                    // Remove the custom slot entry if all slots are available
                    if (doctor.availability.customTimeSlots[customSlotIndex].slots.every(slot => slot.available)) {
                        doctor.availability.customTimeSlots.splice(customSlotIndex, 1);
                    }
    
                    await doctor.save();
                }
    
                res.json({
                    success: true,
                    message: 'Time slots unblocked successfully',
                    data: doctor.availability.customTimeSlots
                });
            } catch (error) {
                console.error('Unblock time slots error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error unblocking time slots'
                });
            }
        },
    
        // Get available time slots for a specific date
        getAvailableSlots: async (req, res) => {
            try {
                const userId = req.user.id;
                const { date } = req.query;
                
                const doctor = await Doctor.findOne({ userId });
                if (!doctor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Doctor profile not found'
                    });
                }
    
                const queryDate = new Date(date);
                const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][queryDate.getDay()];
    
                // Check if doctor works on this day
                if (!doctor.availability.days.includes(dayOfWeek)) {
                    return res.json({
                        success: true,
                        data: {
                            available: false,
                            message: 'Doctor not available on this day'
                        }
                    });
                }
    
                // Get custom slots for this date if any
                const customSlots = doctor.availability.customTimeSlots.find(
                    slot => slot.date.toDateString() === queryDate.toDateString()
                );
    
                // Get appointments for this date
                const appointments = await Appointment.find({
                    doctorId: doctor._id,
                    appointmentDate: {
                        $gte: queryDate,
                        $lt: new Date(queryDate.setDate(queryDate.getDate() + 1))
                    }
                }).select('timeSlot');
    
                // Get regular slots if no custom slots
                let availableSlots = customSlots ? 
                    customSlots.slots.filter(slot => slot.available) : 
                    doctor.availability.timeSlots;
    
                // Filter out slots that have appointments
                availableSlots = availableSlots.filter(slot => {
                    return !appointments.some(app => 
                        app.timeSlot.startTime === slot.startTime &&
                        app.timeSlot.endTime === slot.endTime
                    );
                });
    
                res.json({
                    success: true,
                    data: {
                        available: availableSlots.length > 0,
                        slots: availableSlots,
                        appointmentDuration: doctor.availability.appointmentDuration
                    }
                });
            } catch (error) {
                console.error('Get available slots error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching available slots'
                });
            }
        },
        getDashboardData: async (req, res) => {
            try {
                const userId = req.user.id;
                const doctor = await Doctor.findOne({ userId });
    
                if (!doctor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Doctor profile not found'
                    });
                }
    
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
    
                // Get today's appointments
                const todayAppointments = await Appointment.find({
                    doctorId: doctor._id,
                    appointmentDate: {
                        $gte: today,
                        $lt: tomorrow
                    }
                }).populate('patientId', 'fullName');
    
                // Calculate total patients (unique patient count)
                const totalPatients = await Appointment.distinct('patientId', {
                    doctorId: doctor._id
                }).countDocuments();
    
                // Calculate upcoming appointments
                const upcomingAppointments = await Appointment.countDocuments({
                    doctorId: doctor._id,
                    appointmentDate: { $gt: today }
                });
    
                // Calculate earnings
                const completedAppointments = await Appointment.find({
                    doctorId: doctor._id,
                    status: 'completed'
                });
    
                const totalEarnings = completedAppointments.reduce(
                    (sum, appointment) => sum + (appointment.fee?.amount || 0), 
                    0
                );
    
                res.json({
                    success: true,
                    data: {
                        stats: {
                            totalPatients,
                            todayAppointments: todayAppointments.length,
                            upcomingAppointments,
                            totalEarnings
                        },
                        appointments: todayAppointments.map(apt => ({
                            _id: apt._id,
                            patientName: apt.patientId?.fullName || 'Unknown Patient',
                            time: `${apt.timeSlot.startTime} - ${apt.timeSlot.endTime}`,
                            type: apt.type,
                            status: apt.status
                        }))
                    }
                });
            } catch (error) {
                console.error('Get dashboard data error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching dashboard data'
                });
            }
        },
    
        getTodayAppointments: async (req, res) => {
            try {
                const userId = req.user.id;
                const doctor = await Doctor.findOne({ userId });
    
                if (!doctor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Doctor profile not found'
                    });
                }
    
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
    
                const appointments = await Appointment.find({
                    doctorId: doctor._id,
                    appointmentDate: {
                        $gte: today,
                        $lt: tomorrow
                    }
                })
                .populate('patientId', 'fullName')
                .sort({ 'timeSlot.startTime': 1 });
    
                res.json({
                    success: true,
                    data: appointments.map(apt => ({
                        _id: apt._id,
                        patientName: apt.patientId?.fullName || 'Unknown Patient',
                        time: `${apt.timeSlot.startTime} - ${apt.timeSlot.endTime}`,
                        type: apt.type,
                        status: apt.status
                    }))
                });
            } catch (error) {
                console.error('Get today appointments error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching today\'s appointments'
                });
            }
        },
    
        getStats: async (req, res) => {
            try {
                const userId = req.user.id;
                const doctor = await Doctor.findOne({ userId });
    
                if (!doctor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Doctor profile not found'
                    });
                }
    
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
    
                // Get counts
                const totalPatients = await Appointment.distinct('patientId', {
                    doctorId: doctor._id
                }).countDocuments();
    
                const todayAppointments = await Appointment.countDocuments({
                    doctorId: doctor._id,
                    appointmentDate: {
                        $gte: today,
                        $lt: tomorrow
                    }
                });
    
                const upcomingAppointments = await Appointment.countDocuments({
                    doctorId: doctor._id,
                    appointmentDate: { $gt: today }
                });
    
                // Calculate earnings
                const completedAppointments = await Appointment.find({
                    doctorId: doctor._id,
                    status: 'completed'
                });
    
                const totalEarnings = completedAppointments.reduce(
                    (sum, appointment) => sum + (appointment.fee?.amount || 0),
                    0
                );
    
                res.json({
                    success: true,
                    data: {
                        totalPatients,
                        todayAppointments,
                        upcomingAppointments,
                        totalEarnings
                    }
                });
            } catch (error) {
                console.error('Get stats error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching stats'
                });
            }
        },
        searchDoctors: async (req, res) => {
            try {
                const {
                    specialization,
                    name,
                    city,
                    availability,
                    page = 1,
                    limit = 10
                } = req.query;
    
                let query = { status: 'active' };
    
                // Build search query
                if (specialization) {
                    query['professionalInfo.specialization'] = new RegExp(specialization, 'i');
                }
                if (name) {
                    query['personalInfo.fullName'] = new RegExp(name, 'i');
                }
                if (city) {
                    query['personalInfo.city'] = new RegExp(city, 'i');
                }
    
                // Get doctors with pagination
                const skip = (page - 1) * limit;
                const doctors = await Doctor.find(query)
                    .select('personalInfo professionalInfo availability pricing ratings bio')
                    .skip(skip)
                    .limit(parseInt(limit));
    
                const total = await Doctor.countDocuments(query);
    
                res.json({
                    success: true,
                    data: {
                        doctors,
                        pagination: {
                            total,
                            page: parseInt(page),
                            pages: Math.ceil(total / limit)
                        }
                    }
                });
            } catch (error) {
                console.error('Search doctors error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error searching doctors'
                });
            }
        },
    
        getDoctorDetails: async (req, res) => {
            try {
                const { doctorId } = req.params;
                const doctor = await Doctor.findById(doctorId)
                    .select('-calendarSettings.notifications -statistics');
    
                if (!doctor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Doctor not found'
                    });
                }
    
                res.json({
                    success: true,
                    data: doctor
                });
            } catch (error) {
                console.error('Get doctor details error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching doctor details'
                });
            }
        },
    
        getAvailableSlots: async (req, res) => {
            try {
                const { doctorId } = req.params;
                const { date } = req.query;
    
                const doctor = await Doctor.findById(doctorId);
                if (!doctor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Doctor not found'
                    });
                }
    
                const queryDate = new Date(date);
                const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][queryDate.getDay()];
    
                // Check if doctor works on this day
                if (!doctor.availability.days.includes(dayOfWeek)) {
                    return res.json({
                        success: true,
                        data: {
                            available: false,
                            message: 'Doctor not available on this day'
                        }
                    });
                }
    
                // Get existing appointments for the date
                const existingAppointments = await Appointment.find({
                    doctorId,
                    appointmentDate: {
                        $gte: new Date(new Date(date).setHours(0, 0, 0)),
                        $lt: new Date(new Date(date).setHours(23, 59, 59))
                    }
                }).select('timeSlot');
    
                // Get custom slots for this date if any
                const customSlots = doctor.availability.customTimeSlots.find(
                    slot => slot.date.toDateString() === queryDate.toDateString()
                );
    
                // Get available slots
                let availableSlots = customSlots ? 
                    customSlots.slots.filter(slot => slot.available) : 
                    doctor.availability.timeSlots;
    
                // Filter out booked slots
                availableSlots = availableSlots.filter(slot => {
                    return !existingAppointments.some(apt => 
                        apt.timeSlot.startTime === slot.startTime &&
                        apt.timeSlot.endTime === slot.endTime
                    );
                });
    
                res.json({
                    success: true,
                    data: {
                        available: availableSlots.length > 0,
                        slots: availableSlots,
                        appointmentDuration: doctor.availability.appointmentDuration,
                        consultationFee: doctor.pricing.consultationFee
                    }
                });
            } catch (error) {
                console.error('Get available slots error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching available slots'
                });
            }
        },
        searchDoctors: async (req, res) => {
            try {
                const {
                    specialization,
                    name,
                    city,
                    availability,
                    page = 1,
                    limit = 10
                } = req.query;
    
                let query = { status: 'active' };
    
                // Build search query
                if (specialization) {
                    query['professionalInfo.specialization'] = new RegExp(specialization, 'i');
                }
                if (name) {
                    query['personalInfo.fullName'] = new RegExp(name, 'i');
                }
                if (city) {
                    query['personalInfo.city'] = new RegExp(city, 'i');
                }
    
                console.log('Search query:', query);
    
                // Get doctors with pagination
                const skip = (page - 1) * limit;
                const doctors = await Doctor.find(query)
                    .select('personalInfo professionalInfo availability pricing ratings bio')
                    .skip(skip)
                    .limit(parseInt(limit));
    
                const total = await Doctor.countDocuments(query);
    
                console.log(`Found ${doctors.length} doctors out of ${total}`);
    
                res.json({
                    success: true,
                    data: {
                        doctors,
                        pagination: {
                            total,
                            page: parseInt(page),
                            pages: Math.ceil(total / limit)
                        }
                    }
                });
            } catch (error) {
                console.error('Search doctors error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error searching doctors'
                });
            }
        },
        getDoctorDetails: async (req, res) => {
            try {
                const { doctorId } = req.params;
                console.log('Fetching details for doctor:', doctorId);
    
                const doctor = await Doctor.findById(doctorId)
                    .select('-calendarSettings.notifications -statistics');
    
                if (!doctor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Doctor not found'
                    });
                }
    
                res.json({
                    success: true,
                    data: doctor
                });
            } catch (error) {
                console.error('Get doctor details error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching doctor details',
                    error: error.message
                });
            }
        }
        
        
    };
    
    module.exports = doctorController;