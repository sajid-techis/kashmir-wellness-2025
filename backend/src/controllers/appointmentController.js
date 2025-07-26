// src/controllers/appointmentController.js
// This file contains controller functions for managing appointments.
// It now uses the AppointmentService to abstract business logic.

const appointmentService = require('../services/appointmentService'); // Import the AppointmentService
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility
// APIFeatures is now used within the service, so it's not directly needed here
// const APIFeatures = require('../utils/apiFeatures');

// @desc    Get all appointments
// @route   GET /api/v1/appointments
// @access  Private (Users can see their own, Admin/Doctor can see all or specific)
exports.getAppointments = async (req, res, next) => {
  try {
    // Delegate to AppointmentService, passing query parameters and authenticated user
    const { count, data } = await appointmentService.getAppointments(req.query, req.user);

    res.status(200).json({
      success: true,
      count: count,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single appointment
// @route   GET /api/v1/appointments/:id
// @access  Private (User can see their own, Admin/Doctor can see specific)
exports.getAppointment = async (req, res, next) => {
  try {
    // Delegate to AppointmentService, passing ID and authenticated user
    const appointment = await appointmentService.getAppointment(req.params.id, req.user);

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new appointment
// @route   POST /api/v1/appointments
// @access  Private (Authenticated users only)
exports.createAppointment = async (req, res, next) => {
  try {
    // Delegate to AppointmentService, passing request body and user ID
    const appointment = await appointmentService.createAppointment(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update appointment status/details
// @route   PUT /api/v1/appointments/:id
// @access  Private (Admin, Doctor, or User for cancellation)
exports.updateAppointment = async (req, res, next) => {
  try {
    // Delegate to AppointmentService, passing ID, update data, and authenticated user
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body, req.user);

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete appointment
// @route   DELETE /api/v1/appointments/:id
// @access  Private (Admin only)
exports.deleteAppointment = async (req, res, next) => {
  try {
    // Delegate to AppointmentService, passing ID and authenticated user
    await appointmentService.deleteAppointment(req.params.id, req.user);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
