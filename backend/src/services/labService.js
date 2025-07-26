// src/services/labService.js
// This file contains business logic related to lab operations.
// It abstracts database interactions and other complex logic away from the controllers.
// UPDATED: Handles location coordinates for adding and updating labs.

const Lab = require('../models/Lab'); // Import the Lab model
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility
const APIFeatures = require('../utils/apiFeatures'); // Import the APIFeatures utility

class LabService {
  /**
   * @desc Get all labs with optional filtering, sorting, and pagination
   * @param {Object} queryParams - Query parameters from the request (req.query)
   * @returns {Promise<Object>} An object containing count and an array of labs
   */
  async getLabs(queryParams) {
    const features = new APIFeatures(Lab.find(), queryParams)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const labs = await features.query;
    return { count: labs.length, data: labs };
  }

  /**
   * @desc Get a single lab by ID
   * @param {string} id - The ID of the lab to retrieve
   * @returns {Promise<Object>} The lab object
   * @throws {ErrorResponse} If lab is not found
   */
  async getLab(id) {
    const lab = await Lab.findById(id);
    if (!lab) {
      throw new ErrorResponse(`Lab not found with id of ${id}`, 404);
    }
    return lab;
  }

  /**
   * @desc Add a new lab
   * @param {Object} labData - Data for the new lab (includes latitude, longitude)
   * @param {string} userId - ID of the user (admin) adding the lab
   * @returns {Promise<Object>} The newly created lab object
   * @throws {ErrorResponse} If coordinates are missing
   */
  async addLab(labData, userId) {
    labData.user = userId; // Attach the user who is adding the lab

    // Construct the location object if latitude and longitude are provided
    if (labData.latitude && labData.longitude) {
      labData.location = {
        type: 'Point',
        coordinates: [parseFloat(labData.longitude), parseFloat(labData.latitude)],
      };
      // Remove individual lat/lon from labData to avoid saving them separately
      delete labData.latitude;
      delete labData.longitude;
    } else {
      // If coordinates are required by the model, throw an error if not provided
      throw new ErrorResponse('Latitude and longitude are required for lab location.', 400);
    }

    const lab = await Lab.create(labData);
    return lab;
  }

  /**
   * @desc Update an existing lab
   * @param {string} id - The ID of the lab to update
   * @param {Object} updateData - Data to update the lab with (includes latitude, longitude)
   * @param {Object} authUser - Authenticated user object (for authorization)
   * @returns {Promise<Object>} The updated lab object
   * @throws {ErrorResponse} If lab is not found or user is not authorized or invalid coordinates
   */
  async updateLab(id, updateData, authUser) {
    let lab = await Lab.findById(id);

    if (!lab) {
      throw new ErrorResponse(`Lab not found with id of ${id}`, 404);
    }

    // Authorization: Ensure user is the owner of the lab profile (if linked) or an admin
    if (lab.user && lab.user.toString() !== authUser.id && authUser.role !== 'admin') {
      throw new ErrorResponse(
        `User ${authUser.id} is not authorized to update this lab profile`,
        401
      );
    }

    // Handle location update if latitude and longitude are provided
    if (updateData.latitude && updateData.longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [parseFloat(updateData.longitude), parseFloat(updateData.latitude)],
      };
      delete updateData.latitude;
      delete updateData.longitude;
    } else if (updateData.location && updateData.location.coordinates && updateData.location.coordinates.length !== 2) {
        throw new ErrorResponse('Invalid coordinates format. Expected [longitude, latitude].', 400);
    }


    lab = await Lab.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    return lab;
  }

  /**
   * @desc Delete a lab
   * @param {string} id - The ID of the lab to delete
   * @param {Object} authUser - Authenticated user object (for authorization)
   * @returns {Promise<void>}
   * @throws {ErrorResponse} If lab is not found or user is not authorized
   */
  async deleteLab(id, authUser) {
    const lab = await Lab.findById(id);

    if (!lab) {
      throw new ErrorResponse(`Lab not found with id of ${id}`, 404);
    }

    // Authorization: Ensure user is an admin
    if (authUser.role !== 'admin') {
      throw new ErrorResponse(
        `User ${authUser.id} is not authorized to delete this lab profile`,
        401
      );
    }

    await lab.deleteOne();
  }
}

module.exports = new LabService(); // Export an instance of the service
