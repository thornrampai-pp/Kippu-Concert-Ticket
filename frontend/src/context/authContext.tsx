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

  
  const isAdmin = useMemo(() => {
    if (!auth.user) return false;

    // เช็คทั้งจาก role_id โดยตรง และจาก nested object role
    return auth.user.role_id === 2 || auth.user.role?.role_id === 2;
  }, [auth.user]);

  return (
    <AuthContext.Provider value={{ ...auth, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
