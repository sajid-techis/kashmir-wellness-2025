// src/app/appointments/[id]/page.js
// This component displays the detailed information for a single appointment.
// It fetches data from the backend using Redux Toolkit thunks.
// FIX: Correctly handles displaying details for both doctor and lab appointments,
// using optional chaining to prevent "Cannot read properties of null" errors.
// FIXED: Removed redundant clearSingleAppointment() call on mount to ensure data loads correctly.
// FIXED: Refined the 'Appointment not found' conditional rendering to prevent premature display.
// FIXED: Corrected Redux state access from 'appointment' to 'singleAppointment'.
// IMPROVEMENT: Enhanced the styling of the appointment details card for better visual appeal.
// IMPROVEMENT: Added "Get Directions" button for location.

'use client'; // This component uses client-side hooks

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation'; // For Next.js dynamic routes
import { fetchAppointmentById, clearAppointmentError, clearSingleAppointment } from '../../../features/appointments/appointmentSlice';
import { toast } from 'react-toastify'; // For notifications
import { CalendarDays, Clock, MessageSquare, FlaskConical, Stethoscope, MapPin, User as UserIcon } from 'lucide-react'; // Import icons

function AppointmentDetailPage() {
  const dispatch = useDispatch();
  const params = useParams(); // Get route parameters (e.g., { id: 'appointmentId' })
  const appointmentId = params.id; // Extract the appointment ID from the URL

  // Get appointment states from Redux
  const { singleAppointment, isLoading, error } = useSelector((state) => state.appointments);

  useEffect(() => {
    if (appointmentId) {
      // Dispatch the thunk to fetch the specific appointment when component mounts or ID changes
      dispatch(fetchAppointmentById(appointmentId));
    }

    // Clear any previous errors when component mounts
    dispatch(clearAppointmentError());

    // Cleanup function to clear errors and appointment data on unmount
    return () => {
      dispatch(clearAppointmentError());
      dispatch(clearSingleAppointment()); // Keep this for proper cleanup when component unmounts
    };
  }, [dispatch, appointmentId]); // Depend on dispatch and appointmentId

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Loading appointment details...</p>
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
        <p className="text-xl font-semibold">Error loading appointment: {error}</p>
      </div>
    );
  }

  // If appointment data is not available after loading and there's no error, display a message
  // This ensures the "not found" message only appears if loading has completed and no data was found.
  if (!singleAppointment && !isLoading && !error) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Appointment not found or no data available.</p>
      </div>
    );
  }

  // Function to open Google Maps directions
  const handleGetDirections = () => {
    if (singleAppointment.location && singleAppointment.location.address) {
      const address = encodeURIComponent(singleAppointment.location.address);
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${address}&travelmode=driving`;
      window.open(googleMapsUrl, '_blank');
    } else {
      toast.error('Location address not available for directions.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center p-8
                     bg-gradient-to-br from-kashmir-light to-blue-100
                     dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl border border-gray-200 mb-8
                     dark:bg-gray-700 dark:border-gray-600 dark:shadow-xl transition-colors duration-300">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl font-bold text-kashmir-dark-blue dark:text-kashmir-light mb-8">
            Appointment Details
          </h2>

          {/* Stylish Details Card */}
          <div className="w-full max-w-md bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 space-y-4">

            {/* User Detail */}
            <div className="flex items-center justify-center p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600">
              <UserIcon className="w-6 h-6 mr-4 text-kashmir-gold flex-shrink-0" />
              <p className="text-lg text-gray-800 dark:text-gray-100 font-medium flex-grow text-left">
                User: <span className="font-normal">{singleAppointment.user?.name || 'N/A'}</span>
                <span className="block text-sm text-gray-600 dark:text-gray-300">{singleAppointment.user?.email || 'N/A'}</span>
              </p>
            </div>

            {/* Doctor or Lab Detail */}
            {singleAppointment.type === 'lab' && singleAppointment.lab ? (
              <div className="flex items-center justify-center p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600">
                <FlaskConical className="w-6 h-6 mr-4 text-kashmir-gold flex-shrink-0" />
                <p className="text-lg text-gray-800 dark:text-gray-100 font-medium flex-grow text-left">
                  Lab: <span className="font-normal">{singleAppointment.lab.name || 'N/A'}</span>
                </p>
              </div>
            ) : singleAppointment.type !== 'lab' && singleAppointment.doctor ? (
              <div className="flex items-center justify-center p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600">
                <Stethoscope className="w-6 h-6 mr-4 text-kashmir-gold flex-shrink-0" />
                <p className="text-lg text-gray-800 dark:text-gray-100 font-medium flex-grow text-left">
                  Doctor: <span className="font-normal">Dr. {singleAppointment.doctor.name || 'N/A'}</span>
                  <span className="block text-sm text-gray-600 dark:text-gray-300">{singleAppointment.doctor.specialization || 'N/A'}</span>
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600 text-red-500">
                <FlaskConical className="w-6 h-6 mr-4 text-red-500 flex-shrink-0" />
                <Stethoscope className="w-6 h-6 mr-4 text-red-500 flex-shrink-0" />
                <p className="text-lg font-medium flex-grow text-left">
                  No Doctor or Lab information available.
                </p>
              </div>
            )}

            {/* Date Detail */}
            <div className="flex items-center justify-center p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600">
              <CalendarDays className="w-6 h-6 mr-4 text-kashmir-gold flex-shrink-0" />
              <p className="text-lg text-gray-800 dark:text-gray-100 font-medium flex-grow text-left">
                Date: <span className="font-normal">{new Date(singleAppointment.appointmentDate).toLocaleDateString()}</span>
              </p>
            </div>

            {/* Time Detail */}
            <div className="flex items-center justify-center p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600">
              <Clock className="w-6 h-6 mr-4 text-kashmir-gold flex-shrink-0" />
              <p className="text-lg text-gray-800 dark:text-gray-100 font-medium flex-grow text-left">
                Time: <span className="font-normal">{singleAppointment.appointmentTime}</span>
              </p>
            </div>

            {/* Reason Detail */}
            <div className="flex items-center justify-center p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600">
              <MessageSquare className="w-6 h-6 mr-4 text-kashmir-gold flex-shrink-0" />
              <p className="text-lg text-gray-800 dark:text-gray-100 font-medium flex-grow text-left">
                Reason: <span className="font-normal">{singleAppointment.reason || 'Not provided'}</span>
              </p>
            </div>

            {/* Status Detail */}
            <div className="flex items-center justify-center p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600">
              <p className="text-lg text-gray-800 dark:text-gray-100 font-medium flex-grow text-left">
                Status:
                <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium
                                 ${singleAppointment.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                   singleAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                  {singleAppointment.status.charAt(0).toUpperCase() + singleAppointment.status.slice(1)}
                </span>
              </p>
            </div>

            {/* Location Detail (if available) */}
            {singleAppointment.location && singleAppointment.location.address && (
              <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-100 dark:border-gray-600">
                <div className="flex items-center mb-2">
                  <MapPin className="w-6 h-6 mr-4 text-kashmir-gold flex-shrink-0" />
                  <p className="text-lg text-gray-800 dark:text-gray-100 font-medium flex-grow text-left">
                    Location: <span className="font-normal">{singleAppointment.location.address}</span>
                  </p>
                </div>
                {/* Get Directions Button */}
                <button
                  onClick={handleGetDirections}
                  className="mt-2 py-2 px-4 bg-kashmir-green text-kashmir-light rounded-md font-semibold text-md
                             hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                             dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
                >
                  Get Directions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetailPage;
