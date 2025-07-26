// src/routes/authRoutes.js
// This file defines the API routes for user authentication (registration, login, and password reset).

const express = require('express');
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController'); // Import controller functions, including resetPassword

const router = express.Router(); // Create a new router instance

// Define the authentication routes
// POST /api/v1/auth/register - Route for user registration
router.post('/register', register);

// POST /api/v1/auth/login - Route for user login
router.post('/login', login);

// POST /api/v1/auth/forgotpassword - Route for initiating password reset
router.post('/forgotpassword', forgotPassword);

// PUT /api/v1/auth/resetpassword/:resettoken - Route for resetting password using a token
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
