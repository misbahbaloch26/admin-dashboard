import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
   
  },
  eslint: {
    // Disable ESLint during production build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
