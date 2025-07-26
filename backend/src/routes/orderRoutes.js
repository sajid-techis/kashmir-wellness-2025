// src/routes/orderRoutes.js
// This file defines the API routes for order management (CRUD operations).
// It utilizes the authentication and authorization middleware to protect certain routes.

const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController'); // Import controller functions

const { protect, authorize } = require('../middlewares/authMiddleware'); // Import authentication middleware

const router = express.Router(); // Create a new router instance

// All order routes require authentication
router.use(protect);

// Routes for creating a new order and getting all orders
// createOrder: Any authenticated user can create an order.
// getOrders: Users can see their own, Admins can see all.
router.route('/').post(createOrder).get(getOrders);

// Routes for specific order by ID
// getOrder: User can see their own, Admin can see any.
// deleteOrder: Only Admin can delete.
router.route('/:id').get(getOrder).delete(authorize('admin'), deleteOrder);

// Routes for updating order status (paid, delivered, general status)
// updateOrderToPaid: Admin only (or payment gateway callback).
// updateOrderToDelivered: Admin only.
// updateOrderStatus: Admin can update any, User can cancel their own.
router.route('/:id/pay').put(authorize('admin'), updateOrderToPaid);
router.route('/:id/deliver').put(authorize('admin'), updateOrderToDelivered);
router.route('/:id/status').put(updateOrderStatus); // Authorization handled within controller based on role

module.exports = router;
