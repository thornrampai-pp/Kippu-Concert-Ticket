"use client";

import Header from "@/src/components/Header";
import { ProfileForm } from "@/src/components/profileFrom";
import { useAuthContext } from "@/src/context/authContext";
import { useAuth } from "@/src/hooks/useAuth";

const ProfilePage = () => {
  const { user } = useAuthContext();
  const { updateProfile, isUpdating } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Header />
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <h1 className="text-4xl font-black">Profile</h1>

        {/* 🚩 หัวใจสำคัญ: ใส่ key={user?.user_id} เพื่อให้ React รีเซ็ต Form เมื่อ User เปลี่ยน */}
        {user ? (
          <ProfileForm
            key={user.user_id}
            user={user}
            updateProfile={updateProfile}
            isUpdating={isUpdating}
          />
        ) : (
          <div className="text-center py-10">Loading user data...</div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;