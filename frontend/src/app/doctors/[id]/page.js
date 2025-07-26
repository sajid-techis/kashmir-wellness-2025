// src/app/doctors/[id]/page.js
// This component displays the detailed information for a single doctor.
// It fetches data from the backend using Redux Toolkit thunks.
// Includes functionality to book an appointment with the doctor.

'use client'; // This component uses client-side hooks

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation'; // For Next.js dynamic routes and navigation
import Image from 'next/image'; // For displaying doctor images
import { fetchDoctorById, clearDoctorErrors, clearSingleDoctor } from '../../../features/doctors/doctorSlice';
import { createAppointment, clearAppointmentError, clearAppointmentSuccess } from '../../../features/appointments/appointmentSlice'; // Import appointment actions
import { toast } from 'react-toastify'; // For notifications
import { Calendar, Mail, Phone, MapPin, BriefcaseMedical, Clock, MessageSquare } from 'lucide-react'; // Import icons

// Get the backend API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
const BACKEND_HOST_URL = API_BASE_URL.replace('/api/v1', ''); // Extracts http://localhost:5000

function DoctorDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams(); // Get route parameters (e.g., { id: 'doctorId' })
  const doctorId = params.id; // Extract the doctor ID from the URL

  // Get doctor states from Redux
  const { doctor, isLoading, error } = useSelector((state) => state.doctors);
  // Get auth state for user info and authentication status
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  // Get appointment creation states from Redux
  const { isLoading: appointmentLoading, error: appointmentError, success: appointmentSuccess, singleAppointment } = useSelector((state) => state.appointments);

  // State for appointment booking modal and form
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');

  useEffect(() => {
    if (doctorId) {
      dispatch(fetchDoctorById(doctorId));
    }

    // Clear any previous errors or single doctor data when component mounts
    dispatch(clearDoctorErrors());
    dispatch(clearSingleDoctor()); // Clear previous doctor details
    // Clear appointment errors/success on mount
    dispatch(clearAppointmentError());
    dispatch(clearAppointmentSuccess());

    // Cleanup function to clear errors and doctor data on unmount
    return () => {
      dispatch(clearDoctorErrors());
      dispatch(clearSingleDoctor());
      // Clear appointment errors/success on unmount
      dispatch(clearAppointmentError());
      dispatch(clearAppointmentSuccess());
    };
  }, [dispatch, doctorId]); // Depend on dispatch and doctorId

  // Effect to handle appointment creation success/error
  useEffect(() => {
    if (appointmentSuccess && singleAppointment) {
      toast.success('Appointment booked successfully!');
      setShowBookingModal(false); // Close modal
      dispatch(clearAppointmentSuccess()); // Clear success flag
      // Optionally redirect to user's appointments page
      router.push(`/appointments/${singleAppointment._id}`); // Assuming an appointments detail page
    }
    if (appointmentError) {
      toast.error(appointmentError);
      dispatch(clearAppointmentError()); // Clear error flag
    }
  }, [appointmentSuccess, appointmentError, singleAppointment, dispatch, router]);


  // Handle opening the booking modal
  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to book an appointment.');
      router.push('/auth/login');
      return;
    }
    setShowBookingModal(true);
    // Reset form fields when opening modal
    setSelectedDate('');
    setSelectedTimeSlot('');
    setReasonForVisit('');
  };

  // Handle confirming the appointment booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTimeSlot || !reasonForVisit) {
      toast.error('Please fill in all appointment details.');
      return;
    }

    const appointmentData = {
      doctor: doctorId,
      user: user._id, // Assuming user._id is available from Redux auth state
      appointmentDate: selectedDate,
      appointmentTime: selectedTimeSlot,
      reason: reasonForVisit,
    };

    console.log("Booking appointment with data:", appointmentData);
    dispatch(createAppointment(appointmentData));
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Loading doctor details...</p>
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
        <p className="text-xl font-semibold">Error loading doctor: {error}</p>
      </div>
    );
  }

  // If doctor data is not available after loading, display a message
  if (!doctor) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Doctor not found or no data available.</p>
      </div>
    );
  }

  // Define some example time slots (replace with actual doctor's slots from backend if available)
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
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200 mb-8
                     dark:bg-gray-700 dark:border-gray-600 dark:shadow-xl transition-colors duration-300">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Doctor Image */}
          <div className="relative w-48 h-48 rounded-full overflow-hidden flex-shrink-0 border-4 border-kashmir-green shadow-lg
                          dark:border-kashmir-gold">
            {/* --- CORRECTED IMAGE URL LOGIC --- */}
            {(() => {
              let imageUrlToDisplay = "https://placehold.co/400x300/E0F2F7/000000?text=Doctor"; // Default fallback

              if (doctor.imageUrl) {
                if (typeof doctor.imageUrl === 'string' && doctor.imageUrl.trim() !== '') {
                  if (doctor.imageUrl.startsWith('http://') || doctor.imageUrl.startsWith('https://')) {
                    // It's already an absolute URL (like Cloudinary), use it directly
                    imageUrlToDisplay = doctor.imageUrl;
                  } else {
                    // It's a relative path, prepend the backend host
                    imageUrlToDisplay = `${BACKEND_HOST_URL}${doctor.imageUrl}`;
                  }
                }
                // Robustness: Handle case where doctor.imageUrl might be an array (less common for a single image, but good practice)
                else if (Array.isArray(doctor.imageUrl) && doctor.imageUrl.length > 0 && typeof doctor.imageUrl[0] === 'string' && doctor.imageUrl[0].trim() !== '') {
                    if (doctor.imageUrl[0].startsWith('http://') || doctor.imageUrl[0].startsWith('https://')) {
                        imageUrlToDisplay = doctor.imageUrl[0];
                    } else {
                        imageUrlToDisplay = `${BACKEND_HOST_URL}${doctor.imageUrl[0]}`;
                    }
                }
              }

              return (
                <Image
                  src={imageUrlToDisplay}
                  alt={`Dr. ${doctor.name || 'Doctor'}`} // Added fallback for alt text
                  layout="fill"
                  objectFit="cover"
                />
              );
            })()}
            {/* --- END CORRECTED IMAGE URL LOGIC --- */}
          </div>

          {/* Doctor Details */}
          <div className="flex-grow text-center md:text-left">
            <h2 className="text-4xl font-bold text-kashmir-dark-blue dark:text-kashmir-light mb-2">
              {doctor.name}
            </h2>
            <p className="text-kashmir-green dark:text-kashmir-gold text-2xl font-semibold mb-4">
              {doctor.specialization}
            </p>

            <div className="space-y-3 text-lg text-gray-700 dark:text-gray-200">
              {doctor.experience > 0 && (
                <p className="flex items-center justify-center md:justify-start">
                  <BriefcaseMedical className="w-5 h-5 mr-2 text-kashmir-gold" />
                  Experience: <span className="font-semibold ml-1">{doctor.experience}</span> years
                </p>
              )}
              {doctor.email && (
                <p className="flex items-center justify-center md:justify-start">
                  <Mail className="w-5 h-5 mr-2 text-kashmir-gold" />
                  Email: <a href={`mailto:${doctor.email}`} className="text-blue-600 hover:underline dark:text-blue-400">{doctor.email}</a>
                </p>
              )}
              {doctor.phone && (
                <p className="flex items-center justify-center md:justify-start">
                  <Phone className="w-5 h-5 mr-2 text-kashmir-gold" />
                  Phone: <a href={`tel:${doctor.phone}`} className="text-blue-600 hover:underline dark:text-blue-400">{doctor.phone}</a>
                </p>
              )}
              {doctor.clinicAddress && (
                <p className="flex items-center justify-center md:justify-start">
                  <MapPin className="w-5 h-5 mr-2 text-kashmir-gold" />
                  Clinic: {doctor.clinicAddress}
                </p>
              )}
              {doctor.qualifications && doctor.qualifications.length > 0 && (
                <p className="flex items-center justify-center md:justify-start">
                  <span className="font-semibold mr-2">Qualifications:</span> {doctor.qualifications.join(', ')}
                </p>
              )}
              {doctor.availability && doctor.availability.length > 0 && (
                <p className="flex items-center justify-center md:justify-start">
                  <Calendar className="w-5 h-5 mr-2 text-kashmir-gold" />
                  Available: <span className="font-semibold ml-1">{doctor.availability.join(', ')}</span>
                </p>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-8">
              <button
                onClick={handleBookAppointment}
                className="w-full py-3 px-6 bg-kashmir-green text-kashmir-light rounded-md font-semibold text-lg
                           hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                           dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md dark:bg-gray-800 dark:text-gray-100 relative">
            <h3 className="text-2xl font-bold text-kashmir-dark-blue dark:text-kashmir-light mb-6 text-center">
              Book Appointment with {doctor.name}
            </h3>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
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

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  <MessageSquare className="inline-block w-4 h-4 mr-1 text-kashmir-gold" /> Reason for Visit
                </label>
                <textarea
                  id="reason"
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-kashmir-green focus:border-kashmir-green dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  placeholder="e.g., Routine check-up, consultation for flu symptoms..."
                  required
                ></textarea>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 dark:text-gray-200
                             hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appointmentLoading}
                  className={`py-2 px-4 rounded-md font-semibold
                             ${appointmentLoading
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
      )}
    </div>
  );
}

export default DoctorDetailPage;