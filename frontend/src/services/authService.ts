import axiosInstance from '../lib/axios'; 

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
  }
};