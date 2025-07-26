// src/app/labs/[id]/page.js
// This component displays the detailed information for a single lab.
// It fetches data from the backend using Redux Toolkit thunks.
// UPDATED: Added router.push to the "Book a Test" button.
// UPDATED: Enhanced UI with modern e-commerce trends, including larger text,
//          more prominent buttons, and improved spacing/shadows.

'use client'; // This component uses client-side hooks

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation'; // Import useRouter
import { fetchLabById, clearLabErrors, clearSingleLab } from '../../../features/labs/labSlice';
import { toast } from 'react-toastify'; // For notifications
import { MapPin, Phone, Mail, Clock, FlaskConical, Stethoscope } from 'lucide-react'; // Added Stethoscope for a service icon

// Get the backend API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
// const BACKEND_HOST_URL = API_BASE_URL.replace('/api/v1', ''); // Not directly used for lab images as labs don't have imageUrl

function LabDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter(); // Initialize useRouter
  const params = useParams(); // Get route parameters (e.g., { id: 'labId' })
  const labId = params.id; // Extract the lab ID from the URL

  // Get lab states from Redux
  const { lab, isLoading, error } = useSelector((state) => state.labs);

  useEffect(() => {
    if (labId) {
      // Dispatch the thunk to fetch the specific lab when component mounts or ID changes
      dispatch(fetchLabById(labId));
    }

    // Clear any previous errors or single lab data when component mounts
    dispatch(clearLabErrors());
    dispatch(clearSingleLab()); // Clear previous lab details

    // Cleanup function to clear errors and lab data on unmount
    return () => {
      dispatch(clearLabErrors());
      dispatch(clearSingleLab());
    };
  }, [dispatch, labId]); // Depend on dispatch and labId

  // Handle booking a test
  const handleBookTest = () => {
    // Navigate to the book-lab appointment page, passing the labId as a query parameter
    router.push(`/appointments/book-lab?labId=${labId}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Loading lab details...</p>
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
        <p className="text-xl font-semibold">Error loading lab: {error}</p>
      </div>
    );
  }

  // If lab data is not available after loading, display a message
  if (!lab) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Lab not found or no data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center p-8
                     bg-gradient-to-br from-kashmir-light to-blue-100
                     dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200 mb-8
                     dark:bg-gray-700 dark:border-gray-600 dark:shadow-xl transition-colors duration-300">
        <div className="flex flex-col items-center text-center">
          <FlaskConical className="w-28 h-28 text-kashmir-green dark:text-kashmir-gold mb-6 animate-pulse" /> {/* Larger, animated icon */}
          <h2 className="text-5xl font-extrabold text-kashmir-dark-blue dark:text-kashmir-light mb-4">
            {lab.name}
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            Your trusted partner for accurate and timely lab diagnostics.
          </p>

          <div className="space-y-6 text-lg text-gray-700 dark:text-gray-200 w-full max-w-md">
            {lab.address && (
              <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                <MapPin className="w-6 h-6 mr-3 text-kashmir-gold flex-shrink-0" />
                <span className="text-left flex-grow">{lab.address}</span>
              </div>
            )}
            {lab.phone && (
              <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                <Phone className="w-6 h-6 mr-3 text-kashmir-gold flex-shrink-0" />
                <span className="text-left flex-grow">Phone: <a href={`tel:${lab.phone}`} className="text-blue-600 hover:underline dark:text-blue-400 ml-1">{lab.phone}</a></span>
              </div>
            )}
            {lab.email && (
              <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                <Mail className="w-6 h-6 mr-3 text-kashmir-gold flex-shrink-0" />
                <span className="text-left flex-grow">Email: <a href={`mailto:${lab.email}`} className="text-blue-600 hover:underline dark:text-blue-400 ml-1">{lab.email}</a></span>
              </div>
            )}
            {lab.operatingHours && (
              <div className="flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                <Clock className="w-6 h-6 mr-3 text-kashmir-gold flex-shrink-0" />
                <span className="text-left flex-grow">Operating Hours: <span className="font-semibold ml-1">{lab.operatingHours}</span></span>
              </div>
            )}
            {lab.services && lab.services.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 w-full">
                <h3 className="text-2xl font-bold text-kashmir-dark-blue dark:text-kashmir-light mb-4 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 mr-2 text-kashmir-green dark:text-kashmir-gold" />
                  Tests & Services Offered:
                </h3>
                <ul className="list-none space-y-2 text-left mx-auto max-w-xs">
                  {lab.services.map((service, index) => (
                    <li key={index} className="flex items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-md shadow-sm">
                      <span className="mr-3 text-kashmir-green dark:text-kashmir-gold text-2xl">•</span>
                      <span className="text-gray-800 dark:text-gray-100">{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-10 w-full max-w-sm">
            <button
              onClick={handleBookTest}
              className="w-full py-4 px-8 bg-kashmir-green text-kashmir-light rounded-xl font-bold text-xl uppercase tracking-wide shadow-lg
                         hover:bg-kashmir-gold hover:text-kashmir-dark-blue transform hover:scale-105 transition duration-300 ease-in-out
                         dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light
                         focus:outline-none focus:ring-4 focus:ring-kashmir-green focus:ring-opacity-50"
            >
              Book a Test Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabDetailPage;
