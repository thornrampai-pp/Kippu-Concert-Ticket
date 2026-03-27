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
  async rewrites() {
    return [
      {
        // เมื่อ Frontend เรียก /api/something
        source: "/api/:path*",
        // ให้ส่งไปที่ Backend URL จริงๆ ของคุณ
        destination: "https://kippu-backend.onrender.com/:path*",
      },
    ];
  },
};

export default nextConfig;
