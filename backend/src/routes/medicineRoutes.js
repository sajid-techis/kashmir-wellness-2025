// src/routes/medicineRoutes.js
// This file defines the API routes for medicine management (CRUD operations).
// It utilizes the authentication and authorization middleware to protect certain routes.
// It also integrates the upload middleware for single image handling.

const express = require('express');
const {
  getMedicines,
  getMedicine,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} = require('../controllers/medicineController'); // Import controller functions

const { protect, authorize } = require('../middlewares/authMiddleware'); // Import authentication middleware
const upload = require('../middlewares/uploadMiddleware'); // Import the upload middleware

const router = express.Router(); // Create a new router instance

// Public routes: Anyone can view medicines
router.route('/').get(getMedicines);
router.route('/:id').get(getMedicine);

// Private routes: Only users with 'admin' or 'lab_staff' roles can add, update, delete medicines
// The 'protect' middleware ensures only authenticated users can access these.
// The 'authorize' middleware further restricts access based on roles.
// The 'upload.single('image')' middleware handles the file upload for a single image field named 'image'.
router
  .route('/')
  .post(protect, authorize('admin', 'lab_staff'), upload.single('image'), addMedicine);

router
  .route('/:id')
  .put(protect, authorize('admin', 'lab_staff'), upload.single('image'), updateMedicine)
  .delete(protect, authorize('admin', 'lab_staff'), deleteMedicine);

module.exports = router;
