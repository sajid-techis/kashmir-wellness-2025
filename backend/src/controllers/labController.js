// src/controllers/labController.js
// This file contains controller functions for managing lab profiles.
// It now uses the LabService to abstract business logic.

const labService = require('../services/labService'); // Import the LabService
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility
// APIFeatures is now used within the service, so it's not directly needed here
// const APIFeatures = require('../utils/apiFeatures');

// @desc    Get all labs
// @route   GET /api/v1/labs
// @access  Public
exports.getLabs = async (req, res, next) => {
  try {
    // Delegate to LabService, passing query parameters
    const { count, data } = await labService.getLabs(req.query);

    res.status(200).json({
      success: true,
      count: count,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single lab
// @route   GET /api/v1/labs/:id
// @access  Public
exports.getLab = async (req, res, next) => {
  try {
    // Delegate to LabService
    const lab = await labService.getLab(req.params.id);

    res.status(200).json({
      success: true,
      data: lab,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add new lab
// @route   POST /api/v1/labs
// @access  Private (Admin only)
exports.addLab = async (req, res, next) => {
  try {
    // Delegate to LabService, passing request body and user ID
    const lab = await labService.addLab(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: lab,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update lab
// @route   PUT /api/v1/labs/:id
// @access  Private (Admin or the specific Lab Staff user if linked)
exports.updateLab = async (req, res, next) => {
  try {
    // Delegate to LabService, passing ID, update data, and authenticated user
    const lab = await labService.updateLab(req.params.id, req.body, req.user);

    res.status(200).json({
      success: true,
      data: lab,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete lab
// @route   DELETE /api/v1/labs/:id
// @access  Private (Admin only)
exports.deleteLab = async (req, res, next) => {
  try {
    // Delegate to LabService, passing ID and authenticated user
    await labService.deleteLab(req.params.id, req.user);

    res.status(200).json({
      success: true,
      data: {}, // Conventionally, return empty data for successful deletion
    });
  } catch (err) {
    next(err);
  }
};
