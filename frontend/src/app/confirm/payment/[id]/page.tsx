"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { bookingService } from "@/src/services/bookingService";
import { useOmisePayment } from "@/src/hooks/usePayment";
import { Booking } from "@/src/types";

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);

  // 1. ดึงข้อมูลการจอง
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await bookingService.getBookingById(Number(id));
        setBooking(data);
      } catch (err) {
        router.push("/");
      }
    };
    fetchBooking();
  }, [id, router]);

  // 2. เรียกใช้ Hook (ส่ง ID และยอดเงินเข้าไป)
  // ใช้ค่า 0 เป็นค่าเริ่มต้นจนกว่า booking จะโหลดเสร็จ
  const { handleCreditCard, handlePromptPay, isProcessing } = useOmisePayment(
    Number(id),
    booking?.total_price || 0,
  );

  if (!booking)
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="animate-pulse">กำลังดึงข้อมูลการจอง...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center p-6">
      <div className="max-w-md w-full bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-emerald-400">ชำระเงิน</h1>

        <div className="mb-8 p-6 bg-black/40 rounded-2xl border border-white/5">
          <p className="text-zinc-500 text-sm">ยอดที่ต้องชำระ</p>
          <p className="text-3xl font-bold text-white">
            ฿{Number(booking.total_price).toLocaleString()}
          </p>
        </div>

        <div className="space-y-4">
          {/* 3. ใช้ฟังก์ชันจาก Hook โดยตรง */}
          <button
            onClick={handleCreditCard}
            disabled={isProcessing}
            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isProcessing ? "กำลังประมวลผล..." : "💳 บัตรเครดิต / เดบิต"}
          </button>

          {/* <button
            onClick={handlePromptPay}
            disabled={isProcessing}
            className="w-full bg-zinc-800 text-white font-bold py-4 rounded-xl border border-zinc-700 hover:bg-zinc-700 transition active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isProcessing ? "กำลังสร้าง QR..." : "📱 Thai QR PromptPay"}
          </button> */}
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800">
          <p className="text-zinc-500 text-[10px] text-center uppercase tracking-widest">
            Securely processed by Omise
          </p>
        </div>
      </div>
    </div>
  );
}
