import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "atvhucklpldvdaqfjuxy.supabase.co",
      },
    ],
  },
};

export default nextConfig;
