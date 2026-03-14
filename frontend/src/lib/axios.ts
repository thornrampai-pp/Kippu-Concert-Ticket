import axios from 'axios';
import { ENV } from '../config/env';

const axiosInstance = axios.create({
  // ดึง URL จาก .env หรือใช้ค่าเริ่มต้น
  baseURL: ENV.API_URL,
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;