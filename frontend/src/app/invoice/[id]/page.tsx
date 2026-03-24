"use client";
import { useBookingStatus } from "@/src/hooks/useBooking";
import { BookingItem } from "@/src/types";
import { Printer, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { booking, loading } = useBookingStatus(Number(params.id));

  if (loading)
     <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
     </div>;
    
  if (!booking)
    return <div className="p-10 text-center">Invoice not found.</div>;

  const invoice = booking.invoices?.[0];

  return (
    <div className="min-h-screen bg-zinc-100 py-10 print:bg-white print:py-0">
      {/* Control Panel - ซ่อนเวลาพิมพ์ */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-600 hover:text-black transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-black transition-all"
        >
          <Printer size={20} /> Print Invoice
        </button>
      </div>

      {/* Invoice Card */}
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl p-12 print:shadow-none print:rounded-none">
        <div className="flex justify-between items-start border-b pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-zinc-900">
              KIPPU.
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Official Ticket Merchant
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-zinc-900">INVOICE</h2>
            <p className="text-zinc-500 font-mono text-sm">
              {invoice?.invoice_number || "N/A"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 py-8 text-sm">
          <div>
            <p className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold mb-2">
              Billing To
            </p>
            <p className="font-bold text-zinc-900">
              User ID: {booking.user_id}
            </p>
            <p className="text-zinc-500">
              Status:{" "}
              <span className="text-amber-600 font-bold">{booking.status}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold mb-2">
              Dates
            </p>
            <p className="text-zinc-900">
              Issued: {new Date(booking.created_at).toLocaleDateString("th-TH")}
            </p>
            <p className="text-rose-600 font-bold italic">
              Due: {new Date(invoice!.due_date).toLocaleString("th-TH")}
            </p>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="text-left border-b-2 border-zinc-900 text-sm uppercase tracking-wider">
              <th className="py-4">Description</th>
              <th className="py-4">Seat Info</th>
              <th className="py-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-zinc-800">
            {booking.booking_items?.map((item: BookingItem) => (
              <tr
                key={item.booking_item_id}
                className="border-b border-zinc-100"
              >
                <td className="py-6">
                  <p className="font-bold text-lg">
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
                  <span className="bg-zinc-100 px-2 py-1 rounded text-xs">
                    Zone {item.availability?.seat?.zone?.zone_name} -{" "}
                    {item.availability?.seat?.seat_number}
                  </span>
                </td>
                <td className="py-6 text-right font-bold text-lg">
                  ฿{Number(item.price).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end pt-6">
          <div className="w-full max-w-[240px]">
            <div className="flex justify-between items-center text-2xl font-black border-t-4 border-zinc-900 pt-4">
              <span>Total Amount</span>
              <span>฿{Number(booking.total_price).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-dashed border-zinc-200 text-center text-zinc-400 text-[10px]">
          <p>
            ขอบคุณที่ใช้บริการ KIPPU.
            กรุณาชำระเงินภายในเวลาที่กำหนดเพื่อรักษาสิทธิ์ที่นั่งของท่าน
          </p>
        </div>
      </div>
    </div>
  );
}
