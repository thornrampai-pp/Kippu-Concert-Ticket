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
        <Link href={homeHref}>Home</Link>
        <Link href="/booking">Booking</Link>
        {isAdmin ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition"
          >
            Log out
          </button>
        ) : (
          <Link href="/profile" className="cursor-pointer">
            {user?.image_url ? (
              <Image
                src={user.image_url}
                alt="profile"
                width={40}
                height={40}
                className="rounded-full object-cover border-2 border-transparent hover:border-white transition-all"
              />
            ) : (
              <FaCircleUser
                size={40}
                className="text-zinc-400 hover:text-white transition-colors"
              />
            )}
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;
