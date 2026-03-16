"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { authService } from "../services/authService";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User } from "../types";

export const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const loginGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // เรียกใช้ Service ที่เราสร้างไว้ข้างบน
      await authService.loginWithGoogle(idToken);
      const userData = await authService.getProfile();
      setUser(userData);

      if (userData.role.role_id === 2){
        router.push("/admin");
      }else{
        router.push("/");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Login failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { loginGoogle, isLoading, user };
};