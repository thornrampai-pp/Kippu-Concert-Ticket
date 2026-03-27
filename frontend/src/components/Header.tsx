"use client";

import { FaCircleUser, FaTicketSimple } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "../context/authContext";

function Header() {
  const { handleLogout, user, isAdmin } = useAuthContext();
  const homeHref = isAdmin ? "/admin" : "/";

  return (
    <div className="flex w-full h-15 justify-between items-center bg-zinc-400 px-5 py-4 text-black">
      <div className="flex items-center">
        <FaTicketSimple size={35} />
        <p className="px-4 text-2xl font-bold tracking-tighter text-white-500">
          Kippu Ticket
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Link href={homeHref} className="hover:text-white transition">
          Home
        </Link>
        <Link href="/booking" className="hover:text-white transition">
          Booking
        </Link>

        {/* --- ส่วนที่ปรับปรุงใหม่ --- */}
        {isAdmin ? (
          // 1. ถ้าเป็น Admin ให้แสดงปุ่ม Logout
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition font-bold"
          >
            Log out
          </button>
        ) : user ? (
          // 2. ถ้า Login แล้ว (เป็น User ทั่วไป) ให้แสดงรูป Profile
          <Link href="/profile" className="cursor-pointer">
            {user.image_url ? (
              <Image
                src={user.image_url}
                alt="profile"
                width={40}
                height={40}
                className="rounded-full object-cover border-2 border-transparent hover:border-white transition-all shadow-md"
              />
            ) : (
              <FaCircleUser
                size={40}
                className="text-zinc-600 hover:text-white transition-colors"
              />
            )}
          </Link>
        ) : (
          // 3. ถ้ายังไม่ได้ Login ให้แสดงปุ่ม Login
          <Link
            href="/login"
            className="bg-black text-white px-5 py-2 rounded-full font-bold hover:bg-zinc-800 transition shadow-lg active:scale-95"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;
