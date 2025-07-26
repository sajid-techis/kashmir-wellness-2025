// src/routes/userRoutes.js
// This file defines the API routes for user profile management.
// It includes routes to get the current user's profile and update it.
// These routes are protected by the authentication middleware and now include image upload.

const express = require('express');
const {
  getMe,
  updateDetails,
} = require('../controllers/userController'); // Import controller functions

const { protect } = require('../middlewares/authMiddleware'); // Import authentication middleware
const upload = require('../middlewares/uploadMiddleware'); // Import the upload middleware

const router = express.Router(); // Create a new router instance

// All user profile routes require authentication
router.use(protect);

// Define the user profile routes
// GET /api/v1/users/me - Get current logged-in user's profile
router.route('/me').get(getMe);

// PUT /api/v1/users/updatedetails - Update current logged-in user's details
// The 'upload.single('image')' middleware handles the file upload for a single image field named 'image'.
router.route('/updatedetails').put(upload.single('image'), updateDetails);

module.exports = router;
