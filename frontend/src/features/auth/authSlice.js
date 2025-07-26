    // src/features/auth/authSlice.js
    // This Redux Toolkit slice manages the authentication state of the application.
    // It handles user login, logout, registration, profile updates, password changes,
    // fetching the full user profile, and now includes a hydration status.

    import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
    import axiosInstance from '../../utils/api/axiosInstance'; // Import the configured axios instance

    // Define the initial state for the authentication slice
    const initialState = {
      user: null, // Stores user data if logged in
      token: null, // Stores the JWT token
      isAuthenticated: false, // Boolean to track authentication status
      isLoading: false, // Loading state for async operations (general auth operations like login/register)
      error: null, // Stores any authentication errors (general auth errors)
      // Specific states for profile update and password change
      profileUpdateLoading: false,
      profileUpdateError: null,
      passwordChangeLoading: false,
      passwordChangeError: null,
      // New state for fetching user profile
      fetchProfileLoading: false,
      fetchProfileError: null,
      isHydrated: false, // NEW: State to track if the Redux store has been hydrated from localStorage
    };

    // Async Thunk for User Registration
    export const registerUser = createAsyncThunk(
      'auth/registerUser', // Action type prefix
      async (userData, { rejectWithValue }) => {
        try {
          const response = await axiosInstance.post('/auth/register', userData);
          return response.data;
        } catch (error) {
          return rejectWithValue(error.response.data.error || error.message);
        }
      }
    );

    // Async Thunk for User Login
    export const loginUser = createAsyncThunk(
      'auth/loginUser', // Action type prefix
      async (credentials, { rejectWithValue }) => {
        try {
          const response = await axiosInstance.post('/auth/login', credentials);
          return response.data;
        } catch (error) {
          return rejectWithValue(error.response.data.error || error.message);
        }
      }
    );

    // Async Thunk for User Logout
    export const logoutUser = createAsyncThunk(
      'auth/logoutUser',
      async (_, { rejectWithValue }) => {
        try {
          // In a real app, you might hit a backend logout endpoint to invalidate server-side sessions/cookies
          // For now, we'll just clear client-side state
          // await axiosInstance.post('/auth/logout'); // Example if you had a logout endpoint
          return true; // Indicate success
        } catch (error) {
          return rejectWithValue(error.response.data.error || error.message);
        }
      }
    );

    // Async Thunk for User Profile Update
    export const updateUserProfile = createAsyncThunk(
      'auth/updateUserProfile',
      async (userData, { rejectWithValue }) => {
        try {
          // The backend expects multipart/form-data for image uploads,
          // which axios handles automatically if you pass FormData object.
          const response = await axiosInstance.put('/users/updatedetails', userData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          return response.data; // Should contain the updated user object
        } catch (error) {
          return rejectWithValue(error.response.data.error || error.message);
        }
      }
    );

    // Async Thunk for User Password Change
    export const changeUserPassword = createAsyncThunk(
      'auth/changeUserPassword',
      async (passwordData, { rejectWithValue }) => {
        try {
          // passwordData should contain { currentPassword, newPassword }
          const response = await axiosInstance.put('/auth/updatepassword', passwordData);
          return response.data; // Should contain a success message
        } catch (error) {
          return rejectWithValue(error.response.data.error || error.message);
        }
      }
    );

    // NEW Async Thunk for Fetching User Profile
    export const fetchUserProfile = createAsyncThunk(
      'auth/fetchUserProfile',
      async (_, { rejectWithValue }) => {
        try {
          const response = await axiosInstance.get('/users/me');
          return response.data; // Should contain the full user object
        } catch (error) {
          return rejectWithValue(error.response.data.error || error.message);
        }
      }
    );


    // Create the authentication slice
    const authSlice = createSlice({
      name: 'auth', // Name of the slice, used as a prefix for action types
      initialState, // Initial state
      reducers: {
        // Synchronous reducers go here
        clearAuthError: (state) => {
          state.error = null;
          state.profileUpdateError = null;
          state.passwordChangeError = null;
          state.fetchProfileError = null; // Clear new error state
        },
        // This could be used to load user from local storage on app start
        setUserFromStorage: (state, action) => {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        },
        // NEW: Reducer to set the hydration status
        setHydrated: (state) => {
          state.isHydrated = true;
        },
      },
      // Extra reducers for handling async thunk actions
      extraReducers: (builder) => {
        builder
          // Register User
          .addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
          })
          .addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            // Store token and user in localStorage (for persistence across sessions)
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
          })
          .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = action.payload; // Error message from rejectWithValue
          })
          // Login User
          .addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
          })
          .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            // Store token and user in localStorage
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
          })
          .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = action.payload;
          })
          // Logout User
          .addCase(logoutUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
          })
          .addCase(logoutUser.fulfilled, (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = null;
            // Clear data from localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          })
          .addCase(logoutUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            // Even if logout fails on backend, we typically clear client-side state
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          })
          // Update User Profile
          .addCase(updateUserProfile.pending, (state) => {
            state.profileUpdateLoading = true;
            state.profileUpdateError = null;
          })
          .addCase(updateUserProfile.fulfilled, (state, action) => {
            state.profileUpdateLoading = false;
            state.user = action.payload.data; // Assuming backend returns updated user in 'data' field
            // Update localStorage as well
            localStorage.setItem('user', JSON.stringify(action.payload.data));
          })
          .addCase(updateUserProfile.rejected, (state, action) => {
            state.profileUpdateLoading = false;
            state.profileUpdateError = action.payload;
          })
          // Change User Password
          .addCase(changeUserPassword.pending, (state) => {
            state.passwordChangeLoading = true;
            state.passwordChangeError = null;
          })
          .addCase(changeUserPassword.fulfilled, (state, action) => {
            state.passwordChangeLoading = false;
            // Password change typically doesn't return new user/token, just a success message
            // No direct state update for 'user' needed here unless backend re-logs in.
          })
          .addCase(changeUserPassword.rejected, (state, action) => {
            state.passwordChangeLoading = false;
            state.passwordChangeError = action.payload;
          })
          // Fetch User Profile
          .addCase(fetchUserProfile.pending, (state) => {
            state.fetchProfileLoading = true;
            state.fetchProfileError = null;
          })
          .addCase(fetchUserProfile.fulfilled, (state, action) => {
            state.fetchProfileLoading = false;
            state.user = action.payload.data; // Assuming backend returns full user in 'data' field
            // Update localStorage with the full user object
            localStorage.setItem('user', JSON.stringify(action.payload.data));
          })
          .addCase(fetchUserProfile.rejected, (state, action) => {
            state.fetchProfileLoading = false;
            state.fetchProfileError = action.payload;
            // If fetching profile fails, it might mean the token is invalid, so log out
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          });
      },
    });

    // Export synchronous actions
    export const { clearAuthError, setUserFromStorage, setHydrated } = authSlice.actions; // NEW: Export setHydrated

    // Export the reducer
    export default authSlice.reducer;
    