// src/app/store.js
// This file configures the Redux store using Redux Toolkit.

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice'; // Import the authSlice reducer
import medicineReducder from '../features/medicines/medicineSlice'; // Import the medicineSlice reducer
import doctorReducer from '../features/doctors/doctorSlice'; // Import the doctorSlice reducer
import labReducer from '../features/labs/labSlice'; // Import the labSlice reducer
import orderReducer from '../features/orders/orderSlice'; // Import the orderSlice reducer
import appointmentReducer from '../features/appointments/appointmentSlice'; // Import the appointmentSlice reducer
import cartReducer from '../features/cart/cartSlice'; // Import the cartSlice reducer
import globalSearchReducer from '../features/globalSearch/globalSearchSlice'; // Import the globalSearchSlice reducer





export const store = configureStore({
  reducer: {
    // Add your reducers here.
    // Each key here will be a slice of your Redux state.
    auth: authReducer, // The auth slice will manage authentication state
    medicines: medicineReducder, // The medicine slice will manage medicine state
    doctors: doctorReducer, // The doctor slice will manage doctor state
    labs: labReducer, // The lab slice will manage lab state
    orders: orderReducer, // The order slice will manage order state
    appointments: appointmentReducer, // The appointment slice will manage appointment state
    cart: cartReducer, // The cart slice will manage cart state
    globalSearch: globalSearchReducer, // The global search slice will manage search state
  },
  // Optional: Add middleware (e.g., for RTK Query, if we use it later)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools Extension in development
});
