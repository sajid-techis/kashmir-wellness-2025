// src/components/layout/SecondaryNav.js
// This component provides a secondary navigation bar for main content categories.
// It is now visible on both desktop and mobile, with responsive adjustments.

'use client'; // This component uses React hooks (useSelector)

import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux'; // To conditionally show dashboard/auth links

function SecondaryNav() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <nav className="bg-kashmir-green text-kashmir-light shadow-md py-2 px-4
                    dark:bg-teal-700 dark:text-gray-100">
      <div className="container mx-auto">
        {/* Navigation links - now visible on all screens */}
        <ul className="flex flex-wrap justify-evenly items-center space-x-4 md:space-x-6"> {/* Added flex-wrap and adjusted spacing */}
          <li>
            <Link href="/medicines" className="hover:text-kashmir-gold transition duration-300 py-1 block text-sm md:text-base">
              Medicines
            </Link>
          </li>
          <li>
            <Link href="/doctors" className="hover:text-kashmir-gold transition duration-300 py-1 block text-sm md:text-base">
              Doctors
            </Link>
          </li>
          <li>
            <Link href="/labs" className="hover:text-kashmir-gold transition duration-300 py-1 block text-sm md:text-base">
              Labs
            </Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link href="/appointments" className="hover:text-kashmir-gold transition duration-300 py-1 block text-sm md:text-base">
                  Appointments
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-kashmir-gold transition duration-300 py-1 block text-sm md:text-base">
                  Orders
                </Link>
              </li>
              {user && (user.role === 'admin' || user.role === 'doctor' || user.role === 'lab_staff') && (
                <li>
                  <Link href="/dashboard" className="hover:text-kashmir-gold transition duration-300 py-1 block text-sm md:text-base">
                    Dashboard
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default SecondaryNav;
