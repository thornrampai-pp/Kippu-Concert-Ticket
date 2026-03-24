import { PendingBooking } from "../types";
import { useEffect, useState } from "react";
import { bookingService } from "@/src/services/bookingService";
import { Booking } from "@/src/types";
import { useRouter } from "next/navigation";


export const useBooking = () => {
  const saveBooking = (data: PendingBooking) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("current_booking", JSON.stringify(data));
    }
  };

  const getBooking = (): PendingBooking | null => {
    if (typeof window !== "undefined") {
      const data = sessionStorage.getItem("current_booking");
      return data ? JSON.parse(data) : null;
    }
    return null;
  };

  const clearBooking = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("current_booking");
    }
  };

  return { saveBooking, getBooking, clearBooking };
};



export const useBookingStatus = (bookingId: number) => {
  const router = useRouter(); // ✅ ย้ายมาไว้ใน hook
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ โหลดครั้งแรก
  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        const data = await bookingService.getBookingById(bookingId);
        setBooking(data);
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, router]);

  // ✅ polling
  useEffect(() => {
    if (!bookingId) return;

    const interval = setInterval(async () => {
      try {
        const res = await bookingService.getBookingById(bookingId);
        setBooking(res);

        const bookingStatus = res.status;
        const paymentStatus = res.payments?.[0]?.status;

        console.log("📊 STATUS:", bookingStatus, paymentStatus);

        // 🔴 หมดเวลา
        if (bookingStatus === "EXPIRED") {
          alert("หมดเวลาชำระเงินแล้ว");
          router.push("/");
        }

        // 🟢 จ่ายสำเร็จ
        if (paymentStatus === "SUCCESS") {
          router.push(`/booking/${bookingId}/success`);
        }

      } catch (err) {
        console.error(err);
      }
    }, 10000); 

    return () => clearInterval(interval);
  }, [bookingId, router]);

  return { booking, loading };
};