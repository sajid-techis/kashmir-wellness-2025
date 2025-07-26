// src/utils/apiFeatures.js
// This file defines a reusable class for handling common API query features
// such as filtering, sorting, field selection, pagination, and search.
// REFACTOR: Search and filter conditions are now accumulated separately
// and then explicitly combined using $and in the applyFind method.
// ENHANCEMENT: Added extensive console.log for debugging query construction.

class APIFeatures {
  constructor(query, queryString) {
    this.query = query; // Mongoose query object (e.g., Medicine.find())
    this.queryString = queryString; // Query string from req.query (e.g., req.query)
    this.searchConditions = {}; // Stores conditions specifically from the search method
    this.filterConditions = {}; // Stores conditions specifically from the filter method

    // DEBUG: Log the initial query string
    console.log('APIFeatures: Initial queryString:', this.queryString);
  }

  // 0. Search
  // Example: /api/v1/medicines?keyword=paracetamol
  search(searchFields = ['name', 'description']) { // Default fields to search
    if (this.queryString.keyword) {
      this.searchConditions = {
        $or: searchFields.map(field => ({
          [field]: {
            $regex: this.queryString.keyword,
            $options: 'i' // Case-insensitive
          }
        }))
      };
      // DEBUG: Log search conditions
      console.log('APIFeatures: Generated searchConditions:', JSON.stringify(this.searchConditions));
    } else {
      console.log('APIFeatures: No keyword provided, searchConditions empty.');
    }
    return this;
  }

  // 1. Filtering
  // Example: /api/v1/medicines?price[gte]=10&category=Pain%20Relief
  filter() {
    const queryObj = { ...this.queryString };
    // Exclude pagination, sorting, field limiting, and keyword from direct filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Handle case where queryObj might be empty after exclusions
    try {
      this.filterConditions = JSON.parse(queryStr);
      // DEBUG: Log filter conditions
      console.log('APIFeatures: Generated filterConditions:', JSON.stringify(this.filterConditions));
    } catch (e) {
      console.error('APIFeatures: Error parsing filter query string:', queryStr, e);
      this.filterConditions = {}; // Default to empty object on error
    }
    
    return this; // Return 'this' to allow method chaining
  }

  // NEW: Apply all accumulated find conditions to the Mongoose query
  applyFind() {
    const finalQueryConditions = {};
    const conditionsArray = [];

    // Add search conditions if they exist
    if (Object.keys(this.searchConditions).length > 0) {
      conditionsArray.push(this.searchConditions);
    }

    // Add filter conditions if they exist
    if (Object.keys(this.filterConditions).length > 0) {
      conditionsArray.push(this.filterConditions);
    }

    // Combine all conditions using $and if there's more than one set of conditions
    if (conditionsArray.length > 1) {
      finalQueryConditions.$and = conditionsArray;
    } else if (conditionsArray.length === 1) {
      // If only one set of conditions, apply it directly without $and
      Object.assign(finalQueryConditions, conditionsArray[0]);
    }

    // DEBUG: Log the final query conditions being applied to Mongoose
    console.log('APIFeatures: Final query conditions applied to Mongoose.find():', JSON.stringify(finalQueryConditions));

    // Apply the final combined query to the Mongoose query object
    this.query = this.query.find(finalQueryConditions);
    return this;
  }

  // 2. Sorting
  // Example: /api/v1/medicines?sort=price,-name (sort by price ascending, then name descending)
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // Default sort by creation date (descending)
    }
    return this;
  }

  // 3. Field Limiting (Selecting specific fields)
  // Example: /api/v1/medicines?fields=name,price,category
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // Exclude the __v field by default
    }
    return this;
  }

  // 4. Pagination
  // Example: /api/v1/medicines?page=2&limit=10
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 25; // Default limit 25 items per page
    const skip = (page - 1) * limit; // Number of documents to skip

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
