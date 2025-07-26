// src/components/common/LabMap.js
// This component encapsulates the Leaflet map initialization and lifecycle for a single lab.

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure Leaflet CSS is imported

// Fix for default marker icon issue with Webpack/Next.js
// Leaflet's default icon paths don't always work out-of-the-box with bundlers.
// We manually set them here to point to the unpkg CDN.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

/**
 * Renders a Leaflet map for a single lab location.
 * @param {Object} props - Component props.
 * @param {string} props.labId - Unique ID of the lab (used as a key for map lifecycle).
 * @param {number[]} props.coordinates - Array of [longitude, latitude] for the lab.
 * @param {string} props.address - Human-readable address for the map popup.
 */
function LabMap({ labId, coordinates, address }) {
  const mapContainerRef = useRef(null); // Ref for the map container div
  const leafletMapInstanceRef = useRef(null); // Ref to store the Leaflet map instance

  useEffect(() => {
    // Only initialize if coordinates are valid and map container exists
    if (coordinates && coordinates.length === 2 && mapContainerRef.current) {
      // Coordinates are [longitude, latitude] from MongoDB, Leaflet needs [latitude, longitude]
      const [lon, lat] = coordinates;

      // If a map instance already exists for this container, remove it first
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }

      // Initialize the Leaflet map on the ref'd DOM element
      const map = L.map(mapContainerRef.current, {
        center: [lat, lon], // Leaflet uses [latitude, longitude]
        zoom: 15,
        zoomControl: false,    // Hide default zoom control
        dragging: false,       // Disable dragging
        scrollWheelZoom: false, // Disable scroll zoom
        doubleClickZoom: false, // Disable double click zoom
        boxZoom: false,        // Disable box zoom
        keyboard: false,       // Disable keyboard navigation
        tap: false,            // Disable tap (for mobile touch)
      });

      // Add OpenStreetMap tiles to the map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Add a marker at the specified coordinates
      L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${address || 'Lab Location'}</b>`).openPopup(); // Use lab address for popup

      // Store the map instance in the ref for later cleanup
      leafletMapInstanceRef.current = map;

      // Invalidate size to ensure the map renders correctly after its container is laid out.
      // Using requestAnimationFrame for better timing with browser rendering cycles.
      requestAnimationFrame(() => {
        // Check if the map instance and its container are still valid before invalidating size
        if (mapContainerRef.current && leafletMapInstanceRef.current) {
          leafletMapInstanceRef.current.invalidateSize();
        }
      });
    }

    // Cleanup function: This runs when the component unmounts or when the dependencies change
    return () => {
      // If a map instance exists, remove it to prevent memory leaks and errors
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, [labId, coordinates, address]); // Re-run effect if these props change

  return (
    <div
      ref={mapContainerRef} // Attach the ref to the div that will hold the map
      className="w-full h-48 rounded-md shadow-inner border border-gray-300 dark:border-gray-600"
      style={{ minHeight: '150px' }} // Ensure a minimum height for the map container
    />
  );
}

export default LabMap;
