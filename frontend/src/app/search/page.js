// src/app/search/page.js
// This component displays the global search results,
// categorized by medicines, doctors, and labs.
// It reads the search query from the URL and dispatches a Redux thunk
// to fetch the results.

'use client'; // This component uses client-side hooks

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation'; // For reading URL query parameters
import Image from 'next/image'; // For displaying images
import Link from 'next/link'; // For navigating to detail pages
import { performGlobalSearch, setSearchQuery } from '../../features/globalSearch/globalSearchSlice';
import { toast } from 'react-toastify'; // For notifications
import { Loader2, FlaskConical, BriefcaseMedical, Pill } from 'lucide-react'; // Icons

// Get the backend API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
const BACKEND_HOST_URL = API_BASE_URL.replace('/api/v1', ''); // Extracts http://localhost:5000


function SearchPage() {
  console.log('[SearchPage] Component rendered'); // Add this
  const dispatch = useDispatch();
  const searchParams = useSearchParams(); // Get URL search parameters

  // Get global search state from Redux
  const { searchQuery, searchResults, isLoading, error } = useSelector((state) => state.globalSearch);

  // This will always get the latest value
  const urlQuery = searchParams.get('q') || '';

  // Effect to dispatch search when URL query changes or component mounts
  useEffect(() => {
    console.log('[SearchPage] useEffect triggered', { urlQuery, searchQuery });
    // Always update Redux and trigger search if URL query changes
    if (urlQuery && urlQuery !== searchQuery) {
      dispatch(setSearchQuery(urlQuery)); // Update Redux state with URL query
      dispatch(performGlobalSearch(urlQuery)); // Perform the search
      console.log('[SearchPage] Dispatched search for:', urlQuery);
    }
  // IMPORTANT: add searchParams as a dependency!
  }, [urlQuery, searchParams, searchQuery, dispatch]);

  // Display error messages
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const hasResults =
    searchResults.medicines.length > 0 ||
    searchResults.doctors.length > 0 ||
    searchResults.labs.length > 0;

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center p-8
                     bg-gradient-to-br from-kashmir-light to-blue-100
                     dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-5xl border border-gray-200 mb-8
                     dark:bg-gray-700 dark:border-gray-600 dark:shadow-xl transition-colors duration-300">
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                       dark:text-kashmir-light transition-colors duration-300">
          Global Search Results for "{searchQuery}"
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-10 h-10 animate-spin text-kashmir-green dark:text-kashmir-gold" />
            <p className="text-xl font-semibold ml-4 dark:text-gray-300">Searching...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg py-10">
            <p>Error fetching search results: {error}</p>
          </div>
        ) : !hasResults ? (
          <div className="text-center text-gray-600 dark:text-gray-300 text-lg py-10">
            <p>No results found for "{searchQuery}". Please try a different query.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Medicines Results */}
            {searchResults.medicines.length > 0 && (
              <section>
                <h3 className="text-2xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-6 border-b pb-2">
                  <Pill className="inline-block w-6 h-6 mr-2 text-kashmir-gold" /> Medicines
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.medicines.map((medicine) => (
                    <Link href={`/medicines/${medicine._id}`} key={medicine._id} className="block">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full">
                        <div className="relative w-full h-48">
                          <Image
                            src={medicine.imageUrl && medicine.imageUrl.length > 0 ? `${BACKEND_HOST_URL}${medicine.imageUrl[0]}` : 'https://placehold.co/400x300/E0F2F7/000000?text=Medicine'}
                            alt={medicine.name}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h4 className="text-lg font-bold text-kashmir-dark-blue dark:text-kashmir-light mb-1">{medicine.name}</h4>
                          <p className="text-gray-700 dark:text-gray-200 text-sm mb-2 line-clamp-2">{medicine.description}</p>
                          <p className="text-kashmir-green dark:text-kashmir-gold font-bold text-xl mt-auto">₹{medicine.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Doctors Results */}
            {searchResults.doctors.length > 0 && (
              <section>
                <h3 className="text-2xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-6 border-b pb-2">
                  <BriefcaseMedical className="inline-block w-6 h-6 mr-2 text-kashmir-gold" /> Doctors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.doctors.map((doctor) => (
                    <Link href={`/doctors/${doctor._id}`} key={doctor._id} className="block">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full">
                        <div className="relative w-full h-48">
                          <Image
                            src={doctor.imageUrl && doctor.imageUrl.includes('res.cloudinary.com') ? `${BACKEND_HOST_URL}${doctor.imageUrl}` : 'https://placehold.co/400x300/E0F2F7/000000?text=Doctor'}
                            alt={`Dr. ${doctor.name}`}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <div className="p-4 flex flex-col flex-grow">
                          <h4 className="text-lg font-bold text-kashmir-dark-blue dark:text-kashmir-light mb-1">Dr. {doctor.name}</h4>
                          <p className="text-kashmir-green dark:text-kashmir-gold text-md font-semibold mb-2">{doctor.specialization}</p>
                          <p className="text-gray-700 dark:text-gray-200 text-sm mt-auto">{doctor.experience} years experience</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Labs Results */}
            {searchResults.labs.length > 0 && (
              <section>
                <h3 className="text-2xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-6 border-b pb-2">
                  <FlaskConical className="inline-block w-6 h-6 mr-2 text-kashmir-gold" /> Labs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.labs.map((lab) => (
                    <Link href={`/labs/${lab._id}`} key={lab._id} className="block">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full">
                        <div className="p-4 flex flex-col flex-grow">
                          <h4 className="text-lg font-bold text-kashmir-dark-blue dark:text-kashmir-light mb-1">{lab.name}</h4>
                          <p className="text-gray-700 dark:text-gray-200 text-sm mb-2 line-clamp-2">{lab.address}</p>
                          <p className="text-kashmir-green dark:text-kashmir-gold text-md font-semibold mt-auto">Services: {lab.services?.join(', ') || 'N/A'}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
