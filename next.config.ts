import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'eycprftwqprcygozcatn.supabase.co',
        },
        {
          protocol: 'https',
          hostname: 'places.googleapis.com',
        },
      ],
    },
};

export default nextConfig;
