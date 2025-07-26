// src/app/checkout/page.js
// This component handles the checkout process, displaying cart items,
// collecting shipping information, payment method, and placing the order.

'use client'; // This component uses client-side hooks

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { MapPin, Building, Mail, Phone, CreditCard, Truck, Package } from 'lucide-react'; // Icons for form fields

// NEW: Import createOrder thunk and other order-related states
import { createOrder, clearOrderError, clearOrderSuccess } from '../../features/orders/orderSlice';
import { clearCart } from '../../features/cart/cartSlice'; // To clear cart after successful order

// Get the backend API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
const BACKEND_HOST_URL = API_BASE_URL.replace('/api/v1', ''); // Extracts http://localhost:5000

function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { cartItems } = useSelector((state) => state.cart);
  const { isAuthenticated, isHydrated, user } = useSelector((state) => state.auth);
  // NEW: Get order creation state from orderSlice
  const { isLoading: orderLoading, error: orderError, success: orderSuccess, singleOrder } = useSelector((state) => state.orders);

  // State for shipping information
  const [address, setAddress] = useState(user?.address || ''); // Pre-fill if user has address
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India'); // Default country
  const [paymentMethod, setPaymentMethod] = useState('COD'); // Default to Cash on Delivery

  // Local state for order placement (now primarily driven by Redux orderLoading/orderError)
  const [placeOrderLocalError, setPlaceOrderLocalError] = useState(null); // For validation errors before dispatch

  // Calculate subtotal
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);

  // Define static shipping and tax prices for now
  const shippingPrice = itemsPrice > 500 ? 0 : 40; // Free shipping over ₹500
  const taxPrice = itemsPrice * 0.18; // 18% tax

  // Calculate total price
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  useEffect(() => {
    // Clear order errors and success messages on component mount/unmount
    dispatch(clearOrderError());
    dispatch(clearOrderSuccess());
    setPlaceOrderLocalError(null);

    // Redirect if not authenticated or cart is empty
    if (!isAuthenticated && isHydrated) { // Check isHydrated to avoid redirecting during initial load
      toast.info('Please log in to proceed to checkout.');
      router.push('/auth/login');
      return;
    }
    if (isHydrated && cartItems.length === 0) {
      toast.info('Your cart is empty. Please add items before checking out.');
      router.push('/medicines'); // Redirect to medicines if cart is empty
      return;
    }
    // Pre-fill address if user data is available and hydrated
    if (isHydrated && user && user.address && !address) {
      setAddress(user.address);
    }
  }, [isAuthenticated, isHydrated, cartItems, router, user, address, dispatch]);

  // Effect to handle successful order placement
  useEffect(() => {
    if (orderSuccess && singleOrder) {
      toast.success('Order placed successfully!');
      dispatch(clearCart()); // Clear cart after successful order
      dispatch(clearOrderSuccess()); // Clear success flag
      router.push(`/orders/${singleOrder._id}`); // Redirect to order detail page
    }
    if (orderError) {
      toast.error(orderError); // Display error from Redux
      dispatch(clearOrderError()); // Clear error flag
    }
  }, [orderSuccess, orderError, singleOrder, dispatch, router]);


  // Handle order placement
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlaceOrderLocalError(null); // Clear local validation errors

    if (cartItems.length === 0) {
      setPlaceOrderLocalError('Your cart is empty!');
      toast.error('Your cart is empty!');
      return;
    }

    if (!address || !city || !postalCode || !country) {
      setPlaceOrderLocalError('Please fill in all shipping information.');
      toast.error('Please fill in all shipping information.');
      return;
    }

    const orderData = {
      orderItems: cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        medicine: item.medicine, // Medicine ID
      })),
      shippingAddress: {
        address,
        city,
        postalCode,
        country,
      },
      paymentMethod,
      itemsPrice: parseFloat(itemsPrice.toFixed(2)), // Ensure numbers are passed correctly
      shippingPrice: parseFloat(shippingPrice.toFixed(2)),
      taxPrice: parseFloat(taxPrice.toFixed(2)),
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    };

    // Dispatch the actual createOrder thunk
    dispatch(createOrder(orderData));
  };

  // Show loading state until hydration is complete
  if (!isHydrated) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Loading checkout...</p>
      </div>
    );
  }

  // If cart is empty after hydration, show message
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-8
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-4">
          Your cart is empty. Nothing to checkout!
        </p>
        <button
          onClick={() => router.push('/medicines')}
          className="py-2 px-4 bg-kashmir-green text-kashmir-light rounded-md font-semibold
                     hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                     dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
        >
          Browse Medicines
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center p-8
                     bg-gradient-to-br from-kashmir-light to-blue-100
                     dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-5xl border border-gray-200 mb-8
                     dark:bg-gray-700 dark:border-gray-600 dark:shadow-xl transition-colors duration-300">
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                       dark:text-kashmir-light transition-colors duration-300">
          Checkout
        </h2>

        {(placeOrderLocalError || orderError) && ( // Display local or Redux errors
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6
                         dark:bg-red-900 dark:border-red-700 dark:text-red-200">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{placeOrderLocalError || orderError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-2 p-6 bg-gray-50 rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="text-2xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-6">
              Shipping Information
            </h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  <MapPin className="inline-block w-4 h-4 mr-1 text-kashmir-gold" /> Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-kashmir-green focus:border-kashmir-green dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    <Building className="inline-block w-4 h-4 mr-1 text-kashmir-gold" /> City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-kashmir-green focus:border-kashmir-green dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    <Mail className="inline-block w-4 h-4 mr-1 text-kashmir-gold" /> Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-kashmir-green focus:border-kashmir-green dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  <Phone className="inline-block w-4 h-4 mr-1 text-kashmir-gold" /> Country
                </label>
                <input
                  type="text"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-kashmir-green focus:border-kashmir-green dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                  required
                />
              </div>
            </form>

            {/* Payment Method */}
            <h3 className="text-2xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mt-8 mb-6">
              Payment Method
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-kashmir-green focus:ring-kashmir-green border-gray-300 dark:border-gray-500 dark:bg-gray-600"
                />
                <label htmlFor="cod" className="ml-3 block text-base font-medium text-gray-700 dark:text-gray-200">
                  <CreditCard className="inline-block w-5 h-5 mr-1 text-kashmir-gold" /> Cash on Delivery (COD)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="card"
                  name="paymentMethod"
                  value="Card"
                  checked={paymentMethod === 'Card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-kashmir-green focus:ring-kashmir-green border-gray-300 dark:border-gray-500 dark:bg-gray-600"
                  disabled // Disable for now, as payment gateway integration is not yet done
                />
                <label htmlFor="card" className="ml-3 block text-base font-medium text-gray-700 dark:text-gray-200 opacity-50 cursor-not-allowed">
                  <CreditCard className="inline-block w-5 h-5 mr-1 text-kashmir-gold" /> Card Payment (Coming Soon)
                </label>
              </div>
              {/* Add more payment options as needed */}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 p-6 bg-gray-50 rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="text-2xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-6">
              Order Summary
            </h3>
            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2"> {/* Added max-height and overflow for scroll */}
              {cartItems.map((item) => (
                <div key={item.medicine} className="flex items-center space-x-3 border-b border-gray-200 dark:border-gray-600 pb-3">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800 dark:text-gray-100">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.quantity} x ₹{item.price.toFixed(2)}</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-50">₹{(item.quantity * item.price).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-lg text-gray-700 dark:text-gray-200 border-t pt-4 border-gray-200 dark:border-gray-600">
              <div className="flex justify-between">
                <span>Items Price:</span>
                <span className="font-bold">₹{itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-bold">₹{shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%):</span>
                <span className="font-bold">₹{taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-kashmir-dark-blue dark:text-kashmir-light pt-2 border-t border-gray-300 dark:border-gray-500">
                <span>Total:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={orderLoading || cartItems.length === 0} // Use orderLoading from Redux
              className={`w-full py-3 px-4 mt-6 rounded-md font-semibold text-lg
                         ${orderLoading || cartItems.length === 0
                           ? 'bg-gray-400 cursor-not-allowed'
                           : 'bg-kashmir-green text-kashmir-light hover:bg-kashmir-gold hover:text-kashmir-dark-blue dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light'}
                         transition duration-300`}
            >
              {orderLoading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
