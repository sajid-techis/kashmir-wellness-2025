// src/routes/appointmentRoutes.js
// This file defines the API routes for appointment management (CRUD operations).
// It utilizes the authentication and authorization middleware to protect certain routes.
// UPDATED: Added a specific GET route for /book-lab to prevent it from being caught by /:id.

const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController'); // Import controller functions

const { protect, authorize } = require('../middlewares/authMiddleware'); // Import authentication middleware
const ErrorResponse = require('../utils/errorHandler'); // Import ErrorResponse for specific error handling

const router = express.Router(); // Create a new router instance

// All appointment routes require authentication
router.use(protect);

// IMPORTANT: Specific routes must come BEFORE dynamic routes (like /:id)
// This route explicitly handles GET requests to /api/v1/appointments/book-lab.
// It's not an API endpoint for data, but a frontend page path.
// We return a 404 to clarify it's not a valid API GET endpoint.
router.route('/book-lab')
  .get((req, res, next) => {
    // This endpoint is not designed for direct GET requests from the API.
    // It's a frontend page path.
    // The actual booking happens via a POST request to /api/v1/appointments.
    next(new ErrorResponse('This API endpoint is not for direct GET requests. Use POST /api/v1/appointments to create an appointment.', 404));
  });

// Routes for getting all appointments and creating a new appointment
// getAppointments: Users can see their own, Doctors can see theirs, Admins/Lab Staff can see all.
// createAppointment: Any authenticated user can create an appointment.
router.route('/').get(getAppointments).post(createAppointment);

// Routes for specific appointment by ID
// getAppointment: User can see their own, Doctor can see theirs, Admin/Lab Staff can see any.
// updateAppointment: Admin can update any, Doctor can update their own (status/reason), User can cancel their own.
// deleteAppointment: Only Admin can delete.
router
  .route('/:id')
  .get(getAppointment)
  .put(updateAppointment) // Authorization handled within controller based on role
  .delete(authorize('admin'), deleteAppointment); // Only admin can delete

module.exports = router;
