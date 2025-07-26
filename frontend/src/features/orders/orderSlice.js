// src/features/orders/orderSlice.js
// This Redux Toolkit slice manages the state related to user orders,
// including creating new orders, fetching orders, and a single order's details.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/api/axiosInstance'; // Import the configured axios instance

// Define the initial state for the order slice
const initialState = {
  orders: [], // Array to store fetched orders
  singleOrder: null, // Stores a single order (e.g., for detail view) - RENAMED from 'order'
  count: 0, // Total count of orders (for pagination)
  isLoading: false, // General loading state for order operations
  error: null, // Stores any errors
  success: false, // NEW: Flag for successful order creation/update
};

// Async Thunk for creating a new order
export const createOrder = createAsyncThunk(
  'orders/createOrder', // Action type prefix
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/orders', orderData); // POST request to /api/v1/orders
      return response.data; // The backend should return the created order object
    } catch (error) {
      // Use the error response from the backend or a generic message
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Async Thunk for Fetching All Orders (for the authenticated user)
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 25, sort = '-createdAt', ...filters } = queryParams;
      const queryString = new URLSearchParams({ page, limit, sort, ...filters }).toString();
      const response = await axiosInstance.get(`/orders?${queryString}`);
      return response.data; // Should contain { success, count, data: orders[] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Async Thunk for Fetching a Single Order by ID
export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/orders/${id}`);
      return response.data; // Should contain { success, data: order }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

// Create the order slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Synchronous reducers go here
    clearOrderError: (state) => { // RENAMED from clearOrderErrors
      state.error = null;
    },
    clearOrderSuccess: (state) => { // NEW: Reducer to clear success flag
      state.success = false;
    },
    clearSingleOrder: (state) => {
      state.singleOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createOrder thunk
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false; // Reset success on pending
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true; // Set success on fulfillment
        state.singleOrder = action.payload.data; // Store the newly created order
        // Optionally add to orders array if needed, but typically a redirect happens
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false; // Reset success on rejection
      })
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.count = action.payload.count;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.orders = [];
        state.count = 0;
      })
      // Fetch Order By Id
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.singleOrder = null; // Use singleOrder
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.singleOrder = action.payload.data; // Use singleOrder
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.singleOrder = null; // Use singleOrder
      });
  },
});

// Export synchronous actions
export const { clearOrderError, clearOrderSuccess, clearSingleOrder } = orderSlice.actions; // Export new actions

// Export the reducer
export default orderSlice.reducer;
