// src/config/db.js
// This file handles the connection to the MongoDB database using Mongoose.

const mongoose = require('mongoose');

// Function to connect to the database
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the URI from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,         // Deprecated and can be removed
      // useUnifiedTopology: true,      // Deprecated and can be removed
    });

    // Log successful connection
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log connection error and exit the process
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit with a failure code
  }
};

module.exports = connectDB;