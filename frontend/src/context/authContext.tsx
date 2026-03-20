"use client";

import { createContext, useContext, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean; // 1. เพิ่มสถานะ isAdmin เข้าไป
  loginGoogle: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAdmin: false, // ค่าเริ่มต้นเป็น false
  loginGoogle: async () => {},
  handleLogout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth(); // ดึง { user, isLoading, loginGoogle } มาจาก useAuth

  // 2. ใช้ useMemo เพื่อคำนวณ isAdmin
  // มันจะคำนวณใหม่เฉพาะตอนที่ auth.user เปลี่ยนเท่านั้น ช่วยให้แอปฯ ลื่นไหล
  const isAdmin = useMemo(() => {
    return auth.user?.role?.role_id === 2;
  }, [auth.user]);

  return (
    <AuthContext.Provider value={{ ...auth, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
