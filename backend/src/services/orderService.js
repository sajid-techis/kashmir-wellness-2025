// src/services/orderService.js
// This file contains business logic related to order operations.
// It abstracts database interactions and other complex logic away from the controllers.

const Order = require('../models/Order');     // Import the Order model
const Medicine = require('../models/Medicine'); // Import Medicine model to update stock
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility
const APIFeatures = require('../utils/apiFeatures'); // Import the APIFeatures utility
const mongoose = require('mongoose'); // NEW: Import mongoose to work with ObjectId

class OrderService {
  /**
   * @desc Create a new order
   * @param {Object} orderData - Data for the new order
   * @param {string} userId - ID of the user creating the order
   * @returns {Promise<Object>} The newly created order object
   * @throws {ErrorResponse} If no order items, medicine not found, or not enough stock
   */
  async createOrder(orderData, userId) {
    const { orderItems, shippingAddress, paymentMethod, taxPrice, shippingPrice, totalPrice } = orderData;

    if (!orderItems || orderItems.length === 0) {
      throw new ErrorResponse('No order items', 400);
    }

    // Validate and update medicine stock
    for (const item of orderItems) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        throw new ErrorResponse(`Medicine not found: ${item.name}`, 404);
      }
      if (medicine.stock < item.quantity) {
        throw new ErrorResponse(`Not enough stock for ${item.name}. Available: ${medicine.stock}`, 400);
      }
      // Decrease stock
      medicine.stock -= item.quantity;
      await medicine.save();
    }

    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
    });
    return order;
  }

  /**
   * @desc Get all orders with optional filtering, sorting, and pagination, based on user role
   * @param {Object} queryParams - Query parameters from the request (req.query)
   * @param {Object} authUser - Authenticated user object (req.user)
   * @returns {Promise<Object>} An object containing count and an array of orders
   * @throws {ErrorResponse} If user role is not authorized to view orders
   */
  async getOrders(queryParams, authUser) {
    let query;

    if (authUser.role === 'user') {
      query = Order.find({ user: authUser.id });
    } else if (authUser.role === 'admin') {
      query = Order.find();
    } else {
      throw new ErrorResponse(`User role ${authUser.role} is not authorized to view orders`, 403);
    }

    // Apply APIFeatures to the query
    const features = new APIFeatures(query, queryParams)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute the query and populate user details and medicine details for order items
    const orders = await features.query
      .populate({
        path: 'user',
        select: 'name email',
      })
      .populate({
        path: 'orderItems.medicine',
        select: 'name price imageUrl',
      });

    return { count: orders.length, data: orders };
  }

  /**
   * @desc Get a single order by ID, with role-based access
   * @param {string} id - The ID of the order to retrieve
   * @param {Object} authUser - Authenticated user object (req.user)
   * @returns {Promise<Object>} The order object
   * @throws {ErrorResponse} If order is not found or user is not authorized
   */
  async getOrder(id, authUser) {
    const order = await Order.findById(id)
      .populate({
        path: 'user',
        select: 'name email',
      })
      .populate({
        path: 'orderItems.medicine',
        select: 'name price imageUrl',
      });

    if (!order) {
      throw new ErrorResponse(`Order not found with id of ${id}`, 404);
    }

    // --- START DEBUGGING LOGS ---
    console.log('--- OrderService.getOrder Debug ---');
    console.log('Authenticated User ID (authUser.id):', authUser.id);
    console.log('Authenticated User Role (authUser.role):', authUser.role);
    console.log('Order ID being viewed (id):', id);
    console.log('Order User (order.user):', order.user); // This will be the populated user object
    console.log('Order User ID (order.user._id):', order.user._id); // Access the _id from the populated object

    // Detailed comparison logs
    const orderUserIdString = order.user._id.toString();
    const authUserIdString = authUser.id;

    console.log('orderUserIdString:', orderUserIdString, 'Type:', typeof orderUserIdString, 'Length:', orderUserIdString.length);
    console.log('authUserIdString:', authUserIdString, 'Type:', typeof authUserIdString, 'Length:', authUserIdString.length);

    // Use JSON.stringify to reveal potential hidden characters
    console.log('orderUserIdString (JSON.stringify):', JSON.stringify(orderUserIdString));
    console.log('authUserIdString (JSON.stringify):', JSON.stringify(authUserIdString));

    // Perform comparison using Mongoose.Types.ObjectId for robustness
    const isOwner = order.user._id.equals(new mongoose.Types.ObjectId(authUserIdString));
    const isAdmin = authUser.role === 'admin';

    console.log('Comparison (order.user._id.equals(new ObjectId(authUser.id))):', isOwner);
    console.log('Is Admin:', isAdmin);
    console.log('Full Condition (NOT isOwner AND NOT isAdmin):', !isOwner && !isAdmin);
    console.log('--- End OrderService.getOrder Debug ---');
    // --- END DEBUGGING LOGS ---

    // Ensure user is the owner of the order or an admin
    // FIX: Using .equals() for ObjectId comparison for robustness
    if (!isOwner && !isAdmin) {
      throw new ErrorResponse(
        `User ${authUser.id} is not authorized to view this order`,
        401
      );
    }
    return order;
  }

  /**
   * @desc Update order to paid
   * @param {string} id - The ID of the order to update
   * @param {Object} paymentResultData - Payment gateway response data
   * @param {Object} authUser - Authenticated user object (req.user)
   * @returns {Promise<Object>} The updated order object
   * @throws {ErrorResponse} If order not found, already paid, or not authorized
   */
  async updateOrderToPaid(id, paymentResultData, authUser) {
    const order = await Order.findById(id);

    if (!order) {
      throw new ErrorResponse('Order not found', 404);
    }

    if (order.isPaid) {
      throw new ErrorResponse('Order is already paid', 400);
    }

    // Only Admin can mark as paid directly, or this route would be hit by a payment gateway webhook
    if (authUser.role !== 'admin') {
      throw new ErrorResponse('Not authorized to mark order as paid', 403);
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = paymentResultData;

    const updatedOrder = await order.save();
    return updatedOrder;
  }

  /**
   * @desc Update order to delivered
   * @param {string} id - The ID of the order to update
   * @param {Object} authUser - Authenticated user object (req.user)
   * @returns {Promise<Object>} The updated order object
   * @throws {ErrorResponse} If order not found, already delivered, or not authorized
   */
  async updateOrderToDelivered(id, authUser) {
    const order = await Order.findById(id);

    if (!order) {
      throw new ErrorResponse('Order not found', 404);
    }

    if (order.isDelivered) {
      throw new ErrorResponse('Order is already delivered', 400);
    }

    // Only Admin can mark as delivered
    if (authUser.role !== 'admin') {
      throw new ErrorResponse('Not authorized to mark order as delivered', 403);
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.orderStatus = 'delivered'; // Update overall status

    const updatedOrder = await order.save();
    return updatedOrder;
  }

  /**
   * @desc Update order status (e.g., processing, shipped, cancelled)
   * @param {string} id - The ID of the order to update
   * @param {string} newStatus - The new status for the order
   * @param {Object} authUser - Authenticated user object (req.user)
   * @returns {Promise<Object>} The updated order object
   * @throws {ErrorResponse} If order not found or not authorized
   */
  async updateOrderStatus(id, newStatus, authUser) {
    const order = await Order.findById(id);

    if (!order) {
      throw new ErrorResponse('Order not found', 404);
    }

    // Admin can update to any status
    if (authUser.role === 'admin') {
      order.orderStatus = newStatus;
    }
    // User can only cancel their own order
    else if (order.user.toString() === authUser.id && newStatus === 'cancelled') { // Removed authUser.role === 'user' check here as it's already handled by the outer if/else if
      order.orderStatus = 'cancelled';
    } else {
      throw new ErrorResponse('Not authorized to update this order status', 403);
    }

    const updatedOrder = await order.save();
    return updatedOrder;
  }

  /**
   * @desc Delete an order
   * @param {string} id - The ID of the order to delete
   * @param {Object} authUser - Authenticated user object (req.user)
   * @returns {Promise<void>}
   * @throws {ErrorResponse} If order is not found or user is not authorized
   */
  async deleteOrder(id, authUser) {
    const order = await Order.findById(id);

    if (!order) {
      throw new ErrorResponse(`Order not found with id of ${id}`, 404);
    }

    // Only admin can delete orders
    if (authUser.role !== 'admin') {
      throw new ErrorResponse(
        `User ${authUser.id} is not authorized to delete this order`,
        401
      );
    }

    await order.deleteOne();
  }
}

module.exports = new OrderService(); // Export an instance of the service
