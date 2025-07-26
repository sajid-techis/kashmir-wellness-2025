// src/controllers/medicineController.js
// This file contains controller functions for managing medicines.
// It now uses the MedicineService to abstract business logic and handles multiple image uploads to Cloudinary.

const medicineService = require('../services/medicineService'); // Import the MedicineService
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility
const cloudinary = require('cloudinary').v2; // Import Cloudinary v2

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromCloudinaryUrl = (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return null;
  const parts = url.split('/');
  // The public ID is typically the last part before the extension, sometimes includes folder paths
  // Example: 'kashmir-wellness/medicines/abcdefg12345'
  const publicIdWithExtension = parts[parts.length - 1];
  const publicId = publicIdWithExtension.split('.')[0];
  // Reconstruct full public ID including folder path
  // Assumes folder structure like kashmir-wellness/medicines/public_id
  const folderPath = parts.slice(parts.indexOf('upload') + 2, parts.length - 1).join('/');
  return folderPath ? `${folderPath}/${publicId}` : publicId;
};


// @desc    Get all medicines
// @route   GET /api/v1/medicines
// @access  Public
exports.getMedicines = async (req, res, next) => {
  try {
    // Delegate to MedicineService, passing query parameters
    const { count, data } = await medicineService.getMedicines(req.query);

    res.status(200).json({
      success: true,
      count: count,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single medicine
// @route   GET /api/v1/medicines/:id
// @access  Public
exports.getMedicine = async (req, res, next) => {
  try {
    // Delegate to MedicineService
    const medicine = await medicineService.getMedicine(req.params.id);

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add new medicine
// @route   POST /api/v1/medicines
// @access  Private (Admin/Lab Staff only)
exports.addMedicine = async (req, res, next) => {
  try {
    const medicineData = { ...req.body };
    const imageUrls = [];

    // If files were uploaded, handle Cloudinary upload for each
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (!file.buffer || file.buffer.length === 0) {
          return next(new ErrorResponse('Uploaded file buffer is empty or invalid.', 400));
        }

        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'kashmir-wellness/medicines', resource_type: 'image' }, // Specify folder for medicines
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload_stream callback error:', error);
                reject(new ErrorResponse('Image upload to Cloudinary failed', 500));
              }
              resolve(result);
            }
          ).end(file.buffer); // Pass the image buffer
        });
        imageUrls.push(result.secure_url);
      }
      medicineData.imageUrl = imageUrls; // Assign the array of URLs
    } else {
      // If no files are uploaded, ensure imageUrl is an empty array or default
      medicineData.imageUrl = []; // Or set to default if your schema handles it
    }


    // Delegate to MedicineService, passing medicine data and user ID
    const medicine = await medicineService.addMedicine(medicineData, req.user.id);

    res.status(201).json({
      success: true,
      data: medicine,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update medicine
// @route   PUT /api/v1/medicines/:id
// @access  Private (Admin/Lab Staff only)
exports.updateMedicine = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    const newImageUrls = [];

    // Get the current medicine to compare old images
    const currentMedicine = await medicineService.getMedicine(req.params.id);

    // If new files were uploaded, handle Cloudinary upload for each
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (!file.buffer || file.buffer.length === 0) {
          return next(new ErrorResponse('Uploaded file buffer is empty or invalid.', 400));
        }

        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'kashmir-wellness/medicines', resource_type: 'image' },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload_stream callback error:', error);
                reject(new ErrorResponse('Image upload to Cloudinary failed', 500));
              }
              resolve(result);
            }
          ).end(file.buffer);
        });
        newImageUrls.push(result.secure_url);
      }
      updateData.imageUrl = newImageUrls; // Overwrite with new images
    } else if (req.body.clearImages === 'true') {
      // If clearImages flag is sent and no new files, set imageUrl to empty array
      updateData.imageUrl = [];
    } else if (req.body.keepExistingImages === 'true' && currentMedicine.imageUrl) {
      // If keepExistingImages flag is sent and no new files, retain existing images
      updateData.imageUrl = currentMedicine.imageUrl;
    } else {
      // If no new files and no explicit instruction to clear/keep, remove imageUrl from updateData
      // This prevents accidentally overwriting existing images with an empty array if no files are sent
      delete updateData.imageUrl;
    }


    // Optional: Delete old images from Cloudinary if they were replaced or cleared
    if (updateData.imageUrl && currentMedicine.imageUrl && currentMedicine.imageUrl.length > 0) {
      const oldImageUrlsToDelete = currentMedicine.imageUrl.filter(oldUrl =>
        !updateData.imageUrl.includes(oldUrl) // Delete if old URL is not in the new list
      );

      for (const oldUrl of oldImageUrlsToDelete) {
        const publicId = getPublicIdFromCloudinaryUrl(oldUrl);
        if (publicId) {
          console.log(`Attempting to delete old Cloudinary medicine image with public_id: ${publicId}`);
          await cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) console.error('Error deleting old medicine image from Cloudinary:', error);
            else console.log('Old medicine image deleted from Cloudinary:', result);
          });
        }
      }
    }


    // Delegate to MedicineService, passing ID, update data, and authenticated user
    const medicine = await medicineService.updateMedicine(req.params.id, updateData, req.user);

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete medicine
// @route   DELETE /api/v1/medicines/:id
// @access  Private (Admin/Lab Staff only)
exports.deleteMedicine = async (req, res, next) => {
  try {
    // Get the medicine to delete its images from Cloudinary
    const medicineToDelete = await medicineService.getMedicine(req.params.id);

    // Delegate to MedicineService, passing ID and authenticated user
    await medicineService.deleteMedicine(req.params.id, req.user);

    // Optional: Delete images from Cloudinary after successful medicine deletion
    if (medicineToDelete.imageUrl && medicineToDelete.imageUrl.length > 0) {
      for (const imageUrl of medicineToDelete.imageUrl) {
        if (imageUrl.includes('res.cloudinary.com')) {
          const publicId = getPublicIdFromCloudinaryUrl(imageUrl);
          if (publicId) {
            console.log(`Attempting to delete Cloudinary medicine image on delete: ${publicId}`);
            await cloudinary.uploader.destroy(publicId, (error, result) => {
              if (error) console.error('Error deleting medicine image from Cloudinary on delete:', error);
              else console.log('Medicine image deleted from Cloudinary on delete:', result);
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {}, // Conventionally, return empty data for successful deletion
    });
  } catch (err) {
    next(err);
  }
};
