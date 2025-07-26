// src/services/medicineService.js
// This file contains business logic related to medicine operations.
// It abstracts database interactions and other complex logic away from the controllers.

const Medicine = require('../models/Medicine'); // Import the Medicine model
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility
const APIFeatures = require('../utils/apiFeatures'); // Import the APIFeatures utility

class MedicineService {
  /**
   * @desc Get all medicines with optional filtering, sorting, and pagination
   * @param {Object} queryParams - Query parameters from the request (req.query)
   * @returns {Promise<Object>} An object containing count and an array of medicines
   */
  async getMedicines(queryParams) {
    const features = new APIFeatures(Medicine.find(), queryParams)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const medicines = await features.query;
    return { count: medicines.length, data: medicines };
  }

  /**
   * @desc Get a single medicine by ID
   * @param {string} id - The ID of the medicine to retrieve
   * @returns {Promise<Object>} The medicine object
   * @throws {ErrorResponse} If medicine is not found
   */
  async getMedicine(id) {
    const medicine = await Medicine.findById(id);
    if (!medicine) {
      throw new ErrorResponse(`Medicine not found with id of ${id}`, 404);
    }
    return medicine;
  }

  /**
   * @desc Add a new medicine
   * @param {Object} medicineData - Data for the new medicine
   * @param {string} userId - ID of the user (admin/lab_staff) adding the medicine
   * @returns {Promise<Object>} The newly created medicine object
   */
  async addMedicine(medicineData, userId) {
    medicineData.user = userId; // Attach the user who is adding the medicine
    const medicine = await Medicine.create(medicineData);
    return medicine;
  }

  /**
   * @desc Update an existing medicine
   * @param {string} id - The ID of the medicine to update
   * @param {Object} updateData - Data to update the medicine with
   * @param {Object} authUser - Authenticated user object (for authorization)
   * @returns {Promise<Object>} The updated medicine object
   * @throws {ErrorResponse} If medicine is not found or user is not authorized
   */
  async updateMedicine(id, updateData, authUser) {
    let medicine = await Medicine.findById(id);

    if (!medicine) {
      throw new ErrorResponse(`Medicine not found with id of ${id}`, 404);
    }

    // Authorization: Ensure user is the owner of the medicine or an admin
    if (medicine.user.toString() !== authUser.id && authUser.role !== 'admin') {
      throw new ErrorResponse(
        `User ${authUser.id} is not authorized to update this medicine`,
        401
      );
    }

    medicine = await Medicine.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    return medicine;
  }

  /**
   * @desc Delete a medicine
   * @param {string} id - The ID of the medicine to delete
   * @param {Object} authUser - Authenticated user object (for authorization)
   * @returns {Promise<void>}
   * @throws {ErrorResponse} If medicine is not found or user is not authorized
   */
  async deleteMedicine(id, authUser) {
    const medicine = await Medicine.findById(id);

    if (!medicine) {
      throw new ErrorResponse(`Medicine not found with id of ${id}`, 404);
    }

    // Authorization: Ensure user is the owner of the medicine or an admin
    if (medicine.user.toString() !== authUser.id && authUser.role !== 'admin') {
      throw new ErrorResponse(
        `User ${authUser.id} is not authorized to delete this medicine`,
        401
      );
    }

    await medicine.deleteOne();
  }
}

module.exports = new MedicineService(); // Export an instance of the service
