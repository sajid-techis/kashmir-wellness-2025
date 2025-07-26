// src/models/Lab.js
// This file defines the Mongoose schema for the Lab model.
// It includes fields for lab details, services offered, and contact information.
// NEW: Added location field for precise coordinates.

const mongoose = require('mongoose');

const LabSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a lab name'],
    unique: true, // Lab names should be unique
    trim: true,
    maxlength: [100, 'Lab name can not be more than 100 characters'],
  },
  address: {
    type: String,
    required: [true, 'Please add a lab address'],
    maxlength: [200, 'Address can not be longer than 200 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    maxlength: [20, 'Phone number can not be longer than 20 characters'],
  },
  email: {
    type: String,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please add a valid email',
    ],
  },
  services: {
    type: [String], // Array of strings for services offered (e.g., "Blood Test", "Urine Test", "X-Ray")
    default: [],
  },
  operatingHours: {
    type: String, // e.g., "Mon-Sat: 9 AM - 6 PM"
    maxlength: [100, 'Operating hours can not be more than 100 characters'],
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
      required: [true, 'Please provide coordinates for the lab location'],
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Optional: Reference to the user who added/updated this lab (e.g., admin)
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // References the User model
    required: false, // Set to true if only specific roles can add labs
  },
});

module.exports = mongoose.model('Lab', LabSchema);
