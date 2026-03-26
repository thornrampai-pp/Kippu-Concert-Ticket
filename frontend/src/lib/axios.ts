import axios from 'axios';

const axiosInstance = axios.create({
  // ดึง URL จาก .env หรือใช้ค่าเริ่มต้น
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});



export default axiosInstance;