// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   async rewrites() {
//     return [
//       {
//         source: '/demo-static', 
//         destination: '/www.brabantsedelta.nl/index.html', 
//       },
//     ];
//   },
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["wbd-chat.ddev.site"],
    },
  },
  allowedDevOrigins: ["wbd-chat.ddev.site"],
};

export default nextConfig;
