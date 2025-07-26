// src/models/Appointment.js
// This file defines the Mongoose schema for the Appointment model.
// It includes fields for appointment details, linking to User and Doctor models,
// and managing appointment status.
// UPDATED: Fixed 'location' field to use GeoJSON schema.
// UPDATED: Made 'doctor' field conditionally required based on appointment 'type'.
// FIXED: Removed explicit 'required: false' from 'location' field to resolve TypeError.

const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Appointment must belong to a user'],
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
    // Make doctor required only if the appointment type is NOT 'lab'
    required: function() { return this.type !== 'lab'; },
    // If doctor is not required, it can be null
    default: null
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please specify the appointment date'],
  },
  appointmentTime: {
    type: String, // Store as string (e.g., "10:00 AM", "14:30") for simplicity, or use Date for full timestamp
    required: [true, 'Please specify the appointment time'],
  },
  type: {
    type: String,
    enum: ['online', 'offline', 'lab'], // Online doctor, offline doctor, or lab appointment
    default: 'offline', // Default to 'offline' for doctor appointments
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  reason: {
    type: String,
    maxlength: [500, 'Reason can not be more than 500 characters'],
  },
  // If type is 'lab', this field will be required
  lab: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lab',
    required: function() { return this.type === 'lab'; }, // Required only if type is 'lab'
    // If lab is not required, it can be null
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // NEW: Define location as a GeoJSON Point object for storing coordinates and address
  // Removed 'required: false' as fields are optional by default if 'required: true' is not set.
  // This addresses the TypeError where 'required' was misinterpreted as a type.
  location: {
    type: {
      type: String, // Must be 'Point' for GeoJSON Point type
      enum: ['Point'],
      default: 'Point', // Default to Point
    },
    coordinates: {
      type: [Number], // Array of numbers: [longitude, latitude]
      index: '2dsphere', // Create a 2dsphere index for geospatial queries
      default: [0, 0], // Default coordinates, will be updated by service
    },
    address: {
      type: String,
      maxlength: [200, 'Address can not be more than 200 characters'],
      default: 'N/A', // Default address
    },
    // The 'location' field itself is optional by default because 'required: true' is not specified here.
  }
});

// Add a compound unique index to prevent duplicate appointments for the same user/doctor/time
// This can be adjusted based on business logic (e.g., allow multiple appointments for same user/doctor on different times)
// NOTE: This index currently includes 'doctor'. If you need unique appointments for labs,
// you might need separate indexes or more complex logic. For simplicity, keeping it as is for now.
AppointmentSchema.index({ user: 1, doctor: 1, appointmentDate: 1, appointmentTime: 1 }, { unique: true });


module.exports = mongoose.model('Appointment', AppointmentSchema);
