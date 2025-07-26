// src/app.js
// This file sets up the core Express application instance,
// including middleware, route registration, and centralized error handling.

const express = require('express');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const path = require('path'); // Node.js built-in module for path manipulation
const cors = require('cors'); // Import CORS middleware


const authRoutes = require('./routes/authRoutes'); // Import authentication routes
const userRoutes = require('./routes/userRoutes'); // Import user routes
const medicineRoutes = require('./routes/medicineRoutes'); // Import medicine routes
const doctorRoutes = require('./routes/doctorRoutes'); // Import doctor routes
const appointmentRoutes = require('./routes/appointmentRoutes'); // Import appointment routes
const labRoutes = require('./routes/labRoutes'); // Import lab routes
const orderRoutes = require('./routes/orderRoutes'); // Import order routes
const globalSearchRoutes = require('./routes/globalSearchRoutes'); // Import global search routes
const errorHandler = require('./middlewares/errorMiddleware'); // Import centralized error handler

// Create an Express application instance
const app = express();

 app.use(cors({
      origin: 'http://localhost:3000', // Allow requests from your frontend development server
      credentials: true, // Allow cookies to be sent with requests
    }));

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Serve static files from the 'public' directory
// This makes files in 'public' (like 'public/uploads') accessible directly via URL
app.use(express.static(path.join(__dirname, '../public')));

// Mount the authentication routes
// All routes defined in authRoutes will be prefixed with /api/v1/auth
app.use('/api/v1/auth', authRoutes);

// Mount the user routes
// All routes defined in userRoutes will be prefixed with /api/v1/users
app.use('/api/v1/users', userRoutes);

// Mount the medicine routes
// All routes defined in medicineRoutes will be prefixed with /api/v1/medicines
app.use('/api/v1/medicines', medicineRoutes);

// Mount the doctor routes
// All routes defined in doctorRoutes will be prefixed with /api/v1/doctors
app.use('/api/v1/doctors', doctorRoutes);

// Mount the appointment routes
// All routes defined in appointmentRoutes will be prefixed with /api/v1/appointments
app.use('/api/v1/appointments', appointmentRoutes);

// Mount the lab routes
// All routes defined in labRoutes will be prefixed with /api/v1/labs
app.use('/api/v1/labs', labRoutes);

// Mount the order routes
// All routes defined in orderRoutes will be prefixed with /api/v1/orders
app.use('/api/v1/orders', orderRoutes);

// Mount the global search routes
// All routes defined in globalSearchRoutes will be prefixed with /api/v1/search
app.use('/api/v1/search', globalSearchRoutes);

// A simple root route to confirm the server is running
app.get('/', (req, res) => {
  res.send('Kashmir Wellness Backend API is running!');
});

// Centralized error handling middleware
// This middleware should be placed AFTER all other routes and middleware
app.use(errorHandler);

// Export the app instance for use in server.js
module.exports = app;
