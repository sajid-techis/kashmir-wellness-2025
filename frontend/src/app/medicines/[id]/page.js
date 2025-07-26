// src/app/medicines/[id]/page.js

'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchMedicineById, clearMedicineErrors, clearSingleMedicine } from '../../../features/medicines/medicineSlice';
import { addToCart, updateCartItemQuantity } from '../../../features/cart/cartSlice';
import { toast } from 'react-toastify';
import { MinusCircle, PlusCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
const BACKEND_HOST_URL = API_BASE_URL.replace('/api/v1', '');

function MedicineDetailPage() {
  const dispatch = useDispatch();
  const params = useParams();
  const router = useRouter();
  const medicineId = params.id;

  const { medicine, isLoading, error } = useSelector((state) => state.medicines);
  const { cartItems } = useSelector((state) => state.cart);
  const { isHydrated } = useSelector((state) => state.auth);

  // State for the currently displayed main image
  const [mainImage, setMainImage] = useState('');
  // State for processed image URLs (now strictly an array, even if only one URL)
  // This helps simplify the thumbnail logic later
  const [processedImageUrls, setProcessedImageUrls] = useState([]);
  const [quantityToAdd, setQuantityToAdd] = useState(1);

  const itemInCart = isHydrated ? cartItems.find(item => item.medicine === medicineId) : null; // Ensure accurate only after hydration
  const currentCartQuantity = itemInCart ? itemInCart.quantity : 0;

  useEffect(() => {
    if (medicineId) {
      dispatch(fetchMedicineById(medicineId));
    }

    // Keep these cleanup functions for when the component unmounts
    return () => {
      dispatch(clearMedicineErrors());
      dispatch(clearSingleMedicine());
    };
  }, [dispatch, medicineId]);

  // Effect to process image URLs and set the main image once medicine data is loaded
  useEffect(() => {
    if (medicine && medicine.imageUrl) {
      let urls = [];
      // --- FIX START: Adapt for medicine.imageUrl being a string or potentially an array ---
      if (typeof medicine.imageUrl === 'string' && medicine.imageUrl.length > 0) {
        urls = [medicine.imageUrl]; // Wrap the single URL string in an array
      } else if (Array.isArray(medicine.imageUrl)) {
        urls = medicine.imageUrl; // If it's already an array, use it directly
      }
      // --- FIX END ---

      setProcessedImageUrls(urls);

      if (urls.length > 0) {
        setMainImage(urls[0]); // Now urls[0] will correctly be the full URL string
      } else {
        // Fallback for no image URL at all
        setMainImage('https://placehold.co/800x600/E0F2F7/000000?text=Medicine');
      }
    } else {
      // If medicine data or imageUrl is missing
      setProcessedImageUrls([]);
      setMainImage('https://placehold.co/800x600/E0F2F7/000000?text=Medicine');
    }
  }, [medicine]); // Depend on medicine object to re-run when data loads/changes

  const handleAddToCart = () => {
    console.log('Add to cart button clicked!');

    if (!medicine) {
      toast.error('Cannot add to cart: Medicine data not loaded.');
      return;
    }
    if (quantityToAdd <= 0) {
      toast.error('Quantity must be at least 1.');
      return;
    }
    if (quantityToAdd > medicine.stock) {
      toast.error(`Not enough stock. Only ${medicine.stock} available.`);
      return;
    }

    dispatch(addToCart({
      medicine: medicine._id,
      name: medicine.name,
      price: medicine.price,
      // --- FIX START: Correctly pass imageUrl (which is a string) ---
      imageUrl: medicine.imageUrl || 'https://placehold.co/50x50/E0F2F7/000000?text=Med', // Use medicine.imageUrl directly
      // --- FIX END ---
      quantity: quantityToAdd,
      stock: medicine.stock
    }));
    toast.success(`${quantityToAdd} x ${medicine.name} added to cart!`);
  };

  const handleQuantityChange = (newQuantity) => {
    if (!medicine) return;

    if (newQuantity < 1) {
      // You might want a confirmation modal here before truly removing
      dispatch(updateCartItemQuantity({ medicineId, quantity: 0 })); // Set to 0 to remove from cart
      toast.info(`Removed ${medicine.name} from cart.`);
      return;
    }
    if (newQuantity > medicine.stock) {
      toast.error(`Cannot add more than available stock (${medicine.stock}).`);
      return;
    }
    dispatch(updateCartItemQuantity({ medicineId, quantity: newQuantity }));
    toast.success(`Quantity for ${medicine.name} updated to ${newQuantity}.`);
  };

  // --- Render Loading/Error/Not Found States (no changes needed here) ---
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Loading medicine details...</p>
      </div>
    );
  }

  if (error) {
    toast.error(error);
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-red-400">
        <p className="text-xl font-semibold">Error loading medicine: {error}</p>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Medicine not found or no data available.</p>
      </div>
    );
  }

  if (!isHydrated) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center
                      bg-gradient-to-br from-kashmir-light to-blue-100
                      dark:from-gray-800 dark:to-gray-900 dark:text-gray-100">
        <p className="text-xl font-semibold dark:text-gray-300">Loading product details...</p>
      </div>
    );
  }

  // --- Main Render Block ---
  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col items-center p-8
                    bg-gradient-to-br from-kashmir-light to-blue-100
                    dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-5xl border border-gray-200 mb-8
                      dark:bg-gray-700 dark:border-gray-600 dark:shadow-xl transition-colors duration-300">
        <h2 className="text-4xl font-bold text-center text-kashmir-dark-blue mb-8
                        dark:text-kashmir-light transition-colors duration-300">
          {medicine.name}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="flex flex-col items-center">
            {/* Main Image Display */}
            <div className="relative w-full h-96 mb-4 rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600">
              {/* --- FIX START: Correct Main Image src logic --- */}
              {mainImage && ( // Ensure mainImage is not empty
                <Image
                  // If mainImage is a placeholder, use it directly.
                  // Otherwise, if it's a Cloudinary URL, use it directly.
                  // Avoid prepending BACKEND_HOST_URL unless the URL is relative to your backend.
                  // Your Cloudinary URL is absolute, so use it as is.
                  src={mainImage.includes('placehold.co') || mainImage.includes('res.cloudinary.com') ? mainImage : `${BACKEND_HOST_URL}${mainImage}`}
                  alt={medicine.name}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg"
                />
              )}
              {/* --- FIX END --- */}
            </div>
            {/* Thumbnail Gallery */}
            {processedImageUrls.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {processedImageUrls.map((imgUrl, index) => (
                  <div
                    key={index}
                    className={`relative w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2
                                ${imgUrl === mainImage ? 'border-kashmir-green' : 'border-transparent'}
                                hover:border-kashmir-gold transition-all duration-200`}
                    onClick={() => setMainImage(imgUrl)}
                  >
                    {/* --- FIX START: Correct Thumbnail Image src logic --- */}
                    {/* Similar logic as main image: if it's absolute, use it directly */}
                    {imgUrl && (
                        <Image
                            src={imgUrl.includes('res.cloudinary.com') || imgUrl.includes('placehold.co') ? imgUrl : `${BACKEND_HOST_URL}${imgUrl}`}
                            alt={`Thumbnail ${index + 1}`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
                        />
                    )}
                    {/* --- FIX END --- */}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medicine Details (rest of your component, no changes needed here unless you spot other issues) */}
          <div className="flex flex-col justify-start">
            <p className="text-gray-800 dark:text-gray-200 text-lg mb-4 leading-relaxed">
              {medicine.description}
            </p>
            <p className="text-2xl font-bold text-kashmir-green dark:text-kashmir-gold mb-3">
              Price: ₹{medicine.price.toFixed(2)}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">
              <span className="font-semibold">Stock:</span> {medicine.stock}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">
              <span className="font-semibold">Category:</span> {medicine.category}
            </p>
            {medicine.manufacturer && (
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">
                <span className="font-semibold">Manufacturer:</span> {medicine.manufacturer}
              </p>
            )}
            {medicine.expirationDate && (
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
                <span className="font-semibold">Expires On:</span> {new Date(medicine.expirationDate).toLocaleDateString()}
              </p>
            )}

            {/* Conditional Add to Cart / Quantity Controls */}
            {itemInCart ? (
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex-shrink-0">
                  In Cart:
                </span>
                <div className="flex items-center space-x-2 flex-grow">
                  <button
                    onClick={() => handleQuantityChange(currentCartQuantity - 1)}
                    className="text-kashmir-green hover:text-kashmir-gold dark:text-kashmir-gold dark:hover:text-kashmir-green"
                    disabled={currentCartQuantity <= 1}
                  >
                    <MinusCircle className="w-8 h-8" />
                  </button>
                  <input
                    type="number"
                    value={currentCartQuantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2 text-center border border-gray-300 rounded-md shadow-sm focus:ring-kashmir-green focus:border-kashmir-green
                                 bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                    min="1"
                    max={medicine.stock}
                  />
                  <button
                    onClick={() => handleQuantityChange(currentCartQuantity + 1)}
                    className="text-kashmir-green hover:text-kashmir-gold dark:text-kashmir-gold dark:hover:text-kashmir-green"
                    disabled={currentCartQuantity >= medicine.stock}
                  >
                    <PlusCircle className="w-8 h-8" />
                  </button>
                </div>
                <button
                  onClick={() => router.push('/cart')}
                  className="py-3 px-6 bg-kashmir-gold text-kashmir-dark-blue rounded-md font-semibold text-lg
                                 hover:bg-kashmir-green hover:text-kashmir-light transition duration-300
                                 dark:bg-kashmir-green dark:text-kashmir-light dark:hover:bg-kashmir-gold dark:hover:text-kashmir-dark-blue"
                >
                  Go to Cart
                </button>
              </div>
            ) : (
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                {/* Quantity Selector (only visible if item is NOT in cart) */}
                <div className="flex items-center space-x-3">
                  <label htmlFor="quantityToAdd" className="text-lg font-semibold text-gray-700 dark:text-gray-200">Quantity:</label>
                  <input
                    type="number"
                    id="quantityToAdd"
                    min="1"
                    max={medicine.stock}
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(Math.max(1, Math.min(medicine.stock, parseInt(e.target.value) || 1)))}
                    className="w-20 px-3 py-2 text-center border border-gray-300 rounded-md shadow-sm focus:ring-kashmir-green focus:border-kashmir-green
                                 bg-white text-gray-900 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={medicine.stock === 0}
                  className={`flex-1 py-3 px-6 bg-kashmir-green text-kashmir-light rounded-md font-semibold text-lg
                                 hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                                 dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light
                                 ${medicine.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            )}

            {/* Buy Now Button (always visible) */}
            <div className="mt-4">
              <button
                className="w-full py-3 px-6 border-2 border-kashmir-green text-kashmir-green rounded-md font-semibold text-lg
                               hover:bg-kashmir-green hover:text-kashmir-light transition duration-300
                               dark:border-kashmir-gold dark:text-kashmir-gold dark:hover:bg-kashmir-gold dark:hover:text-kashmir-dark-blue"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicineDetailPage;