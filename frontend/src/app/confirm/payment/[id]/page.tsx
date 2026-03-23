"use client";
import { useParams,  } from "next/navigation";
import { useOmisePayment } from "@/src/hooks/usePayment";
import { useBookingStatus } from "@/src/hooks/useBooking";

export default function PaymentPage() {
  const { id } = useParams();

  const { booking, loading } = useBookingStatus(Number(id));

  const { handleCreditCard, isProcessing } = useOmisePayment(
    Number(id),
    booking?.total_price || 0,
  );

  if (loading || !booking) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  }
  
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
            {isProcessing ? "process..." : "💳 บัตรเครดิต / เดบิต"}
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
