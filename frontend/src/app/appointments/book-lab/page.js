// src/app/appointments/book-lab/page.js
// This component provides a form for users to book a lab test.
// It receives the labId from URL query parameters and allows users to select
// a date, time slot, and now, multiple tests available at the lab.
// UPDATED: Fixed infinite loop by adjusting useEffect dependencies for lab fetching.
// UPDATED: Added hydration check to ensure user authentication state is loaded before allowing booking.
// FIXED: User ID property check from user.id to user._id.
// NEW: Replaced 'reasonForTest' textarea with a multi-select dropdown for 'selectedTests'.
// FIXED: Infinite loop resolved by using useRef to track if lab data has been fetched for the current labId.
// FIXED: Router.push and toast.success not working by removing premature state clearing in useEffect.
// IMPROVEMENT: Changed the multi-select dropdown for lab tests to individual checkboxes.
// IMPROVEMENT: Removed all console.log statements.

'use client'; // This component uses client-side hooks

import React, { useEffect, useState, useRef } from 'react'; // Import useRef
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import { fetchLabById, clearLabErrors, clearSingleLab } from '../../../features/labs/labSlice'; // To fetch lab details
import { createAppointment, clearAppointmentError, clearAppointmentSuccess } from '../../../features/appointments/appointmentSlice'; // Import appointment actions
import { toast } from 'react-toastify'; // For notifications
import { Calendar, Clock, FlaskConical, Loader2, TestTube } from 'lucide-react'; // Import icons (added TestTube)

function BookLabAppointmentPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook to get URL search parameters
  const labId = searchParams.get('labId'); // Extract the lab ID from the URL query

  // Get lab states from Redux
  const { lab, isLoading: labLoading, error: labError } = useSelector((state) => state.labs);
  // Get auth state for user info and authentication status, including hydration status
  const { isAuthenticated, user, isHydrated } = useSelector((state) => state.auth); // Destructure isHydrated
  // Get appointment creation states from Redux
  const { isLoading: appointmentLoading, error: appointmentError, success: appointmentSuccess, singleAppointment: newAppointment } = useSelector((state) => state.appointments); // Alias singleAppointment to newAppointment

  // Form states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  // State for selected tests (array of strings)
  const [selectedTests, setSelectedTests] = useState([]);

  // useRef to track the labId for which data has been fetched
  const fetchedLabIdRef = useRef(null);

  useEffect(() => {
    // Only proceed if the Redux store has been hydrated from localStorage
    if (!isHydrated) {
      return;
    }

    // Redirect if not authenticated AFTER hydration
    if (!isAuthenticated) {
      router.push('/auth/login');
      toast.info('Please log in to book a lab test.');
      return;
    }

    // If labId is not present in URL, redirect or show error
    if (!labId) {
      toast.error('No lab selected. Please choose a lab to book a test.');
      router.push('/labs'); // Redirect to labs list if no labId
      return;
    }

    // Fetch lab details only if the labId has changed or if it's the initial load
    // and we haven't fetched for this specific labId yet.
    if (labId && fetchedLabIdRef.current !== labId) {
      dispatch(fetchLabById(labId));
      fetchedLabIdRef.current = labId; // Mark this labId as fetched
    }

    // Clear any previous lab-related errors when component mounts
    dispatch(clearLabErrors());

    // Cleanup function: This runs when the component unmounts
    return () => {
      dispatch(clearLabErrors());
      dispatch(clearSingleLab()); // Clear previous lab details ONLY on unmount
      dispatch(clearAppointmentError()); // Clear appointment errors on unmount
      dispatch(clearAppointmentSuccess()); // Clear appointment success on unmount
      fetchedLabIdRef.current = null; // Reset ref on unmount
    };
  }, [dispatch, labId, isAuthenticated, router, isHydrated, user]); // Removed 'lab' from dependencies

  // Effect to handle appointment creation success/error
  useEffect(() => {
    if (appointmentSuccess && newAppointment) {
      toast.success('Lab test appointment booked successfully!');
      dispatch(clearAppointmentSuccess()); // Clear success flag
      // Redirect to the newly created appointment's detail page
      router.push(`/appointments/${newAppointment._id}`);
    }
    if (appointmentError) {
      toast.error(appointmentError);
      dispatch(clearAppointmentError()); // Clear error flag
    }
  }, [appointmentSuccess, appointmentError, newAppointment, dispatch, router]);

  // Handle checkbox change for tests
  const handleTestChange = (e) => {
    const { value, checked } = e.target;
    setSelectedTests((prevSelectedTests) => {
      if (checked) {
        return [...prevSelectedTests, value];
      } else {
        return prevSelectedTests.filter((test) => test !== value);
      }
    });
  };

  // Handle confirming the appointment booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTimeSlot || selectedTests.length === 0) { // Check if at least one test is selected
      toast.error('Please fill in all appointment details and select at least one test.');
      return;
    }

    // This check is now more reliable as `user` should be hydrated if `isHydrated` is true
    // FIX: Changed user.id to user._id
    if (!user || !user._id) {
      toast.error('User not authenticated. Please log in.');
      router.push('/auth/login');
      return;
    }

    const appointmentData = {
      lab: labId, // Use the labId from URL
      user: user._id, // FIX: Use user._id for the user ID
      appointmentDate: selectedDate,
      appointmentTime: selectedTimeSlot,
      // Join selected tests into a string for the 'reason' field
      reason: selectedTests.join(', '), // Send selected tests as a comma-separated string
      type: 'lab', // Explicitly set type to 'lab'
    };

    dispatch(createAppointment(appointmentData));
  };

  // Show loading state for initial hydration or data fetching
  if (!isHydrated || labLoading || appointmentLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <Loader2 className="w-10 h-10 animate-spin text-kashmir-green dark:text-kashmir-gold" />
        <p className="text-xl font-semibold ml-4 dark:text-gray-300">Loading user data and lab details for booking...</p>
      </div>
    );
  }

  // Show error state for lab details
  if (labError) {
    toast.error(labError);
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-red-400">
        <p className="text-xl font-semibold">Error loading lab: {labError}</p>
      </div>
    );
  }

  // If lab data is not available after loading, display a message
  if (!lab) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Lab not found or no data available for booking.</p>
      </div>
    );
  }

  // Define some example time slots (replace with actual lab's slots from backend if available)
  const timeSlots = [
    '09:00 AM - 09:30 AM',
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '02:00 PM - 02:30 PM',
    '02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM',
  ];

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center p-8
                     bg-gradient-to-br from-kashmir-light to-blue-100
                     dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200
                     dark:bg-gray-700 dark:border-gray-600 dark:shadow-xl transition-colors duration-300">
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                       dark:text-kashmir-light transition-colors duration-300">
          Book Test at {lab.name}
        </h2>

        {appointmentError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6
                         dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{appointmentError}</span>
          </div>
        )}

        <form onSubmit={handleConfirmBooking} className="space-y-6">
          <div>
            <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              <Calendar className="inline-block w-4 h-4 mr-1 text-kashmir-gold" /> Select Date
            </label>
            <input
              type="date"
              id="appointmentDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-kashmir-green focus:border-kashmir-green dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              required
              min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
            />
          </div>

          <div>
            <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              <Clock className="inline-block w-4 h-4 mr-1 text-kashmir-gold" /> Select Time Slot
            </label>
            <select
              id="timeSlot"
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-kashmir-green focus:border-kashmir-green dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              required
            >
              <option value="">-- Select a Time Slot --</option>
              {timeSlots.map((slot, index) => (
                <option key={index} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          {/* Multi-select dropdown with Checkboxes for Lab Tests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              <TestTube className="inline-block w-4 h-4 mr-1 text-kashmir-gold" /> Select Tests (Multiple)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 max-h-48 overflow-y-auto">
              {lab.services && lab.services.length > 0 ? (
                lab.services.map((service, index) => (
                  <label key={index} className="flex items-center text-gray-800 dark:text-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      value={service}
                      checked={selectedTests.includes(service)}
                      onChange={handleTestChange}
                      className="form-checkbox h-4 w-4 text-kashmir-green rounded focus:ring-kashmir-green dark:bg-gray-600 dark:border-gray-500 dark:checked:bg-kashmir-gold"
                    />
                    <span className="ml-2 text-sm">{service}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No tests available for this lab.</p>
              )}
            </div>
            {selectedTests.length === 0 && (
              <p className="text-sm text-red-500 mt-1">Please select at least one test.</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => router.push(`/labs/${labId}`)} // Go back to lab detail page
              className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 dark:text-gray-200
                         hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={appointmentLoading || selectedTests.length === 0} // Disable if no tests selected
              className={`py-2 px-4 rounded-md font-semibold
                          ${appointmentLoading || selectedTests.length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-kashmir-green text-kashmir-light hover:bg-kashmir-gold hover:text-kashmir-dark-blue dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light'}
                          transition duration-300`}
            >
              {appointmentLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookLabAppointmentPage;
