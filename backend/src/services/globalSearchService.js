// src/services/globalSearchService.js
// This file contains business logic for performing a global search
// across multiple models (Medicines, Doctors, Labs).
// ENHANCEMENT: Added extensive console.log for debugging search queries and results.

const Medicine = require('../models/Medicine');
const Doctor = require('../models/Doctor');
const Lab = require('../models/Lab');
const ErrorResponse = require('../utils/errorHandler');

class GlobalSearchService {
  /**
   * @desc Performs a global search across Medicine, Doctor, and Lab models.
   * @param {string} keyword - The search term.
   * @returns {Promise<Object>} An object containing categorized search results.
   */
  async globalSearch(keyword) {
    console.log('Backend: GlobalSearchService - Received keyword:', keyword);

    if (!keyword || keyword.trim() === '') {
      console.log('Backend: GlobalSearchService - Keyword is empty or whitespace. Returning empty results.');
      return { medicines: [], doctors: [], labs: [] }; // Return empty results for empty keyword
    }

    const searchRegex = new RegExp(keyword, 'i'); // Case-insensitive regex for searching
    console.log('Backend: GlobalSearchService - Generated search regex:', searchRegex);

    // Define search queries for each model
    // Using .lean() for faster query execution as we don't need Mongoose documents
    const medicineSearchQuery = Medicine.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { manufacturer: searchRegex },
        { category: searchRegex },
      ],
    }).limit(10).lean(); // Limit results to avoid overwhelming response

    const doctorSearchQuery = Doctor.find({
      $or: [
        { name: searchRegex },
        { specialization: searchRegex },
        { clinicAddress: searchRegex },
        { email: searchRegex },
      ],
    }).limit(10).lean();

    const labSearchQuery = Lab.find({
      $or: [
        { name: searchRegex },
        { address: searchRegex },
        { email: searchRegex },
        { services: searchRegex }, // Search within array of services
      ],
    }).limit(10).lean();

    try {
      // Execute all search queries in parallel
      const [medicines, doctors, labs] = await Promise.all([
        medicineSearchQuery,
        doctorSearchQuery,
        labSearchQuery,
      ]);

      console.log('Backend: GlobalSearchService - Medicines found:', medicines.length);
      console.log('Backend: GlobalSearchService - Doctors found:', doctors.length);
      console.log('Backend: GlobalSearchService - Labs found:', labs.length);
      console.log('Backend: GlobalSearchService - Returning results:', { medicines, doctors, labs });

      return { medicines, doctors, labs };
    } catch (error) {
      console.error('Backend: GlobalSearchService - Error during global search:', error);
      throw new ErrorResponse('Failed to perform global search', 500);
    }
  }
}

module.exports = new GlobalSearchService(); // Export an instance of the service
