"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { authService } from "../services/authService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UpdateProfileInput, User } from "../types";
import { useAuthContext } from "../context/authContext";

export const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false); 

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        try {
          // 1. รับ Token ล่าสุด (Firebase จัดการ Refresh ให้ถ้าใกล้หมดอายุ)
          const idToken = await firebaseUser.getIdToken();

          // 2. เรียก Service เพื่อเอา Token ใหม่ไปใส่ใน HttpOnly Cookie
          await authService.refreshToken(idToken);

          // 3. ดึง Profile เพื่ออัปเดต State (ให้ role ไม่เป็น undefined)
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (err) {
          console.error("Auth sync error:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // 1. เรียก signin และรับข้อมูล user กลับมาเลย (ไม่ต้องไป getProfile อีกรอบ)
      const response = await authService.loginWithGoogle(idToken);

      const userData = response.data;

      if (userData) {
        setUser(userData);
        // 2. เช็ค Role จากข้อมูลที่เพิ่งสร้าง/อัปเดตสดๆ
        if (userData.role_id === 2) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      //  บอก Backend ให้ล้าง HttpOnly Cookie (ผ่าน authService ที่คุณเขียนไว้)
      await authService.logout();

      //  บอก Firebase ให้ Sign Out
      await auth.signOut();

      //  ล้าง State ในเครื่อง
      setUser(null);

     
      window.location.href = "/login";
      router.refresh(); // เพื่อล้าง cache ของ server components
    } catch (err) {
      console.error("Logout Error:", err);
      alert("Logout failed");
    } finally {
      setIsLoading(false);
    }
  };
  const updateProfile = async (data: UpdateProfileInput) => {
    setIsUpdating(true);
    try {
      const updatedUser = await authService.updateProfile(data);

      setUser((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          ...updatedUser, // ✅ ใช้ค่าจริงจาก backend
        };
      });

      return { success: true };
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Update Error:", err);
      return { success: false, message: "อัปเดตข้อมูลไม่สำเร็จ" };
    } finally {
      setIsUpdating(false);
    }
  };
  

  return { loginGoogle, handleLogout, isLoading, user, updateProfile, isUpdating };
};

export const useAdminGuard = () => {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // กฎเหล็ก: ต้องโหลดเสร็จ (isLoading: false) และ มั่นใจว่าไม่ใช่ Admin จริงๆ ถึงจะไล่ออก
    if (!isLoading) {
      const isAdmin = user?.role?.role_id === 2;
      if (!user || !isAdmin) {
        router.replace("/");
      }
    }
  }, [isLoading, user, router]);

  return {
    user,
    isLoading,
    isAdmin: user?.role?.role_id === 2
  };
};

