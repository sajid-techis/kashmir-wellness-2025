// src/features/medicines/medicineSlice.js
// This Redux Toolkit slice manages the state related to medicines,
// including fetching, adding, updating, and deleting medicines,
// with specific handling for multiple image uploads.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/api/axiosInstance'; // Import the configured axios instance

// Define the initial state for the medicine slice
const initialState = {
  medicines: [], // Array to store fetched medicines
  medicine: null, // Stores a single medicine (e.g., for detail view)
  count: 0, // Total count of medicines (for pagination)
  isLoading: false, // General loading state for medicine operations
  error: null, // Stores any errors
  addMedicineLoading: false, // Loading state for adding medicine
  addMedicineError: null,
  updateMedicineLoading: false, // Loading state for updating medicine
  updateMedicineError: null,
  deleteMedicineLoading: false, // Loading state for deleting medicine
  deleteMedicineError: null,
};

// Async Thunk for Fetching All Medicines
export const fetchMedicines = createAsyncThunk(
  'medicines/fetchMedicines',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 25, sort = '-createdAt', ...filters } = queryParams;
      const queryString = new URLSearchParams({ page, limit, sort, ...filters }).toString();
      const response = await axiosInstance.get(`/medicines?${queryString}`);
      return response.data; // Should contain { success, count, data: medicines[] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Async Thunk for Fetching a Single Medicine
export const fetchMedicineById = createAsyncThunk(
  'medicines/fetchMedicineById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/medicines/${id}`);
      return response.data; // Should contain { success, data: medicine }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Async Thunk for Adding a New Medicine (with multiple image support)
export const addMedicine = createAsyncThunk(
  'medicines/addMedicine',
  async (medicineData, { rejectWithValue }) => {
    try {
      // medicineData should be a FormData object for file uploads
      const response = await axiosInstance.post('/medicines', medicineData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });
      return response.data; // Should contain { success, data: newMedicine }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Async Thunk for Updating an Existing Medicine (with multiple image support)
export const updateMedicine = createAsyncThunk(
  'medicines/updateMedicine',
  async ({ id, medicineData }, { rejectWithValue }) => {
    try {
      // medicineData should be a FormData object for file uploads
      const response = await axiosInstance.put(`/medicines/${id}`, medicineData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
      });
      return response.data; // Should contain { success, data: updatedMedicine }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Async Thunk for Deleting a Medicine
export const deleteMedicine = createAsyncThunk(
  'medicines/deleteMedicine',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/medicines/${id}`);
      return id; // Return the ID of the deleted medicine for state update
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Create the medicine slice
const medicineSlice = createSlice({
  name: 'medicines',
  initialState,
  reducers: {
    // Synchronous reducers go here
    clearMedicineErrors: (state) => {
      state.error = null;
      state.addMedicineError = null;
      state.updateMedicineError = null;
      state.deleteMedicineError = null;
    },
    clearSingleMedicine: (state) => {
      state.medicine = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Medicines
      .addCase(fetchMedicines.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMedicines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medicines = action.payload.data;
        state.count = action.payload.count;
      })
      .addCase(fetchMedicines.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.medicines = [];
        state.count = 0;
      })
      // Fetch Medicine By Id
      .addCase(fetchMedicineById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.medicine = null;
      })
      .addCase(fetchMedicineById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medicine = action.payload.data;
      })
      .addCase(fetchMedicineById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.medicine = null;
      })
      // Add Medicine
      .addCase(addMedicine.pending, (state) => {
        state.addMedicineLoading = true;
        state.addMedicineError = null;
      })
      .addCase(addMedicine.fulfilled, (state, action) => {
        state.addMedicineLoading = false;
        state.medicines.push(action.payload.data); // Add new medicine to the list
        state.count += 1;
      })
      .addCase(addMedicine.rejected, (state, action) => {
        state.addMedicineLoading = false;
        state.addMedicineError = action.payload;
      })
      // Update Medicine
      .addCase(updateMedicine.pending, (state) => {
        state.updateMedicineLoading = true;
        state.updateMedicineError = null;
      })
      .addCase(updateMedicine.fulfilled, (state, action) => {
        state.updateMedicineLoading = false;
        // Update the medicine in the list
        const index = state.medicines.findIndex(med => med._id === action.payload.data._id);
        if (index !== -1) {
          state.medicines[index] = action.payload.data;
        }
        // Also update the single medicine if it's the one being viewed
        if (state.medicine && state.medicine._id === action.payload.data._id) {
          state.medicine = action.payload.data;
        }
      })
      .addCase(updateMedicine.rejected, (state, action) => {
        state.updateMedicineLoading = false;
        state.updateMedicineError = action.payload;
      })
      // Delete Medicine
      .addCase(deleteMedicine.pending, (state) => {
        state.deleteMedicineLoading = true;
        state.deleteMedicineError = null;
      })
      .addCase(deleteMedicine.fulfilled, (state, action) => {
        state.deleteMedicineLoading = false;
        // Remove the deleted medicine from the list
        state.medicines = state.medicines.filter(med => med._id !== action.payload);
        state.count -= 1;
      })
      .addCase(deleteMedicine.rejected, (state, action) => {
        state.deleteMedicineLoading = false;
        state.deleteMedicineError = action.payload;
      });
  },
});

// Export synchronous actions
export const { clearMedicineErrors, clearSingleMedicine } = medicineSlice.actions;

// Export the reducer
export default medicineSlice.reducer;
