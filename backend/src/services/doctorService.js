// src/services/doctorService.js
// This file contains business logic related to doctor operations.
// It abstracts database interactions and other complex logic away from the controllers.

const Doctor = require('../models/Doctor');
const User = require('../models/User'); // To update user role
const ErrorResponse = require('../utils/errorHandler');
const APIFeatures = require('../utils/apiFeatures');

class DoctorService {
  /**
   * @desc Create a new doctor profile
   * @param {Object} doctorData - Data for the new doctor profile
   * @param {string} userId - ID of the user creating the doctor profile
   * @returns {Promise<Object>} The newly created doctor profile
   * @throws {ErrorResponse} If user already has a doctor profile or user not found
   */
  async createDoctor(doctorData, userId) {
    // Check if a doctor profile already exists for this user
    const existingDoctor = await Doctor.findOne({ user: userId });
    if (existingDoctor) {
      throw new ErrorResponse('This user already has a doctor profile', 400);
    }

    // Ensure the user exists and update their role to 'doctor'
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }
    user.role = 'doctor';
    await user.save({ validateBeforeSave: false }); // Bypass user model validation for role change

    // Construct the location object if latitude and longitude are provided
    if (doctorData.latitude && doctorData.longitude) {
      doctorData.location = {
        type: 'Point',
        coordinates: [parseFloat(doctorData.longitude), parseFloat(doctorData.latitude)],
      };
      // Remove individual lat/lon from doctorData to avoid saving them separately
      delete doctorData.latitude;
      delete doctorData.longitude;
    } else if (doctorData.clinicAddress) {
      // If no coordinates, but clinicAddress is provided, you might want to geocode it here
      // For now, we'll require coordinates if location is to be stored.
      throw new ErrorResponse('Latitude and longitude are required for clinic location.', 400);
    }


    const doctor = await Doctor.create({ ...doctorData, user: userId });
    return doctor;
  }

  /**
   * @desc Get all doctor profiles with optional filtering, sorting, and pagination
   * @param {Object} queryParams - Query parameters from the request (req.query)
   * @returns {Promise<Object>} An object containing count and an array of doctors
   */
  async getDoctors(queryParams) {
    const features = new APIFeatures(Doctor.find(), queryParams)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doctors = await features.query;
    const count = await Doctor.countDocuments(features.query.getQuery()); // Get total count before pagination

    return { count, data: doctors };
  }

  /**
   * @desc Get a single doctor profile by ID
   * @param {string} id - The ID of the doctor profile to retrieve
   * @returns {Promise<Object>} The doctor profile object
   * @throws {ErrorResponse} If doctor profile is not found
   */
  async getDoctor(id) {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      throw new ErrorResponse(`Doctor not found with id of ${id}`, 404);
    }
    return doctor;
  }

  /**
   * @desc Update a doctor profile
   * @param {string} id - The ID of the doctor profile to update
   * @param {Object} updateData - Data to update the doctor profile with
   * @returns {Promise<Object>} The updated doctor profile
   * @throws {ErrorResponse} If doctor profile is not found
   */
  async updateDoctor(id, updateData) {
    // Handle location update if latitude and longitude are provided
    if (updateData.latitude && updateData.longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [parseFloat(updateData.longitude), parseFloat(updateData.latitude)],
      };
      delete updateData.latitude;
      delete updateData.longitude;
    } else if (updateData.clinicAddress && !updateData.location && !updateData.latitude && !updateData.longitude) {
      // If clinicAddress is updated but no coordinates, you might want to handle this
      // e.g., clear location or require coordinates. For now, we'll let clinicAddress update
      // but location won't be set unless coordinates are provided.
    } else if (updateData.location && updateData.location.coordinates && updateData.location.coordinates.length !== 2) {
        throw new ErrorResponse('Invalid coordinates format. Expected [longitude, latitude].', 400);
    }


    const doctor = await Doctor.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Run Mongoose validators on update
    });

    if (!doctor) {
      throw new ErrorResponse(`Doctor not found with id of ${id}`, 404);
    }
    return doctor;
  }

  /**
   * @desc Delete a doctor profile
   * @param {string} id - The ID of the doctor profile to delete
   * @returns {Promise<void>}
   * @throws {ErrorResponse} If doctor profile is not found
   */
  async deleteDoctor(id) {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      throw new ErrorResponse(`Doctor not found with id of ${id}`, 404);
    }
    // Also delete the associated user or revert their role if necessary
    // For now, just delete the doctor profile.
    await doctor.deleteOne();
  }
}

module.exports = new DoctorService();
