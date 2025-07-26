// src/models/Doctor.js
// This file defines the Mongoose schema and model for Doctor profiles.

const mongoose = require('mongoose');
const validator = require('validator'); // For email validation

const DoctorSchema = new mongoose.Schema({
  user: { // Link to the User model (for authentication and basic user info)
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Doctor must be linked to a user account'],
    unique: true, // Ensure one doctor profile per user
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name can not be longer than 100 characters'],
  },
  specialization: {
    type: String,
    required: [true, 'Please add a specialization'],
    trim: true,
    maxlength: [100, 'Specialization can not be longer than 100 characters'],
  },
  experience: {
    type: Number,
    required: [true, 'Please add years of experience'],
    min: [0, 'Experience cannot be negative'],
  },
  qualifications: {
    type: [String], // Array of strings (e.g., ['MBBS', 'MD Cardiology'])
    required: false,
  },
  clinicAddress: {
    type: String,
    maxlength: [200, 'Clinic address can not be longer than 200 characters'],
  },
  // NEW: Add location field for precise coordinates
  location: {
    type: {
      type: String,
      enum: ['Point'], // GeoJSON type for point data
      default: 'Point',
    },
    coordinates: {
      type: [Number], // Array of [longitude, latitude]
      index: '2dsphere', // Create a geospatial index for efficient queries
      required: [true, 'Please provide coordinates for the clinic location'],
    },
    // You can also store a human-readable address here, but clinicAddress is already doing that
    // formattedAddress: String,
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number can not be longer than 20 characters'],
    required: [true, 'Please add a phone number'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
  },
  imageUrl: {
    type: String,
    default: '/uploads/default-doctor.jpg', // Default image path
  },
  availability: {
    type: [String], // e.g., ['Monday', 'Wednesday', 'Friday'] or ['9 AM - 1 PM', '3 PM - 7 PM']
    required: false,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Doctor', DoctorSchema);
