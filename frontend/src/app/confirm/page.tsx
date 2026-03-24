"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/src/hooks/useBooking";
import { bookingService } from "@/src/services/bookingService";
import { ApiError, ApiResponse, PendingBooking } from "@/src/types";

const ConfirmBookingPage = () => {
  const router = useRouter();
  const { getBooking, clearBooking } = useBooking();
  const [bookingData, setBookingData] = useState<PendingBooking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const data = getBooking();
    if (!data) {
      router.push("/"); // ถ้าไม่มีข้อมูลใน Session ให้เด้งกลับหน้าหลัก
      return;
    }
    setBookingData(data);
  }, []);

  const handleFinalConfirm = async () => {
    if (!bookingData) return;
    console.log("Current Seats in Session:", bookingData.seats);

    setIsSubmitting(true);

    try {
     
      const availabilityIds = bookingData.seats.map(
        (s) => s.availabilityId || s.availabilityId,
      );
      // 🚀 ยิง API createBooking ที่คุณเขียนไว้ใน Backend
      const res = await bookingService.createBooking(
        bookingData.concertId,
        availabilityIds,
      );

      if (res.success) {
        // ล้าง Session เมื่อจองสำเร็จ (เพื่อกันการกดย้อนกลับมาจองซ้ำ)
        clearBooking();
        // ส่งไปหน้า Payment พร้อม ID การจองที่ได้จาก Backend
        router.push(`/confirm/payment/${res.data.booking_id}`);
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage =
        error.response?.data?.message || error.message || "เกิดข้อผิดพลาด";
      alert(errorMessage);

      router.back(); // ส่งกลับไปเลือกที่นั่งใหม่
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingData) return null;

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6 flex justify-center items-center">
      <div className="max-w-md w-full bg-zinc-800 rounded-3xl p-8 shadow-2xl border border-zinc-700">
        <h1 className="text-2xl font-bold mb-6 text-center text-emerald-400">
          ยืนยันรายละเอียดการจอง
        </h1>

        {/* รายละเอียดคอนเสิร์ต */}
        <div className="space-y-4 mb-8">
          <div className="border-b border-zinc-700 pb-4">
            <p className="text-zinc-400 text-sm">คอนเสิร์ต</p>
            <p className="text-lg font-semibold">{bookingData.concertName}</p>
            <p className="text-sm text-zinc-400">{bookingData.showtime}</p>
          </div>

          <div className="border-b border-zinc-700 pb-4">
            <p className="text-zinc-400 text-sm">โซน / ที่นั่ง</p>
            <p className="text-lg">
              โซน {bookingData.zoneName}:{" "}
              <span className="text-emerald-400 font-bold">
                {bookingData.seats.map((s) => s.name).join(", ")}
              </span>
            </p>
          </div>

          <div className="flex justify-between items-center py-2">
            <p className="text-zinc-400">จำนวน</p>
            <p>{bookingData.seats.length} ที่นั่ง</p>
          </div>

          <div className="flex justify-between items-center text-xl font-bold pt-4">
            <p>ราคาสุทธิ</p>
            <p className="text-emerald-400">
              ฿{bookingData.totalPrice.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ปุ่มกดยืนยัน */}
        <div className="space-y-3">
          <button
            onClick={handleFinalConfirm}
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-600 text-black font-bold py-4 rounded-xl transition-all active:scale-95 flex justify-center items-center"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
            ) : (
              "ไปหน้าชำระเงิน"
            )}
          </button>

          <button
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="w-full text-zinc-400 hover:text-white py-2 transition"
          >
            ย้อนกลับ
          </button>
        </div>

        <p className="text-center text-zinc-500 text-xs mt-6">
          * เมื่อกดยืนยัน ระบบจะล็อคที่นั่งให้คุณเป็นเวลา 15 นาที เพื่อชำระเงิน
        </p>
      </div>
    </div>
  );
};

export default ConfirmBookingPage;
