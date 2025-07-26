// src/routes/doctorRoutes.js
// This file defines the API routes for doctor management (CRUD operations).
// It utilizes the authentication and authorization middleware to protect certain routes.
// It also integrates the upload middleware for single image handling.

const express = require('express');
const {
  getDoctors,
  getDoctor,
  addDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController'); // Import controller functions

const { protect, authorize } = require('../middlewares/authMiddleware'); // Import authentication middleware
const upload = require('../middlewares/uploadMiddleware'); // Import the upload middleware

const router = express.Router(); // Create a new router instance

// Public routes: Anyone can view doctors
router.route('/').get(getDoctors);
router.route('/:id').get(getDoctor);

// Private routes: Only users with 'admin' role can add, update, delete doctors
// The 'protect' middleware ensures only authenticated users can access these.
// The 'authorize' middleware further restricts access based on roles.
// The 'upload.single('image')' middleware handles the file upload for a single image field named 'image'.
router.route('/').post(protect, authorize('admin'), upload.single('image'), addDoctor);
router
  .route('/:id')
  .put(protect, authorize('admin', 'doctor'), upload.single('image'), updateDoctor) // Admin can update any, doctor can update their own
  .delete(protect, authorize('admin'), deleteDoctor);

module.exports = router;
