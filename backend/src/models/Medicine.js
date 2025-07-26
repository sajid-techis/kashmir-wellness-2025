// src/models/Medicine.js
// This file defines the Mongoose schema for the Medicine model.
// It includes fields for medicine details, stock, price, and category,
// and now an array of imageUrls for their profile pictures, ready for Cloudinary.

const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a medicine name'],
    unique: true, // Medicine names should be unique
    trim: true,
    maxlength: [100, 'Medicine name can not be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description can not be more than 500 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative'],
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Pain Relief',
      'Antibiotics',
      'Vitamins',
      'Cough & Cold',
      'Digestive Health',
      'Skin Care',
      'First Aid',
      'Other',
    ],
    default: 'Other',
  },
  imageUrl: {
    type: [String], // Changed to an array of Strings for multiple images
    default: ['https://placehold.co/400x300/E0F2F7/000000?text=Medicine'], // Default now an array with one placeholder
  },
  manufacturer: {
    type: String,
    maxlength: [100, 'Manufacturer name can not be more than 100 characters'],
  },
  expirationDate: {
    type: Date,
    // You might want to add validation here to ensure it's a future date
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Optional: Reference to the user who added/updated this medicine (e.g., admin)
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // References the User model
    required: false, // Set to true if only specific roles can add medicines
  },
});

module.exports = mongoose.model('Medicine', MedicineSchema);
