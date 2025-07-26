// src/controllers/authController.js
// This file contains the controller functions for user authentication.
// It handles user registration, login, and token management, and now password reset.

const User = require('../models/User'); // Import the User model
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility
const crypto = require('crypto'); // For hashing the reset token
const sendEmail = require('../utils/sendEmail'); // UNCOMMENTED: Import the email utility

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address,
    });

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err); // Pass error to the error handling middleware
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user (select password explicitly as it's set to select: false in model)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401)); // User not found
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401)); // Password does not match
    }

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err); // Pass error to the error handling middleware
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // Send a generic success message even if user not found to prevent email enumeration
      return res.status(200).json({ success: true, data: 'Email sent' });
    }

    // Get reset token from user model method
    const resetToken = user.getResetPasswordToken();

    // Save the user with the new token and expiry
    await user.save({ validateBeforeSave: false }); // Do not run validators on save (password won't be present)

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      // UNCOMMENTED: Call the sendEmail utility
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
      });

      res.status(200).json({
        success: true,
        data: 'Email sent',
        // For testing purposes, you might want to return the token here, but remove in production
        // resetToken: resetToken
      });
    } catch (err) {
      console.error(err); // Log the actual email sending error
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token from URL parameter
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    // Find user by hashed token and check expiry
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }, // Token must not be expired
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired reset token', 400));
    }

    // Set new password
    user.password = req.body.password;

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save the user (this will trigger the pre-save hook to hash the new password)
    await user.save();

    // Send token response (login the user automatically after password reset)
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};


// Helper function to send JWT token in response
const sendTokenResponse = (user, statusCode, res) => {
  // Get token from model
  const token = user.getSignedJwtToken();

  // Parse JWT_COOKIE_EXPIRE to an integer, with a fallback to '7' days if not set
  const cookieExpireDays = parseInt(process.env.JWT_COOKIE_EXPIRE || '7', 10);

  const options = {
    expires: new Date(
      Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Makes the cookie inaccessible to client-side JavaScript
  };

  // If in production, secure the cookie (send only over HTTPS)
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options) // Set the token as an HTTP-only cookie
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};
