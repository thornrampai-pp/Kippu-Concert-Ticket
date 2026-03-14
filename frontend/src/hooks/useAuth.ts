"use client";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase";
import { authService } from "../services/authService";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const loginGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // เรียกใช้ Service ที่เราสร้างไว้ข้างบน
      await authService.loginWithGoogle(idToken);

      router.push("/");
    } catch (err) {
      console.error("Login Error:", err);
      alert("Login failed, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { loginGoogle, isLoading };
};