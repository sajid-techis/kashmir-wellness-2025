// src/app/auth/login/page.js
// This component provides a user login form and interacts with the Redux authSlice
// to handle login functionality, now styled with custom Kashmir Wellness colors
// and supporting dark/light mode.

'use client'; // This directive marks the component as a Client Component

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../../../features/auth/authSlice';
import { useRouter } from 'next/navigation'; // For navigation in Next.js App Router

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Get dispatch function and select state from Redux store
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated, error } = useSelector((state) => state.auth);
  const router = useRouter(); // Initialize useRouter

  // Effect to redirect after successful login
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/'); // Redirect to home page or dashboard after successful login
    }
    // Clear error when component mounts or unmounts
    return () => {
      dispatch(clearAuthError());
    };
  }, [isAuthenticated, router, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kashmir-light to-blue-100 p-4
                     dark:from-gray-800 dark:to-gray-900 transition-colors duration-300"> {/* Dark mode for background */}
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200
                     dark:bg-gray-700 dark:border-gray-600 dark:shadow-xl transition-colors duration-300"> {/* Dark mode for card */}
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                       dark:text-kashmir-light transition-colors duration-300"> {/* Dark mode for heading */}
          Login to Kashmir Wellness
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6
                         dark:bg-red-900 dark:border-red-700 dark:text-red-200"> {/* Dark mode for error alert */}
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2
                                            dark:text-gray-200"> {/* Dark mode for label */}
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-kashmir-green focus:border-kashmir-green sm:text-sm transition duration-150 ease-in-out
                         bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2
                                               dark:text-gray-200"> {/* Dark mode for label */}
              Password
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

          <button
            type="submit"
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-kashmir-light bg-kashmir-green hover:bg-kashmir-gold hover:text-kashmir-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kashmir-green transition duration-300 ease-in-out
                        dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 text-sm
                      dark:text-gray-300"> {/* Dark mode for paragraph text */}
          Don't have an account?{' '}
          <a href="/auth/register" className="font-medium text-kashmir-green hover:text-kashmir-gold
                                            dark:text-kashmir-gold dark:hover:text-kashmir-green"> {/* Dark mode for link */}
            Register here
          </a>
        </p>
        <p className="mt-2 text-center text-gray-600 text-sm
                      dark:text-gray-300"> {/* Dark mode for paragraph text */}
          <a href="/auth/forgotpassword" className="font-medium text-kashmir-green hover:text-kashmir-gold
                                                  dark:text-kashmir-gold dark:hover:text-kashmir-green"> {/* Dark mode for link */}
            Forgot Password?
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
