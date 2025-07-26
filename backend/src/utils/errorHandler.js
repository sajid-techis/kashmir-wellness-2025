// src/utils/errorHandler.js
// This file defines a custom ErrorResponse class that extends the built-in Error class.
// It allows us to attach a custom status code to errors, making it easier
// for our centralized error handling middleware to send appropriate responses.

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message); // Call the parent Error class constructor with the message
    this.statusCode = statusCode; // Add a custom statusCode property
  }
}

module.exports = ErrorResponse;
