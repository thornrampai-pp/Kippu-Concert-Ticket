"use client";
import { useBookingStatus } from "@/src/hooks/useBooking";
import { BookingItem } from "@/src/types";
import { CheckCircle2, Printer, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const { booking, loading } = useBookingStatus(Number(params.id));

  if (loading)
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
    
  if (!booking || booking.status !== "SUCCESS")
    return (
      <div className="p-10 text-center text-rose-500">
        ยังไม่มีข้อมูลการชำระเงิน
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 py-10 print:bg-white print:py-0 relative overflow-hidden">
      {/* ลายน้ำ PAID สำหรับพิมพ์ */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] -rotate-45 pointer-events-none select-none text-[200px] font-black">
        PAID
      </div>

      <div className="max-w-3xl mx-auto mb-6 flex justify-between print:hidden relative z-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-600 hover:text-black"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all"
        >
          <Printer size={20} /> Print Receipt
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl p-12 print:shadow-none border border-zinc-100 relative z-10">
        <div className="flex justify-between items-center border-b-4 border-emerald-500 pb-8">
          <div>
            <h1 className="text-4xl font-black text-zinc-900">RECEIPT.</h1>
            <div className="flex items-center gap-2 text-emerald-600 font-bold mt-1 uppercase tracking-widest text-xs">
              <CheckCircle2 size={14} /> Payment Successful
            </div>
          </div>
          <div className="text-right">
            <p className="text-zinc-400 text-[10px] font-bold uppercase mb-1">
              Receipt No.
            </p>
            <p className="font-mono font-bold text-zinc-900">
              RC-{booking.booking_id}
            </p>
          </div>
        </div>

        <div className="py-10 grid grid-cols-2 gap-8 border-b">
          <div>
            <p className="text-zinc-400 text-[10px] font-bold uppercase mb-2">
              Customer Info
            </p>
            <p className="text-zinc-900 font-bold leading-tight">
              User ID: {booking.user_id}
            </p>
            <p className="text-zinc-500 text-sm">
              Payment Method:{" "}
              {booking.payments?.[0]?.payment_method || "Omise Payment"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-zinc-400 text-[10px] font-bold uppercase mb-2">
              Transaction Details
            </p>
            <p className="text-zinc-900 font-bold">
              Date: {new Date().toLocaleDateString("th-TH")}
            </p>
            <p className="text-zinc-500 text-xs font-mono">
              ID: {booking.payments?.[0]?.transaction_id}
            </p>
          </div>
        </div>

        <div className="py-8">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b">
                <th className="pb-4">Concert / Showtime</th>
                <th className="pb-4">Seating</th>
                <th className="pb-4 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {booking.booking_items?.map((item: BookingItem) => (
                <tr
                  key={item.booking_item_id}
                  className="border-b border-zinc-50 last:border-0"
                >
                  <td className="py-6">
                    <p className="font-black text-zinc-900 text-xl">
                      {booking.concert?.concert_name}
                    </p>
                    <p className="text-zinc-500 text-xs mt-1">
                      {item.availability?.showtime?.show_date
                        ? new Date(
                            item.availability.showtime.show_date,
                          ).toLocaleString("th-TH", {
                            dateStyle: "long",
                            timeStyle: "short",
                          }) + " น."
                        : "ไม่ระบุวันแสดง"}
                    </p>
                  </td>
                  <td className="py-6">
                    <div className="text-sm font-bold text-zinc-800">
                      Zone {item.availability?.seat?.zone?.zone_name}
                    </div>
                    <div className="text-zinc-500 text-xs">
                      Seat {item.availability?.seat?.seat_number}
                    </div>
                  </td>
                  <td className="py-6 text-right font-black text-xl text-zinc-900">
                    ฿{Number(item.price).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-8 text-white flex justify-between items-center">
          <div>
            <p className="text-zinc-400 text-[10px] font-bold uppercase mb-1">
              Total Paid
            </p>
            <p className="text-xs text-zinc-500 italic">Included VAT & Fees</p>
          </div>
          <div className="text-4xl font-black italic underline decoration-emerald-500 underline-offset-8">
            ฿{Number(booking.total_price).toLocaleString()}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
            Powered by KIPPU. Official System
          </p>
        </div>
      </div>
    </div>
  );
}
