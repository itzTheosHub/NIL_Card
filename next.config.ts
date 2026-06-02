import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/privacy", destination: "/nil-card-privacy-policy", permanent: true },
      { source: "/terms", destination: "/nil-card-terms-of-service", permanent: true },
    ]
  },
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
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
        },
      ],
    },
};

export default nextConfig;
