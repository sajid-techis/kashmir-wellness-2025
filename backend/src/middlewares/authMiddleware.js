// src/middlewares/authMiddleware.js
// This file defines middleware functions to protect routes,
// ensuring only authenticated users with valid JWT tokens can access them.

const jwt = require('jsonwebtoken'); // For verifying JWT tokens
const User = require('../models/User'); // Import the User model
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility

// @desc    Protect routes
// This middleware checks for a valid JWT token in the request headers or cookies.
// If a valid token is found, it decodes the user ID and attaches the user object to the request.
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers (Bearer Token)
  // Example: Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies (if sent by browser after login)
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from the decoded token payload and attach to request
    // We explicitly select '-password' to ensure password is not included
    req.user = await User.findById(decoded.id).select('-password');

    // If user not found (e.g., deleted after token issued)
    if (!req.user) {
      return next(new ErrorResponse('User not found for this token', 401));
    }

    next(); // Proceed to the next middleware/controller
  } catch (err) {
    // Handle token verification errors (e.g., expired, invalid)
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// @desc    Authorize users by specific roles
// This middleware takes an array of roles and checks if the authenticated user's role
// matches any of the allowed roles.
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403 // Forbidden
        )
      );
    }
    next(); // User is authorized, proceed
  };
};
