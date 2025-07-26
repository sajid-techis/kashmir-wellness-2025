// src/app/providers.js
// This client component wraps the application with the Redux Provider.
// It now handles re-hydrating the authentication state and cart state from localStorage on initial load.
// FIX: Dispatches a global hydration flag after loading localStorage data.

'use client'; // This directive marks the component as a Client Component

import { Provider } from 'react-redux';
import { store } from './store'; // Import your Redux store
import { useEffect } from 'react'; // Import useEffect
import { useDispatch } from 'react-redux'; // Import useDispatch
import { setUserFromStorage, setHydrated } from '../features/auth/authSlice'; // NEW: Import setHydrated
import { initializeCart } from '../features/cart/cartSlice'; // Import the action to initialize cart

/**
 * AuthAndCartInitializer component to re-hydrate auth and cart state from localStorage.
 * This component is a child of Provider and dispatches actions to the store.
 */
function AuthAndCartInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. Attempt to load user and token from localStorage for Auth
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user && token) {
      try {
        dispatch(setUserFromStorage({ user: JSON.parse(user), token }));
      } catch (e) {
        console.error("Failed to parse user data from localStorage:", e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    // 2. Attempt to load cart items from localStorage for Cart
    try {
      const serializedCartItems = localStorage.getItem('cartItems');
      if (serializedCartItems) {
        const parsedCartItems = JSON.parse(serializedCartItems);
        dispatch(initializeCart(parsedCartItems)); // Dispatch to initialize cart state
      }
    } catch (error) {
      console.error("Error loading cart from local storage during hydration:", error);
      localStorage.removeItem('cartItems'); // Clear invalid data
    }

    // NEW: After attempting to hydrate all necessary client-side data, set the global hydrated flag
    dispatch(setHydrated());

  }, [dispatch]); // Dependency array: dispatch is stable, so this runs once on mount

  return <>{children}</>;
}


/**
 * Providers component to wrap the Next.js application with Redux store.
 * It now includes an AuthAndCartInitializer to handle initial state loading.
 * @param {Object} { children } - React children to be rendered inside the provider.
 */
export function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthAndCartInitializer>
        {children}
      </AuthAndCartInitializer>
    </Provider>
  );
}
