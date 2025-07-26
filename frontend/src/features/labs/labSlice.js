// src/features/labs/labSlice.js
// This Redux Toolkit slice manages the state related to labs,
// including fetching labs and a single lab's details.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/api/axiosInstance'; // Import the configured axios instance

// Define the initial state for the lab slice
const initialState = {
  labs: [], // Array to store fetched labs
  lab: null, // Stores a single lab (e.g., for detail view)
  count: 0, // Total count of labs (for pagination)
  isLoading: false, // General loading state for lab operations
  error: null, // Stores any errors
};

// Async Thunk for Fetching All Labs
export const fetchLabs = createAsyncThunk(
  'labs/fetchLabs',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 25, sort = '-createdAt', ...filters } = queryParams;
      const queryString = new URLSearchParams({ page, limit, sort, ...filters }).toString();
      const response = await axiosInstance.get(`/labs?${queryString}`);
      return response.data; // Should contain { success, count, data: labs[] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Async Thunk for Fetching a Single Lab
export const fetchLabById = createAsyncThunk(
  'labs/fetchLabById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/labs/${id}`);
      return response.data; // Should contain { success, data: lab }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Create the lab slice
const labSlice = createSlice({
  name: 'labs',
  initialState,
  reducers: {
    // Synchronous reducers go here
    clearLabErrors: (state) => {
      state.error = null;
    },
    clearSingleLab: (state) => {
      state.lab = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Labs
      .addCase(fetchLabs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLabs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.labs = action.payload.data;
        state.count = action.payload.count;
      })
      .addCase(fetchLabs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.labs = [];
        state.count = 0;
      })
      // Fetch Lab By Id
      .addCase(fetchLabById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.lab = null;
      })
      .addCase(fetchLabById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lab = action.payload.data;
      })
      .addCase(fetchLabById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.lab = null;
      });
  },
});

// Export synchronous actions
export const { clearLabErrors, clearSingleLab } = labSlice.actions;

// Export the reducer
export default labSlice.reducer;
