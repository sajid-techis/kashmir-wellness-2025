// src/app/page.js
// This is the main home page of your Next.js application,
// now transformed into a more comprehensive e-commerce-like landing page.
// It features:
// - A hero section with an automatic image carousel.
// - Featured Categories section.
// - Featured Products (Medicines) section, fetching data from Redux.
// - Featured Doctors section, fetching data from Redux.
// - Featured Labs section, fetching data from Redux.
// - Promotional Banners.
// - Call to Action buttons.
// - A basic Footer.
// - Respects dark/light mode.
// IMPROVEMENT: Fixed image URL parsing error by correctly handling absolute and relative paths for next/image.

'use client'; // This component uses useState and useEffect for carousel functionality, and Redux hooks

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import { fetchMedicines } from '../features/medicines/medicineSlice'; // Import fetchMedicines thunk
import { fetchDoctors } from '../features/doctors/doctorSlice'; // NEW: Import fetchDoctors thunk
import { fetchLabs } from '../features/labs/labSlice';     // NEW: Import fetchLabs thunk
import { toast } from 'react-toastify'; // For notifications

// Carousel Images
import carouselImg1 from '../assets/images/carousel-img-1.jpg';
import carouselImg2 from '../assets/images/carousel-img-2.jpg';
import carouselImg3 from '../assets/images/carousel-img-3.jpg';

// Placeholder for category images (replace with actual if available)
const categoryPlaceholder = "https://res.cloudinary.com/dj6bt46ar/image/upload/v1727229453/Category-Images/1727229197442jaipul9t_dxwrsg.webp";
// Placeholder for promotional banners
const promoBanner1 = 'https://placehold.co/1200x300/A7D9B4/000000?text=Health+Deals';
const promoBanner2 = 'https://placehold.co/1200x300/C8E6C9/000000?text=New+Arrivals';


export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();

  // Redux state selectors
  const { medicines, isLoading: medicinesLoading, error: medicinesError } = useSelector((state) => state.medicines);
  const { doctors, isLoading: doctorsLoading, error: doctorsError } = useSelector((state) => state.doctors); // NEW
  const { labs, isLoading: labsLoading, error: labsError } = useSelector((state) => state.labs);       // NEW

  // Array of carousel images
  const carouselImages = [
    { src: carouselImg1, alt: "Medicines for your health" },
    { src: carouselImg2, alt: "Connect with expert Doctors" },
    { src: carouselImg3, alt: "Book Lab Tests with ease" },
  ];

  // State to track the current active image index in the carousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Define featured categories (can be expanded or fetched from backend)
  const featuredCategories = [
    { name: 'Pain Relief', image: categoryPlaceholder, link: '/medicines?category=Pain%20Relief' },
    { name: 'Antibiotics', image: categoryPlaceholder, link: '/medicines?category=Antibiotics' },
    { name: 'Vitamins', image: categoryPlaceholder, link: '/medicines?category=Vitamins' },
    { name: 'Cough & Cold', image: categoryPlaceholder, link: '/medicines?category=Cough%20%26%20Cold' },
    { name: 'Digestive Health', image: categoryPlaceholder, link: '/medicines?category=Digestive%20Health' },
  ];

  // Get the backend API base URL from environment variables for image paths
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';
  const BACKEND_HOST_URL = API_BASE_URL.replace('/api/v1', ''); // Extracts http://localhost:5000

  // Function to go to the next image in the carousel
  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Effect for automatic carousel rotation
  useEffect(() => {
    const interval = setInterval(goToNextImage, 5000);
    return () => clearInterval(interval);
  }, [currentImageIndex]);

  // Effect to fetch medicines for the "Featured Products" section
  useEffect(() => {
    dispatch(fetchMedicines({ limit: 8, sort: '-createdAt' })); // Fetch latest 8 medicines
  }, [dispatch]);

  // NEW: Effect to fetch doctors for the "Featured Doctors" section
  useEffect(() => {
    dispatch(fetchDoctors({ limit: 4, sort: '-createdAt' })); // Fetch latest 4 doctors
  }, [dispatch]);

  // NEW: Effect to fetch labs for the "Featured Labs" section
  useEffect(() => {
    dispatch(fetchLabs({ limit: 4, sort: '-createdAt' })); // Fetch latest 4 labs
  }, [dispatch]);


  // Handle errors from fetching data
  useEffect(() => {
    if (medicinesError) {
      toast.error(`Error loading featured medicines: ${medicinesError}`);
    }
    if (doctorsError) {
      toast.error(`Error loading featured doctors: ${doctorsError}`);
    }
    if (labsError) {
      toast.error(`Error loading featured labs: ${labsError}`);
    }
  }, [medicinesError, doctorsError, labsError]);


  return (
    <main className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center p-4 md:p-8
                     bg-gradient-to-br from-kashmir-light to-blue-100
                     dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 transition-colors duration-300">

      {/* Hero Section: Text and Images Carousel */}
      <section className="flex flex-col md:flex-row items-center justify-center md:space-x-12 max-w-7xl w-full mb-12 p-4">
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left mb-8 md:mb-0">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-kashmir-dark-blue mb-4
                          dark:text-kashmir-light transition-colors duration-300">
            Welcome to Kashmir Wellness!
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl
                        dark:text-gray-300 transition-colors duration-300">
            Your trusted platform for comprehensive health and wellness solutions right here in Kashmir.
            Find medicines, connect with doctors, book lab tests, and manage your appointments with ease.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
            <button
              onClick={() => router.push('/medicines')}
              className="px-8 py-3 bg-kashmir-green text-kashmir-light font-semibold rounded-lg shadow-md
                          hover:bg-kashmir-gold hover:text-kashmir-dark-blue focus:outline-none focus:ring-2 focus:ring-kashmir-green focus:ring-opacity-75
                          transition duration-300 ease-in-out
                          dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
            >
              Explore Medicines
            </button>
            <button
              onClick={() => router.push('/doctors')}
              className="px-8 py-3 bg-transparent border-2 border-kashmir-green text-kashmir-dark-blue font-semibold rounded-lg shadow-md
                          hover:bg-kashmir-green hover:text-kashmir-light focus:outline-none focus:ring-2 focus:ring-kashmir-green focus:ring-opacity-75
                          transition duration-300 ease-in-out
                          dark:border-kashmir-gold dark:text-kashmir-light dark:hover:bg-kashmir-gold dark:hover:text-kashmir-dark-blue">
              Find a Doctor
            </button>
          </div>
        </div>

        {/* Carousel Section */}
        <div className="flex-1 relative w-full max-w-sm sm:max-w-md md:max-w-none md:w-auto">
          <div className="overflow-hidden rounded-lg shadow-xl">
            <Image
              src={carouselImages[currentImageIndex].src}
              alt={carouselImages[currentImageIndex].alt}
              width={600} // Increased width for better display
              height={400} // Increased height for better display
              className="w-full h-auto object-cover transition-opacity duration-500 ease-in-out"
              priority // Prioritize loading for LCP
            />
          </div>
          {/* Carousel Navigation Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentImageIndex ? 'bg-kashmir-gold' : 'bg-gray-300 bg-opacity-75 dark:bg-gray-500'
                } transition-colors duration-300 focus:outline-none`}
                aria-label={`Go to image ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories Section */}
      <section className="w-full max-w-7xl my-12 p-4">
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                        dark:text-kashmir-light transition-colors duration-300">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {featuredCategories.map((category) => (
            <div
              key={category.name}
              className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300
                          dark:bg-gray-800 dark:shadow-lg cursor-pointer"
              onClick={() => router.push(category.link)}
            >
              <div className="relative w-full h-32 sm:h-40 bg-gray-200 dark:bg-gray-700">
                <Image
                  src={category.image}
                  alt={category.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-kashmir-dark-blue dark:text-kashmir-light">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Banners Section */}
      <section className="w-full max-w-7xl my-12 p-4">
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                        dark:text-kashmir-light transition-colors duration-300">
          Special Offers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300">
            <Image
              src={promoBanner1}
              alt="Health Deals Banner"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
          <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300">
            <Image
              src={promoBanner2}
              alt="New Arrivals Banner"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Featured Products Section (Medicines) */}
      <section className="w-full max-w-7xl my-12 p-4">
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                        dark:text-kashmir-light transition-colors duration-300">
          Featured Medicines
        </h2>
        {medicinesLoading ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-xl font-semibold dark:text-gray-300">Loading featured medicines...</p>
          </div>
        ) : medicines.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
            No featured medicines available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {medicines.slice(0, 8).map((medicine) => ( // Show up to 8 featured medicines
              <div
                key={medicine._id}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col
                            dark:bg-gray-800 dark:shadow-lg transition-colors duration-300"
              >
                {/* Medicine Image */}
                <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  {(() => {
                    let imageUrlToDisplay = "https://placehold.co/400x300/E0F2F7/000000?text=Medicine"; // Default fallback

                    if (medicine.imageUrl && medicine.imageUrl.length > 0 && typeof medicine.imageUrl[0] === 'string' && medicine.imageUrl[0].trim() !== '') {
                      const firstImageUrl = medicine.imageUrl[0];
                      if (firstImageUrl.startsWith('http://') || firstImageUrl.startsWith('https://')) {
                        imageUrlToDisplay = firstImageUrl; // Already an absolute URL
                      } else {
                        imageUrlToDisplay = `${BACKEND_HOST_URL}${firstImageUrl}`; // Relative path
                      }
                    }

                    return (
                      <Image
                        src={imageUrlToDisplay}
                        alt={medicine.name || "Medicine Image"}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 hover:scale-105"
                      />
                    );
                  })()}
                </div>

                {/* Medicine Details */}
                <div className="p-4 flex-grow">
                  <h3 className="text-xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-2">
                    {medicine.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                    {medicine.description}
                  </p>
                  <p className="text-gray-700 dark:text-gray-200 font-medium text-lg mb-1">
                    ₹{medicine.price.toFixed(2)}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Stock: {medicine.stock}
                  </p>
                </div>

                {/* Action Button (View Details) */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => router.push(`/medicines/${medicine._id}`)} // Navigate to detail page
                    className="w-full py-2 px-4 bg-kashmir-green text-kashmir-light rounded-md font-semibold
                               hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                               dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <button
            onClick={() => router.push('/medicines')}
            className="px-8 py-3 bg-kashmir-dark-blue text-kashmir-light font-semibold rounded-lg shadow-md
                        hover:bg-kashmir-gold hover:text-kashmir-dark-blue focus:outline-none focus:ring-2 focus:ring-kashmir-dark-blue focus:ring-opacity-75
                        transition duration-300 ease-in-out
                        dark:bg-gray-700 dark:text-kashmir-light dark:hover:bg-kashmir-gold dark:hover:text-kashmir-dark-blue"
          >
            View All Medicines
          </button>
        </div>
      </section>

      {/* NEW: Featured Doctors Section */}
      <section className="w-full max-w-7xl my-12 p-4">
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                        dark:text-kashmir-light transition-colors duration-300">
          Meet Our Expert Doctors
        </h2>
        {doctorsLoading ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-xl font-semibold dark:text-gray-300">Loading featured doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
            No featured doctors available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.slice(0, 4).map((doctor) => ( // Show up to 4 featured doctors
              <div
                key={doctor._id}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-center p-4
                            dark:bg-gray-800 dark:shadow-lg transition-colors duration-300"
              >
                {/* Doctor Image */}
                <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-kashmir-green shadow-md
                                 dark:border-kashmir-gold">
                  {(() => {
                    let imageUrlToDisplay = "https://placehold.co/400x300/E0F2F7/000000?text=Doctor"; // Default fallback

                    if (doctor.imageUrl) {
                      if (typeof doctor.imageUrl === 'string' && doctor.imageUrl.trim() !== '') {
                        if (doctor.imageUrl.startsWith('http://') || doctor.imageUrl.startsWith('https://')) {
                          imageUrlToDisplay = doctor.imageUrl; // Already an absolute URL
                        } else {
                          imageUrlToDisplay = `${BACKEND_HOST_URL}${doctor.imageUrl}`; // Relative path
                        }
                      }
                      // Robustness: Handle case where doctor.imageUrl might be an array
                      else if (Array.isArray(doctor.imageUrl) && doctor.imageUrl.length > 0 && typeof doctor.imageUrl[0] === 'string' && doctor.imageUrl[0].trim() !== '') {
                          if (doctor.imageUrl[0].startsWith('http://') || doctor.imageUrl[0].startsWith('https://')) {
                              imageUrlToDisplay = doctor.imageUrl[0];
                          } else {
                              imageUrlToDisplay = `${BACKEND_HOST_URL}${doctor.imageUrl[0]}`;
                          }
                      }
                    }

                    return (
                      <Image
                        src={imageUrlToDisplay}
                        alt={`Dr. ${doctor.name || 'Doctor'}`}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 hover:scale-105"
                      />
                    );
                  })()}
                </div>
                {/* Doctor Details */}
                <h3 className="text-xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-1 text-center">
                  Dr. {doctor.name}
                </h3>
                <p className="text-kashmir-green dark:text-kashmir-gold text-md font-medium mb-2 text-center">
                  {doctor.specialization}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 text-center">
                  Experience: {doctor.experience} years
                </p>
                {/* Action Button */}
                <button
                  onClick={() => router.push(`/doctors/${doctor._id}`)} // Navigate to doctor detail page
                  className="w-full py-2 px-4 bg-kashmir-green text-kashmir-light rounded-md font-semibold
                             hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                             dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <button
            onClick={() => router.push('/doctors')}
            className="px-8 py-3 bg-kashmir-dark-blue text-kashmir-light font-semibold rounded-lg shadow-md
                        hover:bg-kashmir-gold hover:text-kashmir-dark-blue focus:outline-none focus:ring-2 focus:ring-kashmir-dark-blue focus:ring-opacity-75
                        transition duration-300 ease-in-out
                        dark:bg-gray-700 dark:text-kashmir-light dark:hover:bg-kashmir-gold dark:hover:text-kashmir-dark-blue"
          >
            View All Doctors
          </button>
        </div>
      </section>

      {/* NEW: Featured Labs Section */}
      <section className="w-full max-w-7xl my-12 p-4">
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                        dark:text-kashmir-light transition-colors duration-300">
          Our Trusted Labs
        </h2>
        {labsLoading ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-xl font-semibold dark:text-gray-300">Loading featured labs...</p>
          </div>
        ) : labs.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
            No featured labs available at the moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {labs.slice(0, 4).map((lab) => ( // Show up to 4 featured labs
              <div
                key={lab._id}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col p-4
                            dark:bg-gray-800 dark:shadow-lg transition-colors duration-300"
              >
                <h3 className="text-xl font-semibold text-kashmir-dark-blue dark:text-kashmir-light mb-2">
                  {lab.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
                  {lab.address}
                </p>
                <p className="text-gray-700 dark:text-gray-200 text-sm mb-1">
                  Phone: {lab.phone}
                </p>
                {lab.services && lab.services.length > 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    Services: {lab.services.join(', ')}
                  </p>
                )}
                {/* Action Button */}
                <button
                  onClick={() => router.push(`/labs/${lab._id}`)} // Navigate to lab detail page
                  className="w-full py-2 px-4 bg-kashmir-green text-kashmir-light rounded-md font-semibold
                             hover:bg-kashmir-gold hover:text-kashmir-dark-blue transition duration-300
                             dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="mt-10 text-center">
          <button
            onClick={() => router.push('/labs')}
            className="px-8 py-3 bg-kashmir-dark-blue text-kashmir-light font-semibold rounded-lg shadow-md
                        hover:bg-kashmir-gold hover:text-kashmir-dark-blue focus:outline-none focus:ring-2 focus:ring-kashmir-dark-blue focus:ring-opacity-75
                        transition duration-300 ease-in-out
                        dark:bg-gray-700 dark:text-kashmir-light dark:hover:bg-kashmir-gold dark:hover:text-kashmir-dark-blue"
          >
            View All Labs
          </button>
        </div>
      </section>


      {/* Additional CTAs (if needed, e.g., for labs or specific services) */}
      <section className="w-full max-w-7xl my-12 p-4">
        <h2 className="text-3xl font-bold text-center text-kashmir-dark-blue mb-8
                        dark:text-kashmir-light transition-colors duration-300">
          Explore More Services
        </h2>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
          <button
            onClick={() => router.push('/labs')}
            className="px-8 py-3 bg-kashmir-green text-kashmir-light font-semibold rounded-lg shadow-md
                        hover:bg-kashmir-gold hover:text-kashmir-dark-blue focus:outline-none focus:ring-2 focus:ring-kashmir-green focus:ring-opacity-75
                        transition duration-300 ease-in-out
                        dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light">
            Find a Lab
          </button>
          <button
            onClick={() => router.push('/appointments')}
            className="px-8 py-3 bg-transparent border-2 border-kashmir-green text-kashmir-dark-blue font-semibold rounded-lg shadow-md
                        hover:bg-kashmir-green hover:text-kashmir-light focus:outline-none focus:ring-2 focus:ring-kashmir-green focus:ring-opacity-75
                        transition duration-300 ease-in-out
                        dark:border-kashmir-gold dark:text-kashmir-light dark:hover:bg-kashmir-gold dark:hover:text-kashmir-dark-blue">
            Book an Appointment
          </button>
        </div>
      </section>

      {/* NEW: Footer Section */}
      <footer className="w-full bg-kashmir-dark-blue text-kashmir-light py-8 px-4 mt-12
                           dark:bg-gray-900 dark:text-gray-300 transition-colors duration-300">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left space-y-6 md:space-y-0">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xl font-bold mb-2">Kashmir Wellness</h3>
            <p className="text-sm">&copy; {new Date().getFullYear()} All rights reserved.</p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/about" className="hover:text-kashmir-gold transition duration-300">About Us</a></li>
              <li><a href="/contact" className="hover:text-kashmir-gold transition duration-300">Contact</a></li>
              <li><a href="/privacy" className="hover:text-kashmir-gold transition duration-300">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-kashmir-gold transition duration-300">Terms of Service</a></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-semibold mb-2">Connect With Us</h4>
            <div className="flex space-x-4">
              {/* Placeholder for social media icons */}
              <a href="#" className="hover:text-kashmir-gold transition duration-300" aria-label="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.262c-1.225 0-1.628.765-1.628 1.563V12h2.773l-.443 2.89h-2.33V22C18.343 21.128 22 16.991 22 12z"></path></svg>
              </a>
              <a href="#" className="hover:text-kashmir-gold transition duration-300" aria-label="Twitter">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.384 4.482A13.924 13.924 0 011.671 3.149a4.916 4.916 0 001.523 6.574A4.916 4.916 0 01.99 9.124v.063a4.926 4.926 0 003.95 4.827 4.919 4.919 0 01-2.226.084 4.925 4.925 0 004.604 3.417A9.868 9.868 0 010 20.407a13.973 13.973 0 007.543 2.204c9.088 0 14.05-7.516 14.05-14.012 0-.213-.005-.426-.014-.637A10.022 10.022 0 0024 4.557z"></path></svg>
              </a>
              <a href="#" className="hover:text-kashmir-gold transition duration-300" aria-label="Instagram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.77 1.622 4.948 4.948.058 1.267.07 1.647.07 4.85s-.012 3.584-.07 4.85c-.148 3.252-1.622 4.77-4.948 4.948-.058.003-1.267.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.77-1.622-4.948-4.948-.058-1.267-.07-1.647-.07-4.85s.012-3.584.07-4.85c.148-3.252 1.905-4.77 5.495-4.948 1.267-.058 1.647-.07 4.85-.07zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
