// src/services/userService.js
// This file contains business logic related to user operations.
// It abstracts database interactions and other complex logic away from the controllers.

const User = require('../models/User'); // Import the User model
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility

class UserService {
  /**
   * @desc Get current logged-in user's profile
   * @param {string} userId - The ID of the user to retrieve
   * @returns {Promise<Object>} The user object
   * @throws {ErrorResponse} If user is not found
   */
  async getMe(userId) {
    const user = await User.findById(userId).select('-password'); // Exclude password
    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }
    return user;
  }

  /**
   * @desc Update user details
   * @param {string} userId - The ID of the user to update
   * @param {Object} updateData - Data to update (name, email, phone, address, imageUrl)
   * @returns {Promise<Object>} The updated user object
   * @throws {ErrorResponse} If user is not found or validation fails
   */
  async updateDetails(userId, updateData) {
    // Only allow specific fields to be updated by the user
    const fieldsToUpdate = {
      name: updateData.name,
      email: updateData.email,
      phone: updateData.phone,
      address: updateData.address,
      imageUrl: updateData.imageUrl, // <-- ADDED THIS LINE
    };

    const user = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
      new: true, // Return the modified document rather than the original
      runValidators: true, // Run schema validators on the update operation
    });

    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }
    return user;
  }

  // You can add more user-related business logic here, e.g.,
  // async changePassword(userId, oldPassword, newPassword) { ... }
  // async deleteUser(userId) { ... }
}

module.exports = new UserService(); // Export an instance of the service
