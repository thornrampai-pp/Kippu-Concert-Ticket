import { useState, useEffect, useCallback } from "react";
import { bookingService } from "@/src/services/bookingService";
import { Booking } from "../types";

export const useMyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await bookingService.getMyBookings();
      setBookings(res);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Fetch bookings error:", err);
      setError(error.message || "ไม่สามารถดึงข้อมูลการจองได้");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ฟังก์ชันสำหรับสั่ง Refresh ข้อมูลใหม่ (เช่น หลังจากกดยกเลิกการจอง)
  const refresh = () => fetchBookings();

  return {
    bookings,
    isLoading,
    error,
    refresh,
    // แถม Helper function เล็กๆ ไว้ให้ UI ใช้ได้ง่ายๆ
    hasBookings: bookings.length > 0,
  };
};