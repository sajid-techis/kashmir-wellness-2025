// src/app/orders/page.js
// This component displays a list of all orders for the authenticated user.
// It fetches data from the backend using Redux Toolkit thunks.

'use client'; // This component uses client-side hooks

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import Image from 'next/image'; // For displaying medicine images within order items
import { fetchOrders, clearOrderError } from '../../features/orders/orderSlice'; // Import the fetchOrders thunk
import { toast } from 'react-toastify'; // For notifications
import { Package, CalendarDays, DollarSign, Truck } from 'lucide-react'; // Import icons

// Get the backend API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
const BACKEND_HOST_URL = API_BASE_URL.replace('/api/v1', ''); // Extracts http://localhost:5000

function OrderListPage() {
    const dispatch = useDispatch();
    const router = useRouter(); // Initialize useRouter

    // Get authentication and order states from Redux
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { orders, isLoading, error } = useSelector((state) => state.orders);

    useEffect(() => {
        // Redirect if not authenticated
        if (!isAuthenticated) {
            router.push('/auth/login');
            toast.info('Please log in to view your orders.');
            return;
        }

        // Dispatch the thunk to fetch orders when the component mounts
        dispatch(fetchOrders());

        // Clear any previous errors when component mounts
        dispatch(clearOrderError());

        // Cleanup function to clear errors on unmount
        return () => {
            dispatch(clearOrderError());
        };
    }, [dispatch, isAuthenticated, router]); // Depend on dispatch, isAuthenticated, and router

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
                <p className="text-xl font-semibold dark:text-gray-300">Loading your orders...</p>
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
                <p className="text-xl font-semibold">Error loading orders: {error}</p>
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
                    My Orders
                </h2>

                {orders.length === 0 ? (
                    <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
                        You haven't placed any orders yet.
                    </p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-gray-50 rounded-lg shadow-md p-6
                           dark:bg-gray-800 dark:shadow-lg transition-colors duration-300"
                            >
                                <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-200 dark:border-gray-600">
                                    <h3 className="text-xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light">
                                        Order ID: <span className="font-normal text-gray-700 dark:text-gray-200">{order._id.substring(0, 8)}...</span>
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                                    ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                            order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-200 text-base mb-4">
                                    <p className="flex items-center">
                                        <CalendarDays className="w-5 h-5 mr-2 text-kashmir-gold" />
                                        Ordered On: {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="flex items-center">
                                        <DollarSign className="w-5 h-5 mr-2 text-kashmir-gold" />
                                        Total: ₹{order.totalPrice.toFixed(2)}
                                    </p>
                                    <p className="flex items-center col-span-1 md:col-span-2">
                                        <Truck className="w-5 h-5 mr-2 text-kashmir-gold" />
                                        Shipping Address: {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-lg font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-2">Order Items:</h4>
                                    <ul className="space-y-2">
                                         {order.orderItems.map((item, idx) => (
                                        <li key={idx} className="flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded-md">
                                            {item.medicine && item.medicine.imageUrl && item.medicine.imageUrl.length > 0 && typeof item.medicine.imageUrl[0] === 'string' ? (
                                                <Image
                                                    src={
                                                        item.medicine.imageUrl[0].includes('res.cloudinary.com') || item.medicine.imageUrl[0].includes('placehold.co')
                                                            ? item.medicine.imageUrl[0]
                                                            : `${BACKEND_HOST_URL}${item.medicine.imageUrl[0]}`
                                                    }
                                                    alt={item.name}
                                                    width={50}
                                                    height={50}
                                                    className="rounded-md mr-3 object-cover"
                                                />
                                            ) : (
                                                <Image
                                                    src="https://placehold.co/50x50/E0F2F7/000000?text=Med" // Fallback
                                                    alt="Medicine Placeholder"
                                                    width={50}
                                                    height={50}
                                                    className="rounded-md mr-3 object-cover"
                                                />
                                            )}
                                            <span className="text-gray-800 dark:text-gray-100">{item.name}</span>
                                            <span className="ml-auto text-gray-600 dark:text-gray-300">
                                                {item.quantity} x ₹{item.price.toFixed(2)}
                                            </span>
                                        </li>
                                    ))}
                                    </ul>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => router.push(`/orders/${order._id}`)} // Navigate to order detail page
                                    className="w-full py-2 px-4 bg-kashmir-green text-kashmir-light rounded-md font-semibold
                             hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                             dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
                                >
                                    View Order Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderListPage;
