/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/demo-static', 
        destination: '/www.brabantsedelta.nl/index.html', 
      },
      // Asset Rewrites 
      {
        source: '/_next/:path*',
        destination: '/brabant-static/_next/:path*',
      },
      {
        source: '/sites/:path*',
        destination: '/brabant-static/sites/:path*',
      },
      {
        source: '/themes/:path*',
        destination: '/brabant-static/themes/:path*',
      }, 
      {
        source: '/modules/:path*',
        destination: '/brabant-static/modules/:path*',
      },
    ]; 
  },
};

// export default nextConfig;
// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   experimental: {
//     serverActions: {
//       allowedOrigins: ["wbd-chat.ddev.site"],
//     },
//   },
//   allowedDevOrigins: ["wbd-chat.ddev.site"],
// };

export default nextConfig;
