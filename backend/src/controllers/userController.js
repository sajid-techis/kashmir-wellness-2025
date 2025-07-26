// src/controllers/userController.js
// This file contains controller functions for managing user profiles.
// It now uses the UserService to abstract business logic and handles image uploads to Cloudinary.

const userService = require('../services/userService'); // Import the UserService
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility
const cloudinary = require('cloudinary').v2; // Import Cloudinary v2

// @desc    Get current logged in user
// @route   GET /api/v1/users/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // Delegate to UserService
    const user = await userService.getMe(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err); // Pass error to the error handling middleware
  }
};

// @desc    Update user details
// @route   PUT /api/v1/users/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // If a file was uploaded, handle Cloudinary upload
    if (req.file) {
      // --- NEW DEBUGGING LOGS ---
      console.log('--- Cloudinary Upload Debug ---');
      console.log('File received in userController:', req.file.originalname);
      console.log('Detected MIME type in controller:', req.file.mimetype);
      console.log('File buffer length in controller:', req.file.buffer ? req.file.buffer.length : 'Buffer is null/undefined');
      console.log('--- End Cloudinary Upload Debug ---');

      // Add a check to ensure buffer is not empty
      if (!req.file.buffer || req.file.buffer.length === 0) {
        return next(new ErrorResponse('Uploaded file buffer is empty or invalid.', 400));
      }
      // --- END NEW DEBUGGING LOGS ---

      // Get the current user to potentially delete the old image from Cloudinary
      const currentUser = await userService.getMe(req.user.id);

      // Upload image to Cloudinary
      // Using upload_stream for buffer uploads
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'kashmir-wellness/users', resource_type: 'image' }, // Specify folder and resource type
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload_stream callback error:', error); // Log Cloudinary's internal error
              reject(new ErrorResponse('Image upload to Cloudinary failed', 500));
            }
            resolve(result);
          }
        ).end(req.file.buffer); // Pass the image buffer
      });

      // Set the Cloudinary URL to updateData
      updateData.imageUrl = result.secure_url;

      // Optional: Delete old image from Cloudinary if it was a Cloudinary URL
      if (currentUser.imageUrl && currentUser.imageUrl.includes('res.cloudinary.com')) {
        const publicId = currentUser.imageUrl.split('/').pop().split('.')[0];
        // Extract folder path if present (e.g., kashmir-wellness/users/public_id)
        const folderPath = currentUser.imageUrl.split('/').slice(-3, -1).join('/'); // Gets 'kashmir-wellness/users'
        const fullPublicId = folderPath ? `${folderPath}/${publicId}` : publicId;

        console.log(`Attempting to delete old Cloudinary image with public_id: ${fullPublicId}`);
        await cloudinary.uploader.destroy(fullPublicId, (error, result) => {
          if (error) console.error('Error deleting old image from Cloudinary:', error);
          else console.log('Old image deleted from Cloudinary:', result);
        });
      }
    }

    // Delegate to UserService, passing the user ID and update data (including Cloudinary URL if uploaded)
    const user = await userService.updateDetails(req.user.id, updateData);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err); // Pass error to the error handling middleware
  }
};
