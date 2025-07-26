// src/app/orders/[id]/page.js
// This component displays the detailed information for a single order.
// It fetches data from the backend using Redux Toolkit thunks.

'use client'; // This component uses client-side hooks

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation'; // For Next.js dynamic routes and navigation
import Image from 'next/image'; // For displaying medicine images within order items
// FIX: Changed clearOrderErrors to clearOrderError to match orderSlice export
import { fetchOrderById, clearOrderError, clearSingleOrder } from '../../../features/orders/orderSlice';
import { toast } from 'react-toastify'; // For notifications
import { Package, CalendarDays, DollarSign, Truck, User, MapPin, CreditCard, Mail } from 'lucide-react'; // Import icons (added Mail for user email)

// Get the backend API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
const BACKEND_HOST_URL = API_BASE_URL.replace('/api/v1', ''); // Extracts http://localhost:5000

function OrderDetailPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const params = useParams(); // Get route parameters (e.g., { id: 'orderId' })
    const orderId = params.id; // Extract the order ID from the URL

    // Get authentication and order states from Redux
    const { isAuthenticated, user } = useSelector((state) => state.auth); // Ensure 'user' is destructured here
    const { singleOrder: order, isLoading, error } = useSelector((state) => state.orders); // Use singleOrder as aliased to order

    useEffect(() => {
        // Redirect if not authenticated
        if (!isAuthenticated) {
            router.push('/auth/login');
            toast.info('Please log in to view order details.');
            return;
        }

        // --- DEBUGGING LOGS ---
        console.log("FRONTEND: OrderDetailPage - Currently authenticated user ID:", user?.id);
        console.log("FRONTEND: OrderDetailPage - Attempting to fetch order ID:", orderId);
        // --- END DEBUGGING LOGS ---

        if (orderId) {
            // Dispatch the thunk to fetch the specific order when component mounts or ID changes
            dispatch(fetchOrderById(orderId));
        }

        // Clear any previous errors or single order data when component mounts
        dispatch(clearOrderError()); // FIX: Use clearOrderError
        dispatch(clearSingleOrder()); // Clear previous order details

        // Cleanup function to clear errors and order data on unmount
        return () => {
            dispatch(clearOrderError()); // FIX: Use clearOrderError
            dispatch(clearSingleOrder());
        };
    }, [dispatch, orderId, isAuthenticated, router, user]); // Depend on dispatch, orderId, isAuthenticated, router, and user

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
                <p className="text-xl font-semibold dark:text-gray-300">Loading order details...</p>
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
                <p className="text-xl font-semibold">Error loading order: {error}</p>
            </div>
        );
    }

    // If order data is not available after loading, display a message
    if (!order) {
        return (
            <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
                <p className="text-xl font-semibold dark:text-gray-300">Order not found or no data available.</p>
            </div>
        );
    }

    // Helper function to get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'paid': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'; // Added processing
            case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'; // Added shipped
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
        }
    };

    return (
        <div className="min-h-[calc(100vh-120px)] flex flex-col items-center p-8
                     bg-gradient-to-br from-kashmir-light to-blue-100
                     dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors duration-300">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-200 mb-8
                     dark:bg-gray-700 dark:border-gray-600 dark:shadow-xl transition-colors duration-300">
                <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                       dark:text-kashmir-light transition-colors duration-300">
                    Order Details
                </h2>

                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="border-b pb-4 mb-4 border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-2xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light">
                                Order ID: <span className="font-normal text-gray-700 dark:text-gray-200">{order._id}</span>
                            </h3>
                            <span className={`px-4 py-1 rounded-full text-base font-medium ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                            </span>
                        </div>
                        <p className="flex items-center text-gray-700 dark:text-gray-200 text-lg">
                            <CalendarDays className="w-6 h-6 mr-3 text-kashmir-gold" />
                            Ordered On: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="flex items-center text-gray-700 dark:text-gray-200 text-lg">
                            <DollarSign className="w-6 h-6 mr-3 text-kashmir-gold" />
                            Total Price: <span className="font-bold ml-1">₹{order.totalPrice.toFixed(2)}</span>
                        </p>
                    </div>

                    {/* User Information */}
                    <div className="border-b pb-4 mb-4 border-gray-200 dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-3">Customer Information</h3>
                        <p className="flex items-center text-gray-700 dark:text-gray-200">
                            <User className="w-5 h-5 mr-2 text-kashmir-gold" />
                            Name: {order.user.name}
                        </p>
                        <p className="flex items-center text-gray-700 dark:text-gray-200">
                            <Mail className="w-5 h-5 mr-2 text-kashmir-gold" /> {/* Added Mail icon */}
                            Email: {order.user.email}
                        </p>
                    </div>

                    {/* Shipping Information */}
                    <div className="border-b pb-4 mb-4 border-gray-200 dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-3">Shipping Details</h3>
                        <p className="flex items-center text-gray-700 dark:text-gray-200">
                            <MapPin className="w-5 h-5 mr-2 text-kashmir-gold" />
                            Address: {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                        </p>
                        <p className="flex items-center text-gray-700 dark:text-gray-200">
                            <Truck className="w-5 h-5 mr-2 text-kashmir-gold" />
                            Delivery Status: <span className={`font-semibold ml-1 ${order.isDelivered ? 'text-green-600' : 'text-yellow-600'}`}>
                                {order.isDelivered ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}` : 'Pending Delivery'}
                            </span>
                        </p>
                    </div>

                    {/* Payment Information */}
                    <div className="border-b pb-4 mb-4 border-gray-200 dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-3">Payment Details</h3>
                        <p className="flex items-center text-gray-700 dark:text-gray-200">
                            <CreditCard className="w-5 h-5 mr-2 text-kashmir-gold" />
                            Method: <span className="font-semibold ml-1">{order.paymentMethod}</span>
                        </p>
                        <p className="flex items-center text-gray-700 dark:text-gray-200">
                            <DollarSign className="w-5 h-5 mr-2 text-kashmir-gold" />
                            Payment Status: <span className={`font-semibold ml-1 ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : 'Not Paid'}
                            </span>
                        </p>
                        {order.taxPrice > 0 && (
                            <p className="text-gray-700 dark:text-gray-200">Tax Price: ₹{order.taxPrice.toFixed(2)}</p>
                        )}
                        {order.shippingPrice > 0 && (
                            <p className="text-gray-700 dark:text-gray-200">Shipping Price: ₹{order.shippingPrice.toFixed(2)}</p>
                        )}
                        {order.paymentResult && order.isPaid && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                <p>Payment ID: {order.paymentResult.id}</p>
                                <p>Payment Status: {order.paymentResult.status}</p>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="text-xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-3">Ordered Items</h3>
                        <ul className="space-y-3">
                            {/* Assuming BACKEND_HOST_URL is defined in the scope where this code resides */}

                            {order.orderItems.map((item, idx) => {
                                // --- START Robust Image URL Handling ---
                                let imageUrlToDisplay = "https://placehold.co/50x50/E0F2F7/000000?text=No+Img"; // Default fallback

                                if (item.medicine && item.medicine.imageUrl) {
                                    if (typeof item.medicine.imageUrl === 'string' && item.medicine.imageUrl.trim() !== '') {
                                        // It's a non-empty string
                                        imageUrlToDisplay = item.medicine.imageUrl.includes('res.cloudinary.com') || item.medicine.imageUrl.includes('placehold.co')
                                            ? item.medicine.imageUrl
                                            : `${BACKEND_HOST_URL}${item.medicine.imageUrl}`;
                                    } else if (Array.isArray(item.medicine.imageUrl) && item.medicine.imageUrl.length > 0 && typeof item.medicine.imageUrl[0] === 'string' && item.medicine.imageUrl[0].trim() !== '') {
                                        // It's an array with a non-empty string as the first element
                                        imageUrlToDisplay = item.medicine.imageUrl[0].includes('res.cloudinary.com') || item.medicine.imageUrl[0].includes('placehold.co')
                                            ? item.medicine.imageUrl[0]
                                            : `${BACKEND_HOST_URL}${item.medicine.imageUrl[0]}`;
                                    }
                                }
                                // --- END Robust Image URL Handling ---

                                return (
                                    <li key={idx} className="flex items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-md shadow-sm">
                                        <Image
                                            src={imageUrlToDisplay} // Use the determined URL here
                                            alt={item.name || "Medicine Image"} // Provide a fallback for alt text too
                                            width={50}
                                            height={50}
                                            className="rounded-md mr-3 object-cover"
                                        />
                                        <div className="flex-grow">
                                            <p className="text-lg font-medium text-gray-800 dark:text-gray-100">{item.name}</p>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                                {item.quantity} x ₹{item.price.toFixed(2)} = ₹{(item.quantity * item.price).toFixed(2)}
                                            </p>
                                        </div>
                                        <span className="text-xl font-bold text-kashmir-green dark:text-kashmir-gold">
                                            ₹{(item.quantity * item.price).toFixed(2)}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Back Button */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => router.push('/orders')}
                            className="py-3 px-8 bg-kashmir-green text-kashmir-light rounded-md font-semibold text-lg
                          hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                          dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailPage;
