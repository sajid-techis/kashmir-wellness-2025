// src/app/doctors/page.js
// This component displays a list of all available doctors for regular users to browse.
// It fetches data from the backend using Redux Toolkit thunks.
// NEW: Includes a small interactive map for doctors using Leaflet.js and OpenStreetMap.
// UPDATED: Changed "View on Google Maps" link to a "Get Directions" button.

'use client'; // This component uses client-side hooks

import React, { useEffect, useRef } from 'react'; // Import useRef for map elements
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import Image from 'next/image'; // For displaying doctor images
import { fetchDoctors, clearDoctorErrors } from '../../features/doctors/doctorSlice'; // Import the fetchDoctors thunk
import { toast } from 'react-toastify'; // For notifications
import { MapPin, Phone, Mail, Clock, BriefcaseMedical, Loader2 } from 'lucide-react'; // Import icons

// Import Leaflet CSS and JS dynamically
// We need to do this client-side as Leaflet uses browser APIs
import 'leaflet/dist/leaflet.css'; // Leaflet CSS
import L from 'leaflet'; // Leaflet JS library

// Fix for default marker icon issue with Webpack/Next.js
// Leaflet's default icon paths don't always work out-of-the-box with bundlers.
// We manually set them here.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// Get the backend API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
const BACKEND_HOST_URL = API_BASE_URL.replace('/api/v1', ''); // Extracts http://localhost:5000

function DoctorListPage() {
  const dispatch = useDispatch();
  const router = useRouter(); // Initialize useRouter
  // Get doctor states from Redux
  const { doctors, isLoading, error } = useSelector((state) => state.doctors);

  // useRef to hold map instances, keyed by doctor ID
  const mapRefs = useRef({});

  useEffect(() => {
    // Dispatch the thunk to fetch doctors when the component mounts
    dispatch(fetchDoctors());

    // Clear any previous errors when component mounts
    dispatch(clearDoctorErrors());

    // Cleanup function to clear errors and map instances on unmount
    return () => {
      dispatch(clearDoctorErrors());
      // Clean up all map instances when the component unmounts
      Object.values(mapRefs.current).forEach(map => {
        if (map && typeof map.remove === 'function') {
          map.remove();
        }
      });
      mapRefs.current = {}; // Reset map refs
    };
  }, [dispatch]); // Depend on dispatch to ensure it runs once

  // Effect to initialize maps when doctors data changes
  useEffect(() => {
    if (doctors.length > 0) {
      doctors.forEach(doctor => {
        // Check for valid location coordinates
        if (doctor.location && doctor.location.coordinates && doctor.location.coordinates.length === 2) {
          const mapContainerId = `doctor-map-${doctor._id}`;
          // Check if map already exists for this container
          if (!mapRefs.current[mapContainerId]) {
            // Coordinates are [longitude, latitude] from MongoDB, Leaflet needs [latitude, longitude]
            const [lon, lat] = doctor.location.coordinates;
            initializeMap(mapContainerId, lat, lon, doctor.clinicAddress);
          }
        }
      });
    }
  }, [doctors]); // Re-run when doctors change

  // Function to initialize a Leaflet map using provided lat/lon
  const initializeMap = (mapContainerId, lat, lon, address) => {
    const mapElement = document.getElementById(mapContainerId);
    if (mapElement && !mapRefs.current[mapContainerId]) {
      const map = L.map(mapContainerId, {
        center: [lat, lon],
        zoom: 15,
        zoomControl: false, // Hide default zoom control
        dragging: false,    // Disable dragging
        scrollWheelZoom: false, // Disable scroll zoom
        doubleClickZoom: false, // Disable double click zoom
        boxZoom: false,     // Disable box zoom
        keyboard: false,    // Disable keyboard navigation
        tap: false,         // Disable tap (for mobile touch)
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add a marker
      L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${address || 'Doctor Location'}</b>`).openPopup(); // Use clinic address for popup

      // Store map instance in ref for cleanup
      mapRefs.current[mapContainerId] = map;

      // Invalidate size after map container is rendered
      setTimeout(() => {
        map.invalidateSize();
      }, 0);
    }
  };


  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-kashmir-green dark:text-kashmir-gold" />
        <p className="text-xl font-semibold ml-4 dark:text-gray-300">Loading doctors...</p>
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
        <p className="text-xl font-semibold">Error loading doctors: {error}</p>
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
          Our Doctors
        </h2>

        {doctors.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
            No doctors found. Please check back later!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-gray-50 rounded-lg shadow-md overflow-hidden flex flex-col items-center p-4
                           dark:bg-gray-800 dark:shadow-lg transition-colors duration-300"
              >
                {/* Doctor Image */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-kashmir-green shadow-md
                                dark:border-kashmir-gold">
                  {doctor.imageUrl && doctor.imageUrl.includes('res.cloudinary.com') ? (
                    <Image
                      src={doctor.imageUrl} // Use the direct Cloudinary URL
                      alt={doctor.name}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <Image
                      src="https://placehold.co/400x300/E0F2F7/000000?text=Doctor" // Fallback placeholder
                      alt="Doctor Placeholder"
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                  )}
                </div>

                {/* Doctor Details */}
                <h3 className="text-xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-1 text-center">
                  Dr. {doctor.name}
                </h3>
                <p className="text-kashmir-green dark:text-kashmir-gold text-md font-medium mb-2 text-center">
                  {doctor.specialization}
                </p>
                <div className="space-y-1 text-gray-600 dark:text-gray-300 text-sm mb-4 text-center">
                  {doctor.experience > 0 && (
                    <p>Experience: {doctor.experience} years</p>
                  )}
                  {doctor.phone && (
                    <p>Phone: {doctor.phone}</p>
                  )}
                  {doctor.email && (
                    <p>Email: {doctor.email}</p>
                  )}
                  {doctor.clinicAddress && (
                    <p>Clinic: {doctor.clinicAddress}</p>
                  )}
                  {doctor.availability && doctor.availability.length > 0 && (
                    <p>Available: {doctor.availability.join(', ')}</p>
                  )}
                </div>

                {/* Map Section for Doctors */}
                <div className="flex flex-col items-center justify-center w-full mt-2">
                    <p className="flex items-center text-lg font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-2">
                      <MapPin className="w-6 h-6 mr-2 text-kashmir-gold" />
                      Location:
                    </p>
                    {doctor.location?.coordinates ? (
                      <>
                        <div
                          id={`doctor-map-${doctor._id}`} // Unique ID for each map container
                          className="w-full h-48 rounded-md shadow-inner border border-gray-300 dark:border-gray-600"
                          style={{ minHeight: '150px' }} // Ensure a minimum height
                        >
                          {/* Map will be initialized here by Leaflet */}
                        </div>
                        {/* Updated to a button-like link for "Get Directions" */}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.clinicAddress || doctor.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 w-full py-2 px-4 bg-kashmir-green text-kashmir-light rounded-md font-semibold text-sm
                                     hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                                     dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light text-center"
                        >
                          Get Directions
                        </a>
                      </>
                    ) : (
                      <p className="text-center text-lg text-gray-500 dark:text-gray-400 font-medium">
                        Location coordinates not available.
                      </p>
                    )}
                  </div>


                {/* Action Button (e.g., Book Appointment, View Profile) */}
                <button
                  onClick={() => router.push(`/doctors/${doctor._id}`)} // Navigate to doctor detail page
                  className="w-full py-2 px-4 bg-kashmir-green text-kashmir-light rounded-md font-semibold mt-4
                             hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                             dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorListPage;
