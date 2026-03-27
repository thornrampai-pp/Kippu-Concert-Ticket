"use client";

import Header from "@/src/components/Header";
import { ProfileForm } from "@/src/components/profileFrom";
import { useAuthContext } from "@/src/context/authContext";
import { useAuth } from "@/src/hooks/useAuth";
import { FaSignOutAlt } from "react-icons/fa"; // เพิ่ม icon เพื่อความสวยงาม

const ProfilePage = () => {
  const { user, handleLogout } = useAuthContext(); // ดึง handleLogout ออกมาใช้งาน
  const { updateProfile, isUpdating } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-900 text-white pb-20">
      <Header />
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <h1 className="text-4xl font-black">Profile</h1>

        {user ? (
          <div className="space-y-6">
            <ProfileForm
              key={user.user_id}
              user={user}
              updateProfile={updateProfile}
              isUpdating={isUpdating}
            />

            {/* --- ส่วนของปุ่ม Logout --- */}
            <div className="pt-6">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-red-600 text-white font-bold py-4 rounded-3xl transition-all border border-zinc-700 hover:border-red-500 group shadow-lg"
              >
                <FaSignOutAlt className="group-hover:scale-110 transition-transform" />
                LOGOUT FROM KIPPU
              </button>
              <p className="text-center text-zinc-500 text-sm mt-4">
                Logged in as:{" "}
                <span className="text-zinc-400">{user.email}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
            <p className="text-zinc-400">Loading user data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
