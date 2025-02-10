// controllers/appointmentController.js
const Appointment = require('../Models/appointmentModel');
const Doctor = require('../Models/doctorModel');

const appointmentController = {
    // Get all appointments for a doctor
    getDoctorAppointments: async (req, res) => {
        try {
            const doctor = await Doctor.findOne({ userId: req.user.id });
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            const { startDate, endDate, status } = req.query;
            let query = { doctorId: doctor._id };

            // Add date range filter if provided
            if (startDate && endDate) {
                query.appointmentDate = {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                };
            }

            // Add status filter if provided
            if (status) {
                query.status = status;
            }

            const appointments = await Appointment.find(query)
                .populate('patientId', 'fullName contactNumber')
                .sort({ appointmentDate: 1, 'timeSlot.startTime': 1 });

            res.json({
                success: true,
                data: appointments
            });
        } catch (error) {
            console.error('Get doctor appointments error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching appointments'
            });
        }
    },

    // Get appointments for a specific date
    getDoctorAppointmentsByDate: async (req, res) => {
        try {
            const doctor = await Doctor.findOne({ userId: req.user.id });
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            const date = new Date(req.params.date);
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);

            const appointments = await Appointment.find({
                doctorId: doctor._id,
                appointmentDate: {
                    $gte: date,
                    $lt: nextDay
                }
            })
            .populate('patientId', 'fullName contactNumber')
            .sort({ 'timeSlot.startTime': 1 });

            res.json({
                success: true,
                data: appointments
            });
        } catch (error) {
            console.error('Get appointments by date error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching appointments'
            });
        }
    },

    // Get detailed information about a specific appointment
    getAppointmentDetails: async (req, res) => {
        try {
            const doctor = await Doctor.findOne({ userId: req.user.id });
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            const appointment = await Appointment.findOne({
                _id: req.params.id,
                doctorId: doctor._id
            }).populate('patientId');

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            res.json({
                success: true,
                data: appointment
            });
        } catch (error) {
            console.error('Get appointment details error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching appointment details'
            });
        }
    },

    // Update appointment status
    updateAppointmentStatus: async (req, res) => {
        try {
            const { status } = req.body;
            const doctor = await Doctor.findOne({ userId: req.user.id });
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            const appointment = await Appointment.findOneAndUpdate(
                {
                    _id: req.params.id,
                    doctorId: doctor._id
                },
                { status },
                { new: true }
            );

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            res.json({
                success: true,
                data: appointment
            });
        } catch (error) {
            console.error('Update appointment status error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating appointment status'
            });
        }
    },

    // Update appointment notes
    updateAppointmentNotes: async (req, res) => {
        try {
            const { notes, diagnosis } = req.body;
            const doctor = await Doctor.findOne({ userId: req.user.id });
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            const appointment = await Appointment.findOneAndUpdate(
                {
                    _id: req.params.id,
                    doctorId: doctor._id
                },
                { notes, diagnosis },
                { new: true }
            );

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            res.json({
                success: true,
                data: appointment
            });
        } catch (error) {
            console.error('Update appointment notes error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating appointment notes'
            });
        }
    },

    // Add prescription to appointment
    addPrescription: async (req, res) => {
        try {
            const { prescriptions } = req.body;
            const doctor = await Doctor.findOne({ userId: req.user.id });
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            const appointment = await Appointment.findOneAndUpdate(
                {
                    _id: req.params.id,
                    doctorId: doctor._id
                },
                { $push: { prescriptions: { $each: prescriptions } } },
                { new: true }
            );

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            res.json({
                success: true,
                data: appointment
            });
        } catch (error) {
            console.error('Add prescription error:', error);
            res.status(500).json({
                success: false,
                message: 'Error adding prescription'
            });
        }
    },
    bookAppointment: async (req, res) => {
        try {
            const userId = req.user.id;
            const {
                doctorId,
                appointmentDate,
                timeSlot,
                type,
                description,
                symptoms
            } = req.body;

            // Get patient profile
            const patient = await Patient.findOne({ userId });
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient profile not found'
                });
            }

            // Get doctor details for validation and fee
            const doctor = await Doctor.findById(doctorId);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Doctor not found'
                });
            }

            // Validate slot availability
            const existingAppointment = await Appointment.findOne({
                doctorId,
                appointmentDate,
                'timeSlot.startTime': timeSlot.startTime,
                'timeSlot.endTime': timeSlot.endTime
            });

            if (existingAppointment) {
                return res.status(400).json({
                    success: false,
                    message: 'This time slot is no longer available'
                });
            }

            // Create appointment
            const appointment = new Appointment({
                doctorId,
                patientId: patient._id,
                appointmentDate,
                timeSlot,
                duration: doctor.availability.appointmentDuration,
                type,
                description,
                symptoms,
                fee: {
                    amount: doctor.pricing.consultationFee,
                    currency: doctor.pricing.currency
                }
            });

            await appointment.save();

            // Update doctor's statistics
            await Doctor.findByIdAndUpdate(doctorId, {
                $inc: {
                    'statistics.totalAppointments': 1
                }
            });

            res.status(201).json({
                success: true,
                data: appointment
            });
        } catch (error) {
            console.error('Book appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Error booking appointment'
            });
        }
    },

    getPatientAppointments: async (req, res) => {
        try {
            const userId = req.user.id;
            const patient = await Patient.findOne({ userId });
            
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient profile not found'
                });
            }

            const { status, page = 1, limit = 10 } = req.query;
            let query = { patientId: patient._id };

            if (status) {
                query.status = status;
            }

            const skip = (page - 1) * limit;
            const appointments = await Appointment.find(query)
                .populate('doctorId', 'personalInfo.fullName professionalInfo.specialization')
                .sort({ appointmentDate: -1, 'timeSlot.startTime': -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Appointment.countDocuments(query);

            res.json({
                success: true,
                data: {
                    appointments,
                    pagination: {
                        total,
                        page: parseInt(page),
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get patient appointments error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching appointments'
            });
        }
    }
};

module.exports = appointmentController;