// src/controllers/orderController.js
// This file contains controller functions for managing orders.
// It now uses the OrderService to abstract business logic.

const orderService = require('../services/orderService'); // Import the OrderService
const ErrorResponse = require('../utils/errorHandler'); // Custom error handler utility
// APIFeatures is now used within the service, so it's not directly needed here
// const APIFeatures = require('../utils/apiFeatures');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private (Authenticated users only)
exports.createOrder = async (req, res, next) => {
  console.log("BACKEND: orderController - Creating order for user ID:", req.user.id);
  try {
    // Delegate to OrderService, passing request body and user ID
    const order = await orderService.createOrder(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private (Users can see their own, Admin can see all)
exports.getOrders = async (req, res, next) => {
  try {
    // Delegate to OrderService, passing query parameters and authenticated user
    const { count, data } = await orderService.getOrders(req.query, req.user);

    res.status(200).json({
      success: true,
      count: count,
      data: data,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order by ID
// @route   GET /api/v1/orders/:id
// @access  Private (User can see their own, Admin can see any)
exports.getOrder = async (req, res, next) => {
  try {
    // Delegate to OrderService, passing ID and authenticated user
    const order = await orderService.getOrder(req.params.id, req.user);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Private (Admin only, or payment gateway callback)
exports.updateOrderToPaid = async (req, res, next) => {
  try {
    // Delegate to OrderService, passing ID, payment result data, and authenticated user
    const updatedOrder = await orderService.updateOrderToPaid(req.params.id, req.body, req.user);

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order to delivered
// @route   PUT /api/v1/orders/:id/deliver
// @access  Private (Admin only)
exports.updateOrderToDelivered = async (req, res, next) => {
  try {
    // Delegate to OrderService, passing ID and authenticated user
    const updatedOrder = await orderService.updateOrderToDelivered(req.params.id, req.user);

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status (e.g., processing, shipped, cancelled)
// @route   PUT /api/v1/orders/:id/status
// @access  Private (Admin or User to cancel)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    // Delegate to OrderService, passing ID, new status, and authenticated user
    const updatedOrder = await orderService.updateOrderStatus(req.params.id, req.body.orderStatus, req.user);

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Delete order
// @route   DELETE /api/v1/orders/:id
// @access  Private (Admin only)
exports.deleteOrder = async (req, res, next) => {
  try {
    // Delegate to OrderService, passing ID and authenticated user
    await orderService.deleteOrder(req.params.id, req.user);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
