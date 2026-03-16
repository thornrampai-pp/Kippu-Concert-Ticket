import axiosInstance from '../lib/axios'; 
import { ApiResponseUser, UpdateProfileInput, User } from '../types';

export const authService = {
  // รับ idToken จาก Firebase แล้วส่งไปให้ Backend Port 4000
  loginWithGoogle: async (idToken: string) => {
    // ใช้ /users/sigin ตามที่ตั้งไว้ใน Backend Route
    const response = await axiosInstance.post('/users/signin', { idToken });
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/users/logout');
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponseUser<User>>(
      "/users/me"
    );
    return response.data.data;
  },

  updateProfile: async (
    data: UpdateProfileInput
  ): Promise<User> => {
    const response = await axiosInstance.patch<ApiResponseUser<User>>(
      "/users/me",
      data
    );
    return response.data.data;
  },

  refreshToken: async (idToken: string) => {
    const response = await axiosInstance.post('/users/refresh-token', { idToken });
    return response.data;
  },
};