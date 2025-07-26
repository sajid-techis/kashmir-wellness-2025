// src/app/labs/page.js
// This component displays a list of all available labs for regular users to browse.
// It fetches data from the backend using Redux Toolkit thunks.
// UPDATED: Now uses a dedicated LabMap component for each lab's location display,
// improving map lifecycle management and resolving potential rendering issues.

'use client'; // This component uses client-side hooks

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import Image from 'next/image'; // For displaying lab images (if applicable)
import { fetchLabs, clearLabErrors } from '../../features/labs/labSlice'; // Import the fetchLabs thunk
import { toast } from 'react-toastify'; // For notifications
import { MapPin, Phone, Mail, Clock, FlaskConical, Loader2 } from 'lucide-react'; // Import icons
import LabMap from '../../components/common/LabMap'; // NEW: Import the LabMap component

// Get the backend API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
const BACKEND_HOST_URL = API_BASE_URL.replace('/api/v1', ''); // Extracts http://localhost:5000

function LabListPage() {
  const dispatch = useDispatch();
  const router = useRouter(); // Initialize useRouter
  // Get lab states from Redux
  const { labs, isLoading, error } = useSelector((state) => state.labs);

  useEffect(() => {
    // Dispatch the thunk to fetch labs when the component mounts
    dispatch(fetchLabs());

    // Clear any previous errors when component mounts
    dispatch(clearLabErrors());

    // Cleanup function to clear errors on unmount
    return () => {
      dispatch(clearLabErrors());
    };
  }, [dispatch]); // Depend on dispatch to ensure it runs once

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-kashmir-green dark:text-kashmir-gold" />
        <p className="text-xl font-semibold ml-4 dark:text-gray-300">Loading labs...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    toast.error(error); // Display error using toast
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-red-400">
        <p className="text-xl font-semibold">Error loading labs: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center p-8
                     bg-gradient-to-br from-kashmir-light to-blue-100
                     dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-6xl border border-gray-200 mb-8
                     dark:bg-gray-700 dark:border-gray-600 dark:shadow-xl transition-colors duration-300">
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                       dark:text-kashmir-light transition-colors duration-300">
          Our Partner Labs
        </h2>

        {labs.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
            No labs found. Please check back later!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Adjusted grid for better map display */}
            {labs.map((lab) => (
              <div
                key={lab._id}
                className="bg-gray-50 rounded-lg shadow-md overflow-hidden flex flex-col p-4
                           dark:bg-gray-800 dark:shadow-lg transition-colors duration-300"
              >
                {/* Lab Name */}
                <h3 className="text-xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-2 text-center">
                  {lab.name}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-200 text-sm flex-grow">
                  {/* Left Column - Lab Details */}
                  <div className="space-y-2">
                    {lab.address && (
                      <p className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-kashmir-gold" />
                        {lab.address}
                      </p>
                    )}
                    {lab.phone && (
                      <p className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-kashmir-gold" />
                        <a href={`tel:${lab.phone}`} className="hover:underline">{lab.phone}</a>
                      </p>
                    )}
                    {lab.email && (
                      <p className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-kashmir-gold" />
                        <a href={`mailto:${lab.email}`} className="hover:underline">{lab.email}</a>
                      </p>
                    )}
                    {lab.operatingHours && (
                      <p className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-kashmir-gold" />
                        {lab.operatingHours}
                      </p>
                    )}
                    {lab.services && lab.services.length > 0 && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                        <span className="font-semibold">Services:</span> {lab.services.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Right Column - Map */}
                  <div className="flex flex-col items-center justify-center">
                    <p className="flex items-center text-lg font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-2">
                      <MapPin className="w-6 h-6 mr-2 text-kashmir-gold" />
                      Location:
                    </p>
                    {lab.location?.coordinates ? (
                      <>
                        {/* NEW: Use the LabMap component */}
                        <LabMap
                          labId={lab._id}
                          coordinates={lab.location.coordinates}
                          address={lab.address}
                        />
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lab.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 text-kashmir-green hover:underline dark:text-kashmir-gold text-sm"
                        >
                          View on Google Maps
                        </a>
                      </>
                    ) : (
                      <p className="text-center text-lg text-gray-500 dark:text-gray-400 font-medium">
                        Location coordinates not available.
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-0 mt-4 flex flex-col space-y-2">
                  <button
                    onClick={() => router.push(`/appointments/book-lab?labId=${lab._id}`)} // Navigate to lab appointment booking page
                    className="w-full py-2 px-4 bg-kashmir-green text-kashmir-light rounded-md font-semibold
                               hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                               dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
                  >
                    Book a Test
                  </button>
                  <button
                    onClick={() => router.push(`/labs/${lab._id}`)} // Navigate to lab detail page
                    className="w-full py-2 px-4 bg-gray-200 text-kashmir-dark-blue rounded-md font-semibold
                               hover:bg-gray-300 transition duration-300
                               dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
                  >
                    View Lab Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LabListPage;
