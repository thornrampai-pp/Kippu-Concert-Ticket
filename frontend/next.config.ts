import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "atvhucklpldvdaqfjuxy.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // 🚩 เพิ่มบรรทัดนี้สำหรับรูป Google Profile
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
