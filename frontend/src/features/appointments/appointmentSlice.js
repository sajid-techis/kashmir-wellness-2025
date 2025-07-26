// src/features/appointments/appointmentSlice.js
// This Redux Toolkit slice manages the state related to user appointments,
// including creating, fetching, updating, and deleting appointments.
// DEBUGGING: Added console.log statements to inspect action.payload in createAppointment thunk.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/api/axiosInstance'; // Import the configured axios instance

// Define the initial state for the appointment slice
const initialState = {
  appointments: [], // Array to store fetched appointments
  singleAppointment: null, // Stores a single appointment (e.g., for detail view)
  count: 0, // Total count of appointments (for pagination)
  isLoading: false, // General loading state for appointment operations
  error: null, // Stores any errors
  success: false, // Flag for successful appointment creation/update/deletion
};

// Async Thunk for Creating a New Appointment
export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/appointments', appointmentData);
      return response.data; // Should contain { success, data: appointment }
    } catch (error) {
      // --- DEBUGGING LOGS START ---
      console.error('API call for createAppointment failed:', error.response?.data || error.message);
      // --- DEBUGGING LOGS END ---
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Async Thunk for Fetching All Appointments (for the authenticated user/doctor/admin)
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await axiosInstance.get(`/appointments?${queryString}`);
      return response.data; // Should contain { success, count, data: appointments[] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Async Thunk for Fetching a Single Appointment by ID
export const fetchAppointmentById = createAsyncThunk(
  'appointments/fetchAppointmentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/appointments/${id}`);
      return response.data; // Should contain { success, data: appointment }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Async Thunk for Updating an Appointment
export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/appointments/${id}`, updateData);
      return response.data; // Should contain { success, data: updatedAppointment }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Async Thunk for Deleting an Appointment
export const deleteAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/appointments/${id}`);
      return id; // Return the ID of the deleted appointment for state update
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Create the appointment slice
const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    // Synchronous reducers to clear state
    clearAppointmentError: (state) => { // Corrected action name
      state.error = null;
    },
    clearAppointmentSuccess: (state) => { // New action to clear success flag
      state.success = false;
    },
    clearSingleAppointment: (state) => {
      state.singleAppointment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Appointment
      .addCase(createAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        // --- DEBUGGING LOGS START ---
        console.log('createAppointment.fulfilled payload:', action.payload);
        // --- DEBUGGING LOGS END ---
        state.isLoading = false;
        state.success = true;
        state.singleAppointment = action.payload.data;
        // Optionally add to appointments array if needed, but typically a redirect happens
      })
      .addCase(createAppointment.rejected, (state, action) => {
        // --- DEBUGGING LOGS START ---
        console.log('createAppointment.rejected payload:', action.payload);
        // --- DEBUGGING LOGS END ---
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Fetch Appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload.data;
        state.count = action.payload.count;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.appointments = [];
        state.count = 0;
      })
      // Fetch Appointment By Id
      .addCase(fetchAppointmentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.singleAppointment = null;
      })
      .addCase(fetchAppointmentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.singleAppointment = action.payload.data;
      })
      .addCase(fetchAppointmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.singleAppointment = null;
      })
      // Update Appointment
      .addCase(updateAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.singleAppointment = action.payload.data;
        // Update the item in the main appointments array if it exists
        const index = state.appointments.findIndex(app => app._id === action.payload.data._id);
        if (index !== -1) {
          state.appointments[index] = action.payload.data;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Delete Appointment
      .addCase(deleteAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        // Remove the deleted appointment from the array
        state.appointments = state.appointments.filter(app => app._id !== action.payload);
        state.count -= 1;
        state.singleAppointment = null; // Clear single appointment if it was the one deleted
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

// Export synchronous actions
export const { clearAppointmentError, clearAppointmentSuccess, clearSingleAppointment } = appointmentSlice.actions;

// Export the reducer
export default appointmentSlice.reducer;
