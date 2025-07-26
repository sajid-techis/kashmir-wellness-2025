// src/middlewares/uploadMiddleware.js
// This file defines a middleware for handling file uploads using Multer.
// It now configures memory storage and file filtering, and EXPORTS THE MULTER INSTANCE.
// The actual .single() or .array() method will be called in the route files.

const multer = require('multer');
const path = require('path'); // Node.js built-in module for path manipulation
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility

// Set storage engine to memoryStorage
// This means the file will be held in memory as a Buffer,
// which is suitable for direct upload to services like Cloudinary.
const storage = multer.memoryStorage();

// Check file type
function checkFileType(file, cb) {
  // Allowed MIME types (exact match)
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  // Allowed extensions (exact match, lowercased)
  const allowedExts = ['.jpeg', '.jpg', '.png', '.gif'];

  // Get the file's extension and MIME type
  const fileExt = path.extname(file.originalname).toLowerCase();
  const fileMimeType = file.mimetype;

  // Check if extension is allowed
  const extnameAllowed = allowedExts.includes(fileExt);
  // Check if MIME type is allowed
  const mimetypeAllowed = allowedMimeTypes.includes(fileMimeType);

  // --- DEBUGGING LOGS ---
  console.log('--- File Type Check Debug ---');
  console.log('Original filename:', file.originalname);
  console.log('Detected MIME type:', fileMimeType);
  console.log('Detected extension:', fileExt);
  console.log('Extname allowed:', extnameAllowed);
  console.log('Mimetype allowed:', mimetypeAllowed);
  console.log('Final condition (mimetypeAllowed && extnameAllowed):', mimetypeAllowed && extnameAllowed);
  console.log('--- End Debug ---');
  // --- END DEBUGGING LOGS ---

  if (mimetypeAllowed && extnameAllowed) {
    return cb(null, true); // File type is allowed
  } else {
    // --- NEW DEBUGGING LOG ---
    console.log('--- ERROR PATH TAKEN: checkFileType rejected file ---');
    // --- END NEW DEBUGGING LOG ---
    // Pass an error if file type is not allowed
    cb(new ErrorResponse('Only images (JPEG, JPG, PNG, GIF) are allowed!', 400));
  }
}

// Initialize Multer instance
// This 'upload' variable will now be the Multer instance itself,
// allowing you to call .single(), .array(), etc., on it in your route files.
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 * 5 }, // Max file size 5MB per file
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload; // Export the configured multer instance
