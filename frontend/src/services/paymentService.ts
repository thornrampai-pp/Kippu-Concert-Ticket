import { ApiError } from "next/dist/server/api-utils";
import axiosInstance from "../lib/axios";
import { Booking } from "../types";


export const paymentService ={
  createPayment: async (bookingId: number, paymentData:{token?:string; source?: string}) =>{
    try{
      const res = await axiosInstance.post('/payment/create',{
        bookingId,
        ...paymentData
      });
      return res.data;

    } catch (err: unknown){
      const error = err as ApiError;
      console.log(error)
      throw new Error(
        "Payment failed"
      );

    }
  },

  getPaymentStatus: async (bookingId: number): Promise<Booking> => {
    try {
      const response = await axiosInstance.get(`/payment/status/${bookingId}`);
      return response.data.data; // คืนค่าเป็น Object ของ Booking ตาม Interface
    } catch (err: unknown) {
      const error = err as ApiError;
      console.log(`error: ${error}`)
      throw new Error("ไม่สามารถดึงข้อมูลสถานะได้");
    }
  }
}