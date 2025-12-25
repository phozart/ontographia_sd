/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable standalone output for Docker deployment
  // This creates a minimal server that can run without node_modules
  output: 'standalone',

  // Disable powered-by header for security
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false,

  // Image optimization settings
  images: {
    unoptimized: true, // Since we're not using Next.js Image component
  },

  // Set the project root to avoid workspace detection issues
  // This ensures standalone output is generated at the correct level
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
