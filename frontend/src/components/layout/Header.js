// src/components/layout/Header.js
// This component now serves as the primary header, containing:
// - Logo and application title
// - Location display (placeholder)
// - Search input field (desktop)
// - Mobile menu (hamburger icon) which, when open, displays PRIMARY navigation links (Home, Profile/Auth)
// - Mobile menu close on outside click and link click
// - Conditional authentication links (Login/Register vs. Profile/Logout)
// - Styling using custom Tailwind CSS colors.
// NEW: Added Shopping Cart icon with item count.
// IMPROVEMENT: Enhanced location display with user's actual location (if permitted).
// IMPROVEMENT: Trimmed location text to prevent UI overflow.
// CHANGE: Removed theme toggle button from Header.
// NEW: Integrated global search state from Redux.
// FIX: Modified search input handling to dispatch Redux search query ONLY on submission.

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import Link from 'next/link';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import { useRouter } from 'next/navigation';
import { ShoppingCart, MapPin, Loader2 } from 'lucide-react'; // Import ShoppingCart, MapPin, and Loader2 icons
import { toast } from 'react-toastify'; // For notifications
import { setSearchQuery } from '../../features/globalSearch/globalSearchSlice'; // NEW: Import setSearchQuery from globalSearchSlice

// Import your logo image. Ensure 'logo.jpg' is in 'src/assets/images/'
// IMPORTANT: Please verify if your logo file is actually 'logo.jpg' or 'logo.png'
// and adjust the import path below accordingly if it's .png.
import KashmirWellnessLogo from '../../assets/images/logo.png';

function Header() {
  // State to manage the visibility of the mobile navigation menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // NEW: Get current search query from Redux globalSearchSlice
  const currentGlobalSearchQuery = useSelector((state) => state.globalSearch.searchQuery);
  // Local state for the search input value, initialized from Redux
  // This local state will only control the input field's value.
  const [localSearchInput, setLocalSearchInput] = useState(currentGlobalSearchQuery);
  // State for user's detected location
  const [userLocation, setUserLocation] = useState('Detecting Location...');
  // State for location loading status
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // Get authentication state and user data from Redux store
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  // Get cart items from Redux store to display count
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch(); // Redux dispatch function
  const router = useRouter(); // Next.js router instance

  // Ref for the navigation element to detect clicks outside
  const navRef = useRef(null);

  // Calculate total items in cart
  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Handler for user logout
  const handleLogout = () => {
    dispatch(logoutUser()); // Dispatch the logout action
    router.push('/auth/login'); // Redirect to login page after logout
  };

  // Function to toggle mobile menu visibility
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Function to close mobile menu (used on link clicks and outside clicks)
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Handler for search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchInput(value); // ONLY update local state for immediate UI feedback
    // REMOVED: dispatch(setSearchQuery(value)); // This was causing the issue by updating Redux on every keystroke
  };

  // Handler for search submission (e.g., pressing Enter)
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const queryToUse = localSearchInput.trim();
    if (queryToUse) {
      // Dispatch to update global search query in Redux ONLY ON SUBMISSION
      await dispatch(setSearchQuery(queryToUse));
      closeMobileMenu(); // Close mobile menu if search is performed from it
      router.push(`/search?q=${encodeURIComponent(queryToUse)}`); // Navigate to search results page
    } else {
      toast.info('Please enter a search query.');
    }
  };

  // Keep local search input in sync with Redux state (e.g., if navigated from another search or direct URL)
  // This is still useful if the user directly types /search?q=something in the URL,
  // or if the Redux state is cleared/updated by other means.
  useEffect(() => {
    setLocalSearchInput(currentGlobalSearchQuery);
  }, [currentGlobalSearchQuery]);


  // NEW: Function to fetch user's location using Geolocation API and Nominatim
  const fetchUserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      setUserLocation('Location not supported');
      return;
    }

    setIsLocationLoading(true);
    setUserLocation('Detecting Location...'); // Set loading state for display

    const success = async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Using OpenStreetMap Nominatim for reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();

        let locationString = 'Unknown Location';
        if (data && data.address) {
          const { city, town, village, state, country } = data.address;
          locationString = city || town || village || state || country || 'Unknown Location';
          if (state && locationString !== state) { // Add state if it's not already the main part
            locationString = `${city || town || village || ''}${city || town || village ? ', ' : ''}${state}`;
          }
          if (country && !locationString.includes(country)) { // Add country if not already included
            locationString = `${locationString}, ${country}`;
          }
        }
        setUserLocation(locationString);
        localStorage.setItem('userLocation', locationString); // Persist location
        toast.success(`Location updated to: ${locationString}`);
      } catch (error) {
        console.error('Error during reverse geocoding:', error);
        setUserLocation('Failed to get location');
        toast.error('Failed to get location details.');
      } finally {
        setIsLocationLoading(false);
      }
    };

    const error = (err) => {
      console.error('Geolocation error:', err);
      setIsLocationLoading(false);
      if (err.code === err.PERMISSION_DENIED) {
        setUserLocation('Location permission denied');
        toast.warn('Location access denied. Please enable it in browser settings.');
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setUserLocation('Location unavailable');
        toast.error('Location information is unavailable.');
      } else if (err.code === err.TIMEOUT) {
        setUserLocation('Location request timed out');
        toast.error('The request to get user location timed out.');
      } else {
        setUserLocation('Error getting location');
        toast.error('An unknown error occurred while getting location.');
      }
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0, // No cached position
    });
  }, []); // useCallback dependencies

  // Effect hook to handle clicks outside the mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && navRef.current && !navRef.current.contains(event.target)) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // NEW: Effect to load initial location from localStorage or prompt for it
  useEffect(() => {
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation) {
      setUserLocation(storedLocation);
    } else {
      // If no stored location, try to fetch it
      fetchUserLocation();
    }
  }, [fetchUserLocation]); // Depend on fetchUserLocation to run once on mount

  return (
    <header className="bg-kashmir-dark-blue text-kashmir-light py-3 px-4 shadow-md relative z-50
                        dark:bg-gray-900 dark:text-gray-100 dark:shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Section: Logo and Location Display */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Logo and App Title */}
          <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <Image
              src={KashmirWellnessLogo}
              alt="Kashmir Wellness Logo"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="text-xl sm:text-2xl font-bold hover:text-kashmir-gold transition duration-300 hidden sm:block">
              Kashmir Wellness
            </span>
          </Link>

          {/* Location Display - Clickable to refresh/set location */}
          <div
            className="flex items-center text-xs sm:text-sm cursor-pointer hover:text-kashmir-gold transition duration-300"
            onClick={fetchUserLocation} // Click to trigger location fetch
            title="Click to detect/update your location"
          >
            {isLocationLoading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin text-kashmir-gold dark:text-kashmir-light" />
            ) : (
              <MapPin className="w-4 h-4 mr-1 text-kashmir-gold dark:text-kashmir-light" />
            )}
            <span className="font-semibold inline-block max-w-[150px] truncate">
              {userLocation}
            </span>
            <svg
              className="w-3 h-3 ml-1 dark:text-kashmir-light hidden xs:block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Middle Section: Search Input (Desktop) - Hidden on mobile */}
        <div className="hidden md:flex flex-grow max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <input
              type="text"
              placeholder="Search for medicines, doctors, labs..."
              value={localSearchInput} // Bind to local state, which is synced with Redux
              onChange={handleSearchChange} // ONLY update local state on change
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-kashmir-green
                          bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Right Section: Cart, and Mobile Menu Button / Desktop Auth/Profile Nav */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Cart Icon */}
          <Link href="/cart" className="relative text-kashmir-light hover:text-kashmir-gold transition duration-300 dark:text-gray-200 dark:hover:text-kashmir-gold flex-shrink-0" onClick={closeMobileMenu}>
            <ShoppingCart className="w-6 h-6" />
            {totalCartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalCartItems}
              </span>
            )}
          </Link>

          {/* Mobile menu button (Hamburger icon) - Visible only on small screens */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-kashmir-light focus:outline-none dark:text-gray-200">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Auth/Profile Navigation - Only visible on md and larger screens */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link href="/profile" className="block py-1 hover:text-kashmir-gold transition duration-300">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="bg-kashmir-green px-3 py-1 rounded-md hover:bg-kashmir-gold transition duration-300 text-kashmir-light md:w-auto md:text-center
                                 dark:bg-kashmir-gold dark:hover:bg-kashmir-green dark:text-gray-900"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/auth/login" className="block py-1 hover:text-kashmir-gold transition duration-300">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth/register" className="block py-1 hover:text-kashmir-gold transition duration-300">
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Menu (Expanded from Hamburger) - Contains PRIMARY links only */}
      <nav
        ref={navRef}
        className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } md:hidden absolute top-full left-0 w-full bg-kashmir-dark-blue shadow-lg transition-all duration-300 ease-in-out
                           dark:bg-gray-800 dark:shadow-xl`}
      >
        <ul className="flex flex-col space-y-4 p-4">
          {/* Search Input for Mobile Menu */}
          <li className="w-full">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search for medicines, doctors, labs..."
                value={localSearchInput} // Bind to local state, which is synced with Redux
                onChange={handleSearchChange} // ONLY update local state on change
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-kashmir-green
                            bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </li>
          {/* Primary Nav Links */}
          <li>
            <Link href="/" className="block py-1 hover:text-kashmir-gold transition duration-300" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <Link href="/profile" className="block py-1 hover:text-kashmir-gold transition duration-300" onClick={closeMobileMenu}>
                  Profile
                </Link>
              </li>
              {user && (user.role === 'admin' || user.role === 'doctor' || user.role === 'lab_staff') && (
                <li>
                  <Link href="/dashboard" className="block py-1 hover:text-kashmir-gold transition duration-300" onClick={closeMobileMenu}>
                    Dashboard
                  </Link>
                </li>
              )}
              {/* Cart Icon in Mobile Menu */}
              <li>
                <Link href="/cart" className="flex items-center py-1 hover:text-kashmir-gold transition duration-300" onClick={closeMobileMenu}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart ({totalCartItems})
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-kashmir-green px-3 py-1 rounded-md hover:bg-kashmir-gold transition duration-300 text-kashmir-light w-full text-left
                             dark:bg-kashmir-gold dark:hover:bg-kashmir-green dark:text-gray-900"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/auth/login" className="block py-1 hover:text-kashmir-gold transition duration-300" onClick={closeMobileMenu}>
                  Login
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="block py-1 hover:text-kashmir-gold transition duration-300" onClick={closeMobileMenu}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
