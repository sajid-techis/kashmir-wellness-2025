/** @type {import('next').NextConfig} */
const nextConfig = {
     images: {
         remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // Crucial: Allows any path on Cloudinary
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  images: {
    domains: ['placehold.co', 'localhost','res.cloudinary.com'], // Add 'placehold.co' to allowed image domains
  },
};

export default nextConfig;
