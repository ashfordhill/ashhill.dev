/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for Cloudflare Pages
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Ensure trailing slashes are handled consistently
  trailingSlash: true,
  
  // Disable build optimization that can cause issues
  swcMinify: false,
  
  // Disable telemetry
  telemetry: false,
};

module.exports = nextConfig;