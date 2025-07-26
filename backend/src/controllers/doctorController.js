// src/controllers/doctorController.js
// This file contains controller functions for managing doctor profiles.
// It now uses the DoctorService to abstract business logic and handles image uploads to Cloudinary.
// FIXED: Corrected method call from addDoctor to createDoctor in the service.

const doctorService = require('../services/doctorService'); // Import the DoctorService
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility
const cloudinary = require('cloudinary').v2; // Import Cloudinary v2

// @desc    Get all doctors
// @route   GET /api/v1/doctors
// @access  Public
exports.getDoctors = async (req, res, next) => {
  try {
    // Delegate to DoctorService, passing query parameters
    const { count, data } = await doctorService.getDoctors(req.query);

    res.status(200).json({
      success: true,
      count: count,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single doctor
// @route   GET /api/v1/doctors/:id
// @access  Public
exports.getDoctor = async (req, res, next) => {
  try {
    // Delegate to DoctorService
    const doctor = await doctorService.getDoctor(req.params.id);

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add new doctor
// @route   POST /api/v1/doctors
// @access  Private (Admin only)
exports.addDoctor = async (req, res, next) => {
  try {
    const doctorData = { ...req.body };

    // If a file was uploaded, handle Cloudinary upload
    if (req.file) {
      if (!req.file.buffer || req.file.buffer.length === 0) {
        return next(new ErrorResponse('Uploaded file buffer is empty or invalid.', 400));
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'kashmir-wellness/doctors', resource_type: 'image' }, // Specify folder for doctors
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload_stream callback error:', error);
              reject(new ErrorResponse('Image upload to Cloudinary failed', 500));
            }
            resolve(result);
          }
        ).end(req.file.buffer);
      });
      doctorData.imageUrl = result.secure_url;
    }

    // Delegate to DoctorService, passing doctor data and user ID
    // CORRECTED: Calling createDoctor instead of addDoctor
    const doctor = await doctorService.createDoctor(doctorData, req.user.id);

    res.status(201).json({
      success: true,
      data: doctor,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update doctor
// @route   PUT /api/v1/doctors/:id
// @access  Private (Admin or the specific Doctor user)
exports.updateDoctor = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // If a new file was uploaded, handle Cloudinary upload and old image deletion
    if (req.file) {
      if (!req.file.buffer || req.file.buffer.length === 0) {
        return next(new ErrorResponse('Uploaded file buffer is empty or invalid.', 400));
      }

      const currentDoctor = await doctorService.getDoctor(req.params.id);

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'kashmir-wellness/doctors', resource_type: 'image' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload_stream callback error:', error);
              reject(new ErrorResponse('Image upload to Cloudinary failed', 500));
            }
            resolve(result);
          }
        ).end(req.file.buffer);
      });
      updateData.imageUrl = result.secure_url;

      // Optional: Delete old image from Cloudinary if it was a Cloudinary URL
      if (currentDoctor.imageUrl && currentDoctor.imageUrl.includes('res.cloudinary.com')) {
        const publicId = currentDoctor.imageUrl.split('/').pop().split('.')[0];
        const folderPath = currentDoctor.imageUrl.split('/').slice(-3, -1).join('/');
        const fullPublicId = folderPath ? `${folderPath}/${publicId}` : publicId;

        console.log(`Attempting to delete old Cloudinary doctor image with public_id: ${fullPublicId}`);
        await cloudinary.uploader.destroy(fullPublicId, (error, result) => {
          if (error) console.error('Error deleting old doctor image from Cloudinary:', error);
          else console.log('Old doctor image deleted from Cloudinary:', result);
        });
      }
    }

    // Delegate to DoctorService, passing ID, update data, and authenticated user
    const doctor = await doctorService.updateDoctor(req.params.id, updateData, req.user);

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete doctor
// @route   DELETE /api/v1/doctors/:id
// @access  Private (Admin only)
exports.deleteDoctor = async (req, res, next) => {
  try {
    // Get the doctor to delete its image from Cloudinary
    const doctorToDelete = await doctorService.getDoctor(req.params.id);

    // Delegate to DoctorService, passing ID and authenticated user
    await doctorService.deleteDoctor(req.params.id, req.user);

    // Optional: Delete image from Cloudinary after successful doctor deletion
    if (doctorToDelete.imageUrl && doctorToDelete.imageUrl.includes('res.cloudinary.com')) {
      const publicId = doctorToDelete.imageUrl.split('/').pop().split('.')[0];
      const folderPath = doctorToDelete.imageUrl.split('/').slice(-3, -1).join('/');
      const fullPublicId = folderPath ? `${folderPath}/${publicId}` : publicId;

      console.log(`Attempting to delete Cloudinary doctor image on delete: ${fullPublicId}`);
      await cloudinary.uploader.destroy(fullPublicId, (error, result) => {
        if (error) console.error('Error deleting doctor image from Cloudinary on delete:', error);
        else console.log('Doctor image deleted from Cloudinary on delete:', result);
      });
    }

    res.status(200).json({
      success: true,
      data: {}, // Conventionally, return empty data for successful deletion
    });
  } catch (err) {
    next(err);
  }
};
