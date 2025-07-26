// src/app/auth/resetpassword/page.js
// This component provides a form for users to reset their password using a token,
// now styled with custom Kashmir Wellness colors and supporting dark/light mode.

'use client'; // This directive marks the component as a Client Component

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // For navigation and URL params
import axiosInstance from '../../../utils/api/axiosInstance'; // Import the configured axios instance
import { useDispatch, useSelector } from 'react-redux'; // For Redux state updates (e.g., auto-login)
import { loginUser } from '../../../features/auth/authSlice'; // To auto-login after reset

function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState(null); // State to store the token from URL

  const router = useRouter();
  const searchParams = useSearchParams(); // Hook to get URL search parameters
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Effect to extract reset token from URL and redirect if already authenticated
  useEffect(() => {
    // Check for authentication first
    if (isAuthenticated) {
      router.push('/'); // Redirect to home if already logged in
      return;
    }

    // Extract the token from the URL query parameters
    // The backend's forgotPassword sends a URL like: /api/v1/auth/resetpassword/:resettoken
    // In the frontend, the URL might be /auth/resetpassword?token=YOUR_TOKEN
    // We need to get the 'token' query parameter.
    const token = searchParams.get('token');
    if (token) {
      setResetToken(token);
    } else {
      setError('No reset token found in URL.');
    }
  }, [isAuthenticated, router, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!resetToken) {
      setError('Reset token is missing.');
      setIsLoading(false);
      return;
    }

    try {
      // Send the new password and token to the backend's reset password endpoint
      // Note: The backend expects the token in the URL path, not as a query param.
      // So, we construct the URL like this.
      const response = await axiosInstance.put(`/auth/resetpassword/${resetToken}`, { password });
      setMessage('Password has been reset successfully. You are now logged in.');
      
      // Optionally, auto-login the user after successful password reset
      // The backend's resetPassword controller sends back a token and user data
      // which can be used to update Redux state.
      if (response.data.token && response.data.user) {
        dispatch(loginUser.fulfilled(response.data)); // Manually dispatch fulfilled action
        router.push('/'); // Redirect to home page
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again or request a new link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kashmir-light to-blue-100 p-4
                     dark:from-gray-800 dark:to-gray-900 transition-colors duration-300"> {/* Dark mode for background */}
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200
                     dark:bg-gray-700 dark:border-gray-600 dark:shadow-xl transition-colors duration-300"> {/* Dark mode for card */}
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                       dark:text-kashmir-light transition-colors duration-300"> {/* Dark mode for heading */}
          Reset Password
        </h2>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-6
                         dark:bg-green-900 dark:border-green-700 dark:text-green-200"> {/* Dark mode for success message */}
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline ml-2">{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6
                         dark:bg-red-900 dark:border-red-700 dark:text-red-200"> {/* Dark mode for error alert */}
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {!resetToken ? (
          <p className="text-center text-gray-600 dark:text-gray-300">
            Loading reset token... If you were directed here from an email, please ensure the URL is complete.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2
                                                 dark:text-gray-200"> {/* Dark mode for label */}
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-kashmir-green focus:border-kashmir-green sm:text-sm transition duration-150 ease-in-out
                           bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2
                                                       dark:text-gray-200"> {/* Dark mode for label */}
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-kashmir-green focus:border-kashmir-green sm:text-sm transition duration-150 ease-in-out
                           bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-kashmir-light bg-kashmir-green hover:bg-kashmir-gold hover:text-kashmir-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kashmir-green transition duration-300 ease-in-out
                          dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-gray-600 text-sm
                      dark:text-gray-300"> {/* Dark mode for paragraph text */}
          <a href="/auth/login" className="font-medium text-kashmir-green hover:text-kashmir-gold
                                                  dark:text-kashmir-gold dark:hover:text-kashmir-green"> {/* Dark mode for link */}
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
