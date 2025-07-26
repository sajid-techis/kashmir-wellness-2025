// src/app/profile/page.js
// This component displays the current user's profile information
// and allows them to update their details and change their password.
// It is protected, meaning only authenticated users can access it.
// This version integrates Redux Toolkit thunks for profile updates, password changes,
// and now fetches the full user profile on component mount.
// Fixes image loading by constructing full backend URL for imageUrl.

'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User } from 'lucide-react'; // Import the User icon from lucide-react
import {
  updateUserProfile,
  changeUserPassword,
  fetchUserProfile,
  clearAuthError,
} from '../../features/auth/authSlice'; // Import new thunks and clearAuthError

function ProfilePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  // Destructure all relevant states from authSlice, including new fetchProfile states
  const {
    user,
    isAuthenticated,
    isLoading: authLoading, // General auth loading (e.g., on initial load/redirect)
    profileUpdateLoading,
    profileUpdateError,
    passwordChangeLoading,
    passwordChangeError: reduxPasswordChangeError,
    fetchProfileLoading,
    fetchProfileError,
  } = useSelector((state) => state.auth);

  // Local state for user details, initialized from Redux user object
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState(null); // To display current image or preview new one
  const [imageFile, setImageFile] = useState(null); // To hold new image file for upload

  // Local state for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null); // Local state for client-side password mismatch error

  // Local message states (for success messages, as Redux only handles errors)
  const [profileMessage, setProfileMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Get the backend API base URL from environment variables
  // This is used to construct the full URL for images served by the backend.
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
  // Extract just the host part (e.g., http://localhost:5000)
  const BACKEND_HOST_URL = API_BASE_URL.replace('/api/v1', '');


  // Effect to redirect if not authenticated and clear errors/messages
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }

    // Clear all auth-related errors and local messages when component mounts or unmounts
    dispatch(clearAuthError());
    setProfileMessage(null);
    setPasswordMessage(null);
    setPasswordError(null);

    return () => {
      dispatch(clearAuthError());
      setPasswordError(null);
    };
  }, [isAuthenticated, authLoading, router, dispatch]);

  // Effect to fetch user profile and populate form fields
  useEffect(() => {
    // Only fetch profile if authenticated and not already loading, and user data is not fully populated
    if (isAuthenticated && !fetchProfileLoading && (!user || !user.phone || !user.address || !user.imageUrl)) {
      dispatch(fetchUserProfile());
    }

    // Populate form fields from the 'user' object in Redux state
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      // Construct the full image URL if user.imageUrl exists and is a relative path
      if (user.imageUrl && user.imageUrl.startsWith('/uploads')) {
        setImageUrl(`${BACKEND_HOST_URL}${user.imageUrl}`);
      } else {
        setImageUrl(user.imageUrl || null); // Use existing URL if absolute, or null for icon
      }
    }
  }, [user, isAuthenticated, fetchProfileLoading, dispatch, BACKEND_HOST_URL]); // Add BACKEND_HOST_URL to dependencies

  // Handle file input change for profile image
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      // Create a local URL for immediate preview (this is a temporary browser URL)
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Handle profile details update using Redux thunk
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage(null); // Clear previous success message
    dispatch(clearAuthError()); // Clear previous Redux errors

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('address', address);
    if (imageFile) {
      formData.append('image', imageFile); // 'image' should match the field name in uploadMiddleware
    }

    const resultAction = await dispatch(updateUserProfile(formData));

    if (updateUserProfile.fulfilled.match(resultAction)) {
      setProfileMessage('Profile updated successfully!');
      setImageFile(null); // Clear file input after successful upload
      // The imageUrl will be updated by the useEffect that listens to 'user' changes
    }
  };

  // Handle password change using Redux thunk
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(null); // Clear previous success message
    setPasswordError(null); // Clear previous local password mismatch error
    dispatch(clearAuthError()); // Clear previous Redux errors

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    const resultAction = await dispatch(changeUserPassword({ currentPassword, newPassword }));

    if (changeUserPassword.fulfilled.match(resultAction)) {
      setPasswordMessage(resultAction.payload.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  // Show loading state if authentication is loading or profile is being fetched
  if (authLoading || fetchProfileLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Loading user profile...</p>
      </div>
    );
  }

  // If not authenticated after loading, redirect already handled by useEffect
  // If there's an error fetching profile, display it
  if (fetchProfileError) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-red-400">
        <p className="text-xl font-semibold">Error loading profile: {fetchProfileError}</p>
      </div>
    );
  }

  // Render the profile form only if user data is available
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">No user data available. Please log in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center p-8
                     bg-gradient-to-br from-kashmir-light to-blue-100
                     dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl border border-gray-200 mb-8
                     dark:bg-gray-700 dark:border-gray-600 dark:shadow-xl transition-colors duration-300">
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                       dark:text-kashmir-light transition-colors duration-300">
          My Profile
        </h2>

        {/* Profile Details Section */}
        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-kashmir-dark-blue mb-6 border-b pb-2
                         dark:text-kashmir-light dark:border-gray-600">
            Personal Information
          </h3>
          {profileMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-6
                           dark:bg-green-900 dark:border-green-700 dark:text-green-200">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline ml-2">{profileMessage}</span>
            </div>
          )}
          {profileUpdateError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6
                           dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{profileUpdateError}</span>
            </div>
          )}
          <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex flex-col items-center mb-4">
              {/* Conditional rendering for profile image or icon */}
              {imageUrl ? (
                <Image
                  src={imageUrl} // This will now be the full URL
                  alt="Profile Picture"
                  width={150}
                  height={150}
                  className="rounded-full object-cover border-4 border-kashmir-green shadow-lg dark:border-kashmir-gold"
                />
              ) : (
                <div className="w-[150px] h-[150px] rounded-full flex items-center justify-center bg-gray-200 border-4 border-kashmir-green shadow-lg
                                dark:bg-gray-600 dark:border-kashmir-gold">
                  <User className="w-24 h-24 text-gray-500 dark:text-gray-300" /> {/* Lucide User icon */}
                </div>
              )}
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-4 text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0 file:text-sm file:font-semibold
                           file:bg-kashmir-green file:text-kashmir-light hover:file:bg-kashmir-gold hover:file:text-kashmir-dark-blue
                           dark:file:bg-kashmir-gold dark:file:text-kashmir-dark-blue dark:hover:file:bg-kashmir-green dark:hover:file:text-kashmir-light"
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-kashmir-green focus:border-kashmir-green sm:text-sm
                           bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-kashmir-green focus:border-kashmir-green sm:text-sm
                           bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">Phone</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-kashmir-green focus:border-kashmir-green sm:text-sm
                           bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">Address</label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-kashmir-green focus:border-kashmir-green sm:text-sm
                           bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-kashmir-light bg-kashmir-green hover:bg-kashmir-gold hover:text-kashmir-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kashmir-green transition duration-300 ease-in-out
                            dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light ${
                  profileUpdateLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={profileUpdateLoading}
              >
                {profileUpdateLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </section>

        {/* Change Password Section */}
        <section className="mt-10">
          <h3 className="text-2xl font-semibold text-kashmir-dark-blue mb-6 border-b pb-2
                         dark:text-kashmir-light dark:border-gray-600">
            Change Password
          </h3>
          {passwordMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-6
                           dark:bg-green-900 dark:border-green-700 dark:text-green-200">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline ml-2">{passwordMessage}</span>
            </div>
          )}
          {/* Display local passwordError for mismatch, or Redux's passwordChangeError for API errors */}
          {(passwordError || reduxPasswordChangeError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6
                           dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{passwordError || reduxPasswordChangeError}</span>
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-kashmir-green focus:border-kashmir-green sm:text-sm
                           bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-kashmir-green focus:border-kashmir-green sm:text-sm
                           bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
              />
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">Confirm New Password</label>
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-kashmir-green focus:border-kashmir-green sm:text-sm
                           bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-kashmir-light bg-kashmir-green hover:bg-kashmir-gold hover:text-kashmir-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kashmir-green transition duration-300 ease-in-out
                            dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light ${
                  passwordChangeLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={passwordChangeLoading}
              >
                {passwordChangeLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
