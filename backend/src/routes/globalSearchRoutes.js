// src/routes/globalSearchRoutes.js
// This file defines the API routes for global search.

const express = require('express');
const { globalSearch } = require('../controllers/globalSearchController');

const router = express.Router();

// Define the global search route
// GET /api/v1/search/global?q=keyword
router.route('/global').get(globalSearch);

module.exports = router;
