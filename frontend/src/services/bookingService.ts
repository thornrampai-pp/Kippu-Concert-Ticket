import axiosInstance from "../lib/axios";
import { ApiError } from "../types";

export const bookingService = {
  // สร้างการจองใหม่
  createBooking: async (concertId: number, seatIds: number[]) => {
    try {
      const response = await axiosInstance.post("booking/create", {
        concertId,
        seatIds,
      });
      return response.data; // จะได้ { success: true, data: result }
    } catch (err: unknown) {
      const error = err as ApiError;
     
      throw new Error(error.response?.data?.message || "Booking failed");
    }
  },

  // ดึงรายการจองทั้งหมดของฉัน
  getMyBookings: async () => {
    try {
      const response = await axiosInstance.get("booking/my");
      return response.data.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      throw new Error(error.response?.data?.message || "Failed to fetch bookings");
    }
  },

  // ดึงรายละเอียดการจองตาม ID (ใช้ในหน้า Confirm/Ticket)
  getBookingById: async (bookingId: number) => {
    try {
      const response = await axiosInstance.get(`booking/${bookingId}`);
      return response.data.data;
    } catch (err: unknown) {
      const error = err as ApiError;
      throw new Error(error.response?.data?.message || "Booking not found");
    }
  },
};