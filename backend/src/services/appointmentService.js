// src/services/appointmentService.js
// This file contains business logic related to appointment operations.
// It abstracts database interactions and other complex logic away from the controllers.
// UPDATED: Handles populating doctor/lab location and setting appointment's own location.

const Appointment = require('../models/Appointment'); // Import the Appointment model
const Doctor = require('../models/Doctor'); // Import Doctor model for validation/population
const Lab = require('../models/Lab'); // NEW: Import Lab model for validation/population
const User = require('../models/User'); // Import User model for validation/population
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility
const APIFeatures = require('../utils/apiFeatures'); // Import the APIFeatures utility
const mongoose = require('mongoose'); // Import mongoose to use ObjectId for robust comparison

class AppointmentService {
  /**
   * @desc Get all appointments with optional filtering, sorting, and pagination, based on user role
   * @param {Object} queryParams - Query parameters from the request (req.query)
   * @param {Object} authUser - Authenticated user object (req.user)
   * @returns {Promise<Object>} An object containing count and an array of appointments
   * @throws {ErrorResponse} If doctor profile is not found for a doctor user
   */
  async getAppointments(queryParams, authUser) {
    let query;

    // If the user is a regular 'user', they can only see their own appointments
    if (authUser.role === 'user') {
      query = Appointment.find({ user: authUser.id });
    }
    // If the user is a 'doctor', they can see appointments scheduled with them
    else if (authUser.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: authUser.id });
      if (!doctorProfile) {
        throw new ErrorResponse('Doctor profile not found for this user', 404);
      }
      query = Appointment.find({ doctor: doctorProfile._id });
    }
    // If the user is 'admin' or 'lab_staff', they can see all appointments
    else {
      query = Appointment.find();
    }

    // Apply APIFeatures to the query
    const features = new APIFeatures(query, queryParams)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute the query and populate user, doctor, and lab details
    const appointments = await features.query
      .populate({
        path: 'user',
        select: 'name email phone',
      })
      .populate({
        path: 'doctor',
        select: 'name specialization email clinicAddress location', // Ensure 'location' is selected
      })
      .populate({ // NEW: Populate the lab field
        path: 'lab',
        select: 'name address email phone location', // Ensure 'location' is selected for labs
      });

    // Get total count before pagination (if needed for frontend pagination display)
    // Note: features.query.getQuery() is not directly available on populated queries.
    // A separate countDocuments call might be needed if exact total count is required
    // without re-running the full query logic. For now, we'll use length after pagination.
    // const count = await Appointment.countDocuments(features.query.getQuery()); // This line might need adjustment

    return { count: appointments.length, data: appointments };
  }

  /**
   * @desc Get a single appointment by ID, with role-based access
   * @param {string} id - The ID of the appointment to retrieve
   * @param {Object} authUser - Authenticated user object (req.user)
   * @returns {Promise<Object>} The appointment object
   * @throws {ErrorResponse} If appointment is not found or user is not authorized
   */
  async getAppointment(id, authUser) {
    const appointment = await Appointment.findById(id)
      .populate({
        path: 'user',
        select: 'name email phone',
      })
      .populate({
        path: 'doctor',
        select: 'name specialization email user clinicAddress location', // Ensure 'location' is selected
      })
      .populate({ // NEW: Populate the lab field
        path: 'lab',
        select: 'name address email phone location', // Ensure 'location' is selected for labs
      });

    if (!appointment) {
      throw new ErrorResponse(`Appointment not found with id of ${id}`, 404);
    }

    // --- START DEBUGGING LOGS ---
    console.log('--- AppointmentService.getAppointment Debug ---');
    console.log('Authenticated User ID (authUser.id):', authUser.id);
    console.log('Authenticated User Role (authUser.role):', authUser.role);
    console.log('Appointment ID being viewed (id):', id);
    console.log('Appointment User ID (appointment.user?._id):', appointment.user?._id);
    console.log('Appointment Doctor ID (appointment.doctor?._id):', appointment.doctor?._id);
    console.log('Appointment Doctor User ID (appointment.doctor?.user?._id):', appointment.doctor?.user?._id);
    console.log('Appointment Lab ID (appointment.lab?._id):', appointment.lab?._id);
    console.log('Appointment Doctor Clinic Address (appointment.doctor?.clinicAddress):', appointment.doctor?.clinicAddress);
    console.log('Appointment Doctor Location (appointment.doctor?.location):', appointment.doctor?.location);
    console.log('Appointment Lab Address (appointment.lab?.address):', appointment.lab?.address);
    console.log('Appointment Lab Location (appointment.lab?.location):', appointment.lab?.location);
    console.log('Appointment Type:', appointment.type);


    // Convert ObjectIds to string for direct comparison and logging
    const appointmentUserIdStr = appointment.user?._id.toString();
    const authUserIdStr = authUser.id;
    const appointmentDoctorUserIdStr = appointment.doctor?.user ? appointment.doctor.user._id.toString() : null;

    console.log('Auth User ID (string):', authUserIdStr, 'Type:', typeof authUserIdStr, 'Length:', authUserIdStr.length);
    console.log('Appointment User ID (string):', appointmentUserIdStr, 'Type:', typeof appointmentUserIdStr, 'Length:', appointmentUserIdStr.length);
    console.log('Appointment Doctor User ID (string):', appointmentDoctorUserIdStr, 'Type:', typeof appointmentDoctorUserIdStr, 'Length:', appointmentDoctorUserIdStr ? appointmentDoctorUserIdStr.length : 'N/A');

    // Use JSON.stringify to reveal potential hidden characters
    console.log('Auth User ID (JSON.stringify):', JSON.stringify(authUserIdStr));
    console.log('Appointment User ID (JSON.stringify):', JSON.stringify(appointmentUserIdStr));
    console.log('Appointment Doctor User ID (JSON.stringify):', JSON.stringify(appointmentDoctorUserIdStr));

    // Robust comparison using Mongoose.Types.ObjectId.equals()
    const isOwner = appointment.user?._id.equals(new mongoose.Types.ObjectId(authUserIdStr));
    const isAssignedDoctor = authUser.role === 'doctor' && appointmentDoctorUserIdStr && new mongoose.Types.ObjectId(appointmentDoctorUserIdStr).equals(new mongoose.Types.ObjectId(authUserIdStr));
    const isAdminOrLabStaff = authUser.role === 'admin' || authUser.role === 'lab_staff';

    console.log('Is Owner:', isOwner);
    console.log('Is Assigned Doctor:', isAssignedDoctor);
    console.log('Is Admin or Lab Staff:', isAdminOrLabStaff);
    console.log('Full Authorization Condition (NOT isOwner AND NOT isAssignedDoctor AND NOT isAdminOrLabStaff):',
      !isOwner && !isAssignedDoctor && !isAdminOrLabStaff);
    console.log('--- End AppointmentService.getAppointment Debug ---');
    // --- END DEBUGGING LOGS ---

    // Authorization: Ensure user is the owner, the doctor involved, or an admin/lab_staff
    if (!isOwner && !isAssignedDoctor && !isAdminOrLabStaff) {
      throw new ErrorResponse(
        `User ${authUser.id} is not authorized to view this appointment`,
        401
      );
    }

    return appointment;
  }

  /**
   * @desc Create a new appointment
   * @param {Object} appointmentData - Data for the new appointment
   * @param {string} userId - ID of the user creating the appointment
   * @returns {Promise<Object>} The newly created appointment object
   * @throws {ErrorResponse} If doctor/lab is not found or invalid type/data
   */
  async createAppointment(appointmentData, userId) {
    appointmentData.user = userId; // Attach the user creating the appointment

    // Validate that either doctor OR lab is provided, but not both
    if (appointmentData.doctor && appointmentData.lab) {
      throw new ErrorResponse('An appointment cannot be associated with both a doctor and a lab.', 400);
    }
    if (!appointmentData.doctor && !appointmentData.lab) {
      throw new ErrorResponse('An appointment must be associated with either a doctor or a lab.', 400);
    }

    // Determine the type based on whether doctor or lab ID is provided
    if (appointmentData.doctor) {
      appointmentData.type = appointmentData.type || 'offline'; // Default to offline if not specified
      // Validate doctor existence
      const doctor = await Doctor.findById(appointmentData.doctor);
      if (!doctor) {
        throw new ErrorResponse(`Doctor not found with id ${appointmentData.doctor}`, 404);
      }
      // If doctor is found and has location, set appointment's location
      if (doctor.location && doctor.location.coordinates && doctor.clinicAddress) {
        appointmentData.location = {
          type: 'Point',
          coordinates: doctor.location.coordinates,
          address: doctor.clinicAddress
        };
      }
    } else if (appointmentData.lab) {
      appointmentData.type = 'lab'; // Force type to 'lab' if lab ID is provided
      // Validate lab existence
      const lab = await Lab.findById(appointmentData.lab);
      if (!lab) {
        throw new ErrorResponse(`Lab not found with id ${appointmentData.lab}`, 404);
      }
      // If lab is found and has location, set appointment's location
      if (lab.location && lab.location.coordinates && lab.address) {
        appointmentData.location = {
          type: 'Point',
          coordinates: lab.location.coordinates,
          address: lab.address
        };
      }
    }

    const appointment = await Appointment.create(appointmentData);
    return appointment;
  }

  /**
   * @desc Update an existing appointment status/details based on role
   * @param {string} id - The ID of the appointment to update
   * @param {Object} updateData - Data to update the appointment with
   * @param {Object} authUser - Authenticated user object (req.user)
   * @returns {Promise<Object>} The updated appointment object
   * @throws {ErrorResponse} If appointment is not found or user is not authorized
   */
  async updateAppointment(id, updateData, authUser) {
    let appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new ErrorResponse(`Appointment not found with id of ${id}`, 404);
    }

    // Authorization logic:
    if (authUser.role === 'admin') {
      // Admin can update any field
      appointment = await Appointment.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    } else if (authUser.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: authUser.id });
      if (!doctorProfile || appointment.doctor?.toString() !== doctorProfile._id.toString()) {
        throw new ErrorResponse(
          `Doctor ${authUser.id} is not authorized to update this appointment`,
          401
        );
      }
      // Doctors can only update status and reason
      const { status, reason } = updateData;
      appointment = await Appointment.findByIdAndUpdate(
        id,
        { status, reason },
        { new: true, runValidators: true }
      );
    } else if (authUser.role === 'user') {
      // Users can only cancel their own appointments
      if (appointment.user.toString() !== authUser.id || updateData.status !== 'cancelled') {
        throw new ErrorResponse(
          `User ${authUser.id} is not authorized to update this appointment or perform this action`,
          401
        );
      }
      appointment = await Appointment.findByIdAndUpdate(
        id,
        { status: 'cancelled' }, // Force status to cancelled
        { new: true, runValidators: true }
      );
    } else {
      throw new ErrorResponse(`User role ${authUser.role} is not authorized to update appointments`, 403);
    }

    return appointment;
  }

  /**
   * @desc Delete an appointment
   * @param {string} id - The ID of the appointment to delete
   * @param {Object} authUser - Authenticated user object (req.user)
   * @returns {Promise<void>}
   * @throws {ErrorResponse} If appointment is not found or user is not authorized
   */
  async deleteAppointment(id, authUser) {
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new ErrorResponse(`Appointment not found with id of ${id}`, 404);
    }

    // Only admin can delete appointments
    if (authUser.role !== 'admin') {
      throw new ErrorResponse(
        `User ${authUser.id} is not authorized to delete this appointment`,
        401
      );
    }

    await appointment.deleteOne();
  }
}

module.exports = new AppointmentService(); // Export an instance of the service
