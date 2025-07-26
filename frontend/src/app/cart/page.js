// src/app/cart/page.js
// This component displays the user's shopping cart, allowing them to view,
// adjust quantities, and remove items.
// Fix: Corrected image URL handling for next/image and applied global hydration fix.
// IMPROVEMENT: Enhanced mobile responsiveness for cart item layout.

'use client'; // This component uses client-side hooks

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'; // For navigation
import Image from 'next/image'; // For displaying medicine images
import { removeFromCart, updateCartItemQuantity, initializeCart } from '../../features/cart/cartSlice'; // Import cart actions
import { toast } from 'react-toastify'; // For notifications
import { Trash2, MinusCircle, PlusCircle } from 'lucide-react'; // Import icons

// Get the backend API base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
const BACKEND_HOST_URL = API_BASE_URL.replace('/api/v1', ''); // Extracts http://localhost:5000

function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  // Get cart items from Redux store
  const { cartItems } = useSelector((state) => state.cart);
  const { isAuthenticated, isHydrated } = useSelector((state) => state.auth); // Get global hydration status

  // Calculate subtotal - this will re-calculate when cartItems update
  const subtotal = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);

  useEffect(() => {
    // Optional: Redirect if not authenticated, or allow guest checkout later
    // For now, we'll just let anyone view the cart, but checkout would require login.
  }, [isAuthenticated, router]);

  // Handle removing an item from the cart
  const handleRemoveFromCart = (medicineId, medicineName) => {
    dispatch(removeFromCart(medicineId));
    toast.info(`${medicineName} removed from cart.`);
  };

  // Handle quantity change for an item
  const handleQuantityChange = (medicineId, newQuantity, stock) => {
    if (newQuantity < 1) {
      toast.error('Quantity cannot be less than 1.');
      return;
    }
    if (newQuantity > stock) {
      toast.error(`Cannot add more than available stock (${stock}).`);
      return;
    }
    dispatch(updateCartItemQuantity({ medicineId, quantity: newQuantity }));
  };

  // Handle proceeding to checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    if (!isAuthenticated) {
      toast.info('Please log in to proceed to checkout.');
      router.push('/auth/login'); // Redirect to login if not authenticated
      return;
    }
    // Navigate to checkout page (to be created next)
    router.push('/checkout');
  };

  // Conditionally render cart content only after global hydration is complete
  if (!isHydrated) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Loading cart...</p>
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
          Your Shopping Cart
        </h2>

        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
            Your cart is empty. Start adding some medicines!
            <br />
            <button
              onClick={() => router.push('/medicines')}
              className="mt-4 py-2 px-4 bg-kashmir-green text-kashmir-light rounded-md font-semibold
                          hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                          dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
            >
              Browse Medicines
            </button>
          </p>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cart Items List */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => {
                  // --- START Robust Image URL Handling ---
                  let imageUrlToDisplay = "https://placehold.co/50x50/E0F2F7/000000?text=No+Img"; // Default fallback

                  if (item.imageUrl) {
                      if (typeof item.imageUrl === 'string' && item.imageUrl.trim() !== '') {
                          // It's a non-empty string, use it directly (assuming it's absolute or correctly relative)
                          // For absolute URLs like Cloudinary, no prepending is needed.
                          // For relative paths like '/uploads/image.jpg', BACKEND_HOST_URL is needed.
                          // This logic covers both cases based on content.
                          imageUrlToDisplay = item.imageUrl.includes('res.cloudinary.com') || item.imageUrl.includes('placehold.co')
                              ? item.imageUrl
                              : `${BACKEND_HOST_URL}${item.imageUrl}`;
                      } else if (Array.isArray(item.imageUrl) && item.imageUrl.length > 0 && typeof item.imageUrl[0] === 'string' && item.imageUrl[0].trim() !== '') {
                          // It's an array with a non-empty string as the first element
                          // Apply the same logic as above for Cloudinary/placeholder/relative paths
                          imageUrlToDisplay = item.imageUrl[0].includes('res.cloudinary.com') || item.imageUrl[0].includes('placehold.co')
                              ? item.imageUrl[0]
                              : `${BACKEND_HOST_URL}${item.imageUrl[0]}`;
                      }
                  }
                  // --- END Robust Image URL Handling ---

                  return (
                    <div
                      key={item.medicine} // Use medicine ID as key
                      className="flex flex-col sm:flex-row items-start sm:items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-sm"
                    >
                      {/* Item Image */}
                      <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 mb-4 sm:mb-0">
                        <Image
                          src={imageUrlToDisplay} // Use the determined URL here
                          alt={item.name}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="ml-0 sm:ml-4 flex-grow w-full sm:w-auto">
                        <h3 className="text-lg font-semibold text-kashmir-dark-blue dark:text-kashmir-light">
                          {item.name}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-200">₹{item.price.toFixed(2)}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">In Stock: {item.stock}</p>
                      </div>

                      {/* Wrapper for Quantity Controls and Remove Button */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center mt-4 sm:mt-0 ml-0 sm:ml-auto w-full sm:w-auto">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                          <button
                            onClick={() => handleQuantityChange(item.medicine, item.quantity - 1, item.stock)}
                            className="text-kashmir-green hover:text-kashmir-gold dark:text-kashmir-gold dark:hover:text-kashmir-green"
                            disabled={item.quantity <= 1}
                          >
                            <MinusCircle className="w-6 h-6" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.medicine, parseInt(e.target.value) || 1, item.stock)}
                            className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md
                                       bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                            min="1"
                            max={item.stock}
                          />
                          <button
                            onClick={() => handleQuantityChange(item.medicine, item.quantity + 1, item.stock)}
                            className="text-kashmir-green hover:text-kashmir-gold dark:text-kashmir-gold dark:hover:text-kashmir-green"
                            disabled={item.quantity >= item.stock}
                          >
                            <PlusCircle className="w-6 h-6" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveFromCart(item.medicine, item.name)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600 ml-0 sm:ml-4"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  ); // End of return for map
              })}
            </div>

            {/* Cart Summary */}
            <div className="w-full md:w-1/3 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-4">Cart Summary</h3>
                <div className="flex justify-between text-lg text-gray-700 dark:text-gray-200 mb-2">
                  <span>Subtotal:</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                {/* Shipping and Tax will be calculated at checkout */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Shipping and taxes calculated at checkout.</p>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-3 px-4 bg-kashmir-green text-kashmir-light rounded-md font-semibold text-lg
                            hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                            dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;