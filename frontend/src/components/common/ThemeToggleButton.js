// src/components/common/ThemeToggleButton.js
// This component provides a floating button to toggle between dark and light themes.
// It uses next-themes for theme management and lucide-react for icons.
// FIX: Implemented a local 'mounted' state to ensure client-side rendering of icons.

'use client'; // This directive marks the component as a Client Component

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes'; // Import useTheme for theme toggling
import { Sun, Moon } from 'lucide-react'; // Import Sun and Moon icons

function ThemeToggleButton() {
  // Get current theme and setter from next-themes
  const { theme, setTheme } = useTheme(); // Removed 'mounted' from destructuring
  // Local state to track if the component has mounted on the client
  const [mounted, setMounted] = useState(false);

  // Function to toggle between dark and light themes
  const toggleTheme = () => {
    if (mounted) { // Only toggle if component is mounted on client
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  // Effect to set mounted state to true once the component has hydrated on the client
  useEffect(() => {
    setMounted(true);
  }, [theme]); // Depend on theme to re-log if it changes after mount

  // Render a placeholder div if not mounted to prevent layout shift during server-side rendering
  if (!mounted) {
    return (
      <div className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center shadow-lg animate-pulse" />
    );
  }

  // Determine icon color based on the current theme
  const iconColor = theme === 'dark' ? '#1A202C' : '#F8FAFC'; // Using hex values for direct color prop

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 p-3 rounded-full shadow-lg
                 focus:outline-none focus:ring-2 focus:ring-opacity-75
                 transition-all duration-300 transform hover:scale-110 z-50
                 bg-kashmir-green text-kashmir-light hover:bg-kashmir-gold hover:text-kashmir-dark-blue
                 dark:bg-kashmir-gold dark:text-kashmir-dark-blue dark:hover:bg-kashmir-green dark:hover:text-kashmir-light
                 dark:focus:ring-kashmir-gold" // Added dark focus ring
      aria-label="Toggle theme"
    >
      {/* Explicitly setting icon colors using the 'color' prop for direct control */}
      {/* Removed temporary red border */}
      {theme === 'dark' ? (
        <Sun className="w-6 h-6" color={iconColor} /> // Sun icon for light mode
      ) : (
        <Moon className="w-6 h-6" color={iconColor} /> // Moon icon for dark mode
      )}
    </button>
  );
}

export default ThemeToggleButton;
