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
        // สิ่งที่ User เห็นใน Inspect: /api/v1/users
        source: '/api/v1/:path*',
        // ปลายทางจริงที่ซ่อนไว้ใน .env: https://your-backend.onrender.com/users
        destination: `${process.env.BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
