// src/features/doctors/doctorSlice.js
// This Redux Toolkit slice manages the state related to doctors,
// including fetching doctors and a single doctor's details.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/api/axiosInstance'; // Import the configured axios instance

// Define the initial state for the doctor slice
const initialState = {
  doctors: [], // Array to store fetched doctors
  doctor: null, // Stores a single doctor (e.g., for detail view)
  count: 0, // Total count of doctors (for pagination)
  isLoading: false, // General loading state for doctor operations
  error: null, // Stores any errors
};

// Async Thunk for Fetching All Doctors
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 25, sort = '-createdAt', ...filters } = queryParams;
      const queryString = new URLSearchParams({ page, limit, sort, ...filters }).toString();
      const response = await axiosInstance.get(`/doctors?${queryString}`);
      return response.data; // Should contain { success, count, data: doctors[] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Async Thunk for Fetching a Single Doctor
export const fetchDoctorById = createAsyncThunk(
  'doctors/fetchDoctorById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/doctors/${id}`);
      return response.data; // Should contain { success, data: doctor }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Create the doctor slice
const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    // Synchronous reducers go here
    clearDoctorErrors: (state) => {
      state.error = null;
    },
    clearSingleDoctor: (state) => {
      state.doctor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.doctors = action.payload.data;
        state.count = action.payload.count;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.doctors = [];
        state.count = 0;
      })
      // Fetch Doctor By Id
      .addCase(fetchDoctorById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.doctor = null;
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.doctor = action.payload.data;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.doctor = null;
      });
  },
});

// Export synchronous actions
export const { clearDoctorErrors, clearSingleDoctor } = doctorSlice.actions;

// Export the reducer
export default doctorSlice.reducer;
