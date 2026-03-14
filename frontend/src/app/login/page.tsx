"use client";

import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../../hooks/useAuth"
import { FaTicketSimple } from "react-icons/fa6";

export default function LoginPage() {
  const { loginGoogle, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900">
      <div className="bg-gray-200 w-105 p-12 rounded-2xl shadow-lg flex flex-col items-center gap-6">

          <FaTicketSimple size={100} />

        <h2 className="text-5xl font-black tracking-tighter">Kippu Ticket</h2>
        <h2 className="text-4xl font-black tracking-tighter">LOGIN</h2>

        <button
          onClick={loginGoogle}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800 disabled:bg-gray-400 transition"
        >
          <FcGoogle size={22} />
          {isLoading ? "Signing in..." : "Login with Google"}
        </button>
      </div>
    </div>
  );
}
