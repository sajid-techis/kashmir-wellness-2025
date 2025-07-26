// server.js
require('dotenv').config({ path: './.env' });

// Import the Express application instance
const app = require('./src/app');

// Import the database connection function
const connectDB = require('./src/config/db');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`ERROR: ${err.message}`);
  console.error('Shutting down the server due to uncaught exception...');
  process.exit(1); 
});

// Connect to the database
connectDB();
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log('Cloudinary configured successfully.');
// Ensure the 'public/uploads' directory exists
// const uploadsDir = path.join(__dirname, 'public', 'uploads'); // Correct path relative to server.js
// fs.mkdir(uploadsDir, { recursive: true }, (err) => {
//   if (err) {
//     console.error(`Error creating uploads directory: ${err.message}`);
//     process.exit(1); // Exit if directory creation fails
//   }
//   console.log(`Ensured uploads directory exists at: ${uploadsDir}`);
// });

// Define the port the server will listen on
const PORT = process.env.PORT || 5000;


// Start the Express server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections (asynchronous errors)
process.on('unhandledRejection', (err) => {
  console.error(`ERROR: ${err.message}`);
  console.error('Shutting down the server due to unhandled promise rejection...');
  // Close server and exit process
  server.close(() => {
    process.exit(1); // Exit with a failure code
  });
});
