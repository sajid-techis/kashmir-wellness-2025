// src/app/appointments/page.js (Hypothetical Frontend Appointments List)
// This component displays a list of all appointments for the authenticated user.
// It fetches data from the backend using Redux Toolkit thunks.
// FIX: Safely accesses doctor.name or lab.name using optional chaining.

'use client'; // This component uses client-side hooks

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { fetchAppointments, clearAppointmentError } from '../../features/appointments/appointmentSlice';
import { toast } from 'react-toastify';
import { CalendarDays, FlaskConical, Stethoscope, MapPin } from 'lucide-react'; // Import relevant icons

function AppointmentsPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { appointments, isLoading, error } = useSelector((state) => state.appointments);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      toast.info('Please log in to view your appointments.');
      return;
    }

    dispatch(fetchAppointments());
    dispatch(clearAppointmentError());

    return () => {
      dispatch(clearAppointmentError());
    };
  }, [dispatch, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Loading your appointments...</p>
      </div>
    );
  }

  if (error) {
    toast.error(error);
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-red-400">
        <p className="text-xl font-semibold">Error loading appointments: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center p-8
                     bg-gradient-to-br from-kashmir-light to-blue-100
                     dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200 mb-8
                     dark:bg-gray-700 dark:border-gray-600 dark:shadow-xl transition-colors duration-300">
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                       dark:text-kashmir-light transition-colors duration-300">
          My Appointments
        </h2>

        {appointments.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
            You have no appointments scheduled.
          </p>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-gray-50 rounded-lg shadow-md p-6
                           dark:bg-gray-800 dark:shadow-lg transition-colors duration-300"
              >
                <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-200 dark:border-gray-600">
                  <h3 className="text-xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light">
                    Appointment ID: <span className="font-normal text-gray-700 dark:text-gray-200">{appointment._id.substring(0, 8)}...</span>
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                                    ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-200 text-base mb-4">
                  <p className="flex items-center">
                    <CalendarDays className="w-5 h-5 mr-2 text-kashmir-gold" />
                    Date: {new Date(appointment.appointmentDate).toLocaleDateString()}
                  </p>
                  <p className="flex items-center">
                    <CalendarDays className="w-5 h-5 mr-2 text-kashmir-gold" />
                    Time: {appointment.appointmentTime}
                  </p>
                  <p className="flex items-center">
                    {/* NEW: Safely access doctor.name or lab.name */}
                    {appointment.type === 'lab' ? (
                      <>
                        <FlaskConical className="w-5 h-5 mr-2 text-kashmir-gold" />
                        Lab: {appointment.lab?.name || 'N/A'}
                      </>
                    ) : (
                      <>
                        <Stethoscope className="w-5 h-5 mr-2 text-kashmir-gold" />
                        Doctor: {appointment.doctor?.name || 'N/A'}
                      </>
                    )}
                  </p>
                  {appointment.location && (
                    <p className="flex items-center col-span-1 md:col-span-2">
                      <MapPin className="w-5 h-5 mr-2 text-kashmir-gold" />
                      Location: {appointment.location.address || 'N/A'}
                    </p>
                  )}
                  <p className="flex items-center col-span-1 md:col-span-2">
                    Reason: {appointment.reason || 'Not provided'}
                  </p>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => router.push(`/appointments/${appointment._id}`)} // Navigate to appointment detail page
                  className="w-full py-2 px-4 bg-kashmir-green text-kashmir-light rounded-md font-semibold
                             hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                             dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentsPage;
