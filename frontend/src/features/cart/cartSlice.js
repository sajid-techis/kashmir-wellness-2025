// src/features/cart/cartSlice.js
// This Redux Toolkit slice manages the state of the shopping cart.
// It handles adding items, removing items, updating quantities,
// and now provides an explicit action for initializing the cart from external storage (like localStorage).

import { createSlice } from '@reduxjs/toolkit';

// Helper function to save cart items to local storage
// This function will still be used by the reducers to persist changes.
const saveCartToLocalStorage = (cartItems) => {
  try {
    const serializedCartItems = JSON.stringify(cartItems);
    localStorage.setItem('cartItems', serializedCartItems);
  } catch (error) {
    console.error("Error saving cart to local storage:", error);
  }
};

// Define the initial state for the cart slice
// cartItems are now initialized as an empty array on both server and client.
// The actual loading from localStorage will happen in a useEffect on the client.
const initialState = {
  cartItems: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // NEW: Action to explicitly initialize cart items from a source (e.g., localStorage)
    initializeCart: (state, action) => {
      state.cartItems = action.payload;
    },
    // Action to add an item to the cart or update its quantity
    addToCart: (state, action) => {
      const newItem = action.payload; // newItem should include medicine details and quantity
      const existItem = state.cartItems.find(item => item.medicine === newItem.medicine);

      if (existItem) {
        // If item already exists, update its quantity
        existItem.quantity = newItem.quantity;
      } else {
        // If item is new, add it to the cart
        state.cartItems.push(newItem);
      }
      saveCartToLocalStorage(state.cartItems); // Save updated cart to local storage
    },
    // Action to remove an item from the cart
    removeFromCart: (state, action) => {
      const idToRemove = action.payload; // Payload is the medicine ID
      state.cartItems = state.cartItems.filter(item => item.medicine !== idToRemove);
      saveCartToLocalStorage(state.cartItems); // Save updated cart to local storage
    },
    // Action to clear the entire cart (e.g., after successful order)
    clearCart: (state) => {
      state.cartItems = [];
      saveCartToLocalStorage(state.cartItems); // Clear cart from local storage
    },
    // Action to update the quantity of an item in the cart
    updateCartItemQuantity: (state, action) => {
      const { medicineId, quantity } = action.payload;
      const itemToUpdate = state.cartItems.find(item => item.medicine === medicineId);
      if (itemToUpdate) {
        itemToUpdate.quantity = quantity;
        saveCartToLocalStorage(state.cartItems);
      }
    }
  },
});

// Export actions
export const { initializeCart, addToCart, removeFromCart, clearCart, updateCartItemQuantity } = cartSlice.actions;

// Export the reducer
export default cartSlice.reducer;
