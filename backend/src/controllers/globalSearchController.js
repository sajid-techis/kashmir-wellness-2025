// src/controllers/globalSearchController.js
// This file contains the controller function for handling global search requests.

const globalSearchService = require('../services/globalSearchService');
const ErrorResponse = require('../utils/errorHandler');

// @desc    Perform a global search across multiple models
// @route   GET /api/v1/search/global
// @access  Public
exports.globalSearch = async (req, res, next) => {
  try {
    const { q: keyword } = req.query; // Get the search keyword from query parameter 'q'

    // Delegate to GlobalSearchService to perform the search
    const results = await globalSearchService.globalSearch(keyword);

    res.status(200).json({
      success: true,
      data: results, // Contains { medicines: [], doctors: [], labs: [] }
    });
  } catch (err) {
    next(err); // Pass error to the error handling middleware
  }
};
