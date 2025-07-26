// src/routes/labRoutes.js
// This file defines the API routes for lab management (CRUD operations).
// It utilizes the authentication and authorization middleware to protect certain routes.

const express = require('express');
const {
  getLabs,
  getLab,
  addLab,
  updateLab,
  deleteLab,
} = require('../controllers/labController'); // Import controller functions

const { protect, authorize } = require('../middlewares/authMiddleware'); // Import authentication middleware

const router = express.Router(); // Create a new router instance

// Public routes: Anyone can view labs
router.route('/').get(getLabs);
router.route('/:id').get(getLab);

// Private routes: Only users with 'admin' role can add, update, delete labs
// The 'protect' middleware ensures only authenticated users can access these.
// The 'authorize' middleware further restricts access based on roles.
router.route('/').post(protect, authorize('admin'), addLab);
router
  .route('/:id')
  .put(protect, authorize('admin', 'lab_staff'), updateLab) // Admin can update any, lab_staff can update their own (if linked)
  .delete(protect, authorize('admin'), deleteLab);

module.exports = router;
