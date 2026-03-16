"use client";

import { FaCircleUser, FaTicketSimple } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";

function Header() {
  const router = useRouter();
  const { user, isLoading } = useAuth(); 

  if (isLoading)
    return <div className="p-4 bg-zinc-900 flex justify-center items-center text-white">Loading...</div>;
  // ป้องกันการแสดงผลผิดพลาดขณะกำลังโหลดข้อมูล
  return (
    <div className="flex w-full h-15 justify-between items-center bg-zinc-400 px-5 py-4">
      <div className="flex items-center">
        <FaTicketSimple size={35} />
        <p className="px-4 text-2xl font-bold tracking-tighter text-white-500">
          Kippu Ticket
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/admin">Home</Link>
        <Link href="/booking">Booking</Link>
        {user?.role.role_id === 2 && (
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="cursor-pointer bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
          >
            Admin Panel
          </button>
        )}
        <div className="cursor-pointer">
          <FaCircleUser size={40} />
          {/* <Image
            src="/profile.jpg"
            alt="profile"
            width={40}
            height={40}
            className="rounded-full" */}
          {/* // onClick={} */}
          {/* /> */}
        </div>
      </div>
    </div>
  );
}

export default Header;
