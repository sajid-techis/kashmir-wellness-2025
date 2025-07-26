// src/features/globalSearch/globalSearchSlice.js
// This Redux Toolkit slice manages the state for a global search functionality.
// It stores the search query and now handles fetching search results
// from the backend API across various categories (medicines, doctors, labs).

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/api/axiosInstance'; // Import axiosInstance for API calls

const initialState = {
  searchQuery: '', // The current global search input
  searchResults: { // Structure to hold results from different categories
    medicines: [],
    doctors: [],
    labs: [],
    // Add other categories as needed
  },
  isLoading: false, // Loading state for the global search operation
  error: null, // Any error during global search
};

// Async Thunk for performing global search
export const performGlobalSearch = createAsyncThunk(
  'globalSearch/performGlobalSearch',
  async (query, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/search/global?q=${encodeURIComponent(query)}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const globalSearchSlice = createSlice({
  name: 'globalSearch',
  initialState,
  reducers: {
    // Synchronous action to set the search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      // When the query changes, clear previous results immediately for better UX
      state.searchResults = { medicines: [], doctors: [], labs: [] };
      state.error = null;
      // Do NOT set isLoading here. isLoading should only be set to true when the async thunk is *actually* pending.
      // This prevents a flickering loading state if the query changes rapidly due to debounce.
    },
    clearGlobalSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = { medicines: [], doctors: [], labs: [] };
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performGlobalSearch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(performGlobalSearch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload; // Store the combined results from the backend
      })
      .addCase(performGlobalSearch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.searchResults = { medicines: [], doctors: [], labs: [] }; // Clear results on error
      });
  },
});

export const { setSearchQuery, clearGlobalSearch } = globalSearchSlice.actions;
export default globalSearchSlice.reducer;
