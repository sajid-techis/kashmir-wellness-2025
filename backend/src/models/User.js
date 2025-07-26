// src/models/User.js
// This file defines the Mongoose schema for the User model.
// It includes fields for user authentication and profile information.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For generating JWT tokens
const crypto = require('crypto'); // For generating password reset tokens

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true, // Ensures email addresses are unique
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Prevents the password from being returned in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'doctor', 'admin', 'lab_staff'], // Define possible roles
    default: 'user', // Default role for new users
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number can not be longer than 20 characters'],
  },
  address: {
    type: String,
    maxlength: [100, 'Address can not be longer than 100 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
   imageUrl: {
    type: String,
    default: 'https://placehold.co/400x300/E0F2F7/000000?text=Medicine', // Placeholder image
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Mongoose Middleware: Encrypt password using bcrypt before saving the user
UserSchema.pre('save', async function (next) {
  // Only hash if the password has been modified (or is new)
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

// Mongoose Method: Compare user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // Use bcrypt.compare to compare the plain text password with the hashed password
  // 'this.password' refers to the hashed password stored in the database
  return await bcrypt.compare(enteredPassword, this.password);
};

// Mongoose Method: Generate and return JWT token
UserSchema.methods.getSignedJwtToken = function () {
  // Sign the JWT with the user's ID and the secret from environment variables
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE, // Token expiration time
  });
};

// Mongoose Method: Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate a random token (e.g., 20 bytes, converted to hex string)
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash the reset token and set it to resetPasswordToken field
  // We hash it because we don't want to store the plain token in the database
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token expire time (e.g., 10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now

  return resetToken; // Return the unhashed token to the user (e.g., via email)
};

module.exports = mongoose.model('User', UserSchema);
