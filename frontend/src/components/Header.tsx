"use client";

import { FaCircleUser, FaTicketSimple } from "react-icons/fa6";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "../context/authContext";

function Header() {
  const { user,  } = useAuthContext();
  const isAdmin = user?.role?.role_id === 2;
  const homeHref = isAdmin ? "/admin" : "/";

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
        <Link href={homeHref}>Home</Link>
        <Link href="/booking">Booking</Link>

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
