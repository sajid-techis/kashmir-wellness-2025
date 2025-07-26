// src/middlewares/errorMiddleware.js
// This file defines a centralized error handling middleware for the Express application.
// It catches errors passed via next(err) and formats them into a consistent
// JSON response, handling specific types of errors (e.g., CastError, Duplicate Key, Validation).

const ErrorResponse = require('../utils/errorHandler'); // Import our custom error class

const errorHandler = (err, req, res, next) => {
  let error = { ...err }; // Create a copy of the error object
  error.message = err.message; // Ensure message is copied

  // Log to console for dev
  console.error(err);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose Duplicate Key Error (e.g., duplicate email)
  if (err.code === 11000) {
    const message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Validation Error (e.g., missing required field)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message.join(', '), 400);
  }

  // Send the error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
