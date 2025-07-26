// src/app/medicines/page.js
// This component displays a list of all available medicines for regular users to browse.
// It fetches data from the backend using Redux Toolkit thunks.
// Now includes a search bar with debounced input to filter medicines by keyword.
// FIX: Only sends 'keyword' query parameter if the search input is not empty.
// IMPROVEMENT: Clears results immediately on typing and shows a "Searching..." message for smoother UX.

'use client'; // This component uses client-side hooks

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'; // Import useRouter
import Image from 'next/image'; // For displaying medicine images
import { fetchMedicines, clearMedicineErrors } from '../../features/medicines/medicineSlice'; // Import the fetchMedicines thunk
import { toast } from 'react-toastify'; // For notifications

// Get the backend API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
const BACKEND_HOST_URL = API_BASE_URL.replace('/api/v1', ''); // Extracts http://localhost:5000

function MedicineListPage() {
  const dispatch = useDispatch();
  const router = useRouter(); // Initialize useRouter
  // Get medicine states from Redux
  const { medicines, isLoading, error } = useSelector((state) => state.medicines);

  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  // NEW: State to indicate if a search is actively being performed (typing + debounce)
  const [isSearching, setIsSearching] = useState(false);

  // Effect to fetch medicines based on search query (with debounce)
  useEffect(() => {
    // Clear any previous errors when component mounts or search query changes
    dispatch(clearMedicineErrors());

    const handler = setTimeout(() => {
      const params = {};
      // Only add keyword to params if searchQuery is not empty
      if (searchQuery.trim() !== '') {
        params.keyword = searchQuery.trim();
      }
      
      console.log("FRONTEND: Dispatching fetchMedicines with params:", params);
      dispatch(fetchMedicines(params)).finally(() => {
        // Once the fetch (fulfilled or rejected) is complete, set isSearching to false
        setIsSearching(false);
      });
    }, 500); // Debounce time: 500ms

    // Cleanup function to clear errors and debounce timer on unmount
    return () => {
      clearTimeout(handler); // Clear timeout on unmount or re-render
      dispatch(clearMedicineErrors());
    };
  }, [dispatch, searchQuery]); // Depend on dispatch and searchQuery

  // Log the current state of medicines, loading, and error for debugging
  console.log("FRONTEND: Medicines state:", medicines, "Loading:", isLoading, "Error:", error);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // As soon as user types, set isSearching to true
    // This provides immediate feedback and can be used to clear current results
    setIsSearching(true);
  };

  // Show loading state
  if (isLoading && !isSearching) { // Only show full loading if it's the initial load, not during active search typing
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Loading medicines...</p>
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
        <p className="text-xl font-semibold">Error loading medicines: {error}</p>
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
          Available Medicines
        </h2>

        {/* Search Bar */}
        <div className="mb-6 w-full max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search medicines by name or description..."
            value={searchQuery}
            onChange={handleSearchChange} // Use the new handler
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-kashmir-green
                       bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
          />
        </div>

        {/* Conditional rendering for search status */}
        {isSearching && (
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg mb-4">
            Searching...
          </p>
        )}

        {/* Display results or "No medicines found" */}
        {(!isSearching && medicines.length === 0) ? ( // Only show "No medicines found" if not actively searching and results are empty
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
            No medicines found. Please check back later!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {medicines.map((medicine) => (
              <div
                key={medicine._id}
                className="bg-gray-50 rounded-lg shadow-md overflow-hidden flex flex-col
                           dark:bg-gray-800 dark:shadow-lg transition-colors duration-300"
              >
                {/* Medicine Image */}
                <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  {medicine.imageUrl && medicine.imageUrl.length > 0 && typeof medicine.imageUrl[0] === 'string' ? (
                    <Image
                      src={medicine.imageUrl[0].includes('res.cloudinary.com') || medicine.imageUrl[0].includes('placehold.co')
                            ? medicine.imageUrl[0] // Use the first element directly if it's an absolute URL
                            : `${BACKEND_HOST_URL}${medicine.imageUrl[0]}` // Prepend if it's a relative path
                           }
                      alt={medicine.name}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <Image
                      src="https://placehold.co/400x300/E0F2F7/000000?text=Medicine" // Fallback placeholder
                      alt="Medicine Placeholder"
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  )}
                </div>

                {/* Medicine Details */}
                <div className="p-4 flex-grow">
                  <h3 className="text-xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-2">
                    {medicine.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                    {medicine.description}
                  </p>
                  <p className="text-gray-700 dark:text-gray-200 font-medium text-lg mb-1">
                    ₹{medicine.price.toFixed(2)}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Stock: {medicine.stock}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Category: {medicine.category}
                  </p>
                </div>

                {/* Action Button (View Details) */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => router.push(`/medicines/${medicine._id}`)} // Navigate to detail page
                    className="w-full py-2 px-4 bg-kashmir-green text-kashmir-light rounded-md font-semibold
                               hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                               dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
                  >
                    View Details
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

export default MedicineListPage;
