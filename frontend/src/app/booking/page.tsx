"use client";

import Link from "next/link";
import {
  Calendar,
  Ticket,
  ArrowRight,
  Clock,
  MapPin,
  Armchair,
  ChevronRight,
} from "lucide-react";
import { useMyBookings } from "@/src/hooks/useMybookings";
import { BookingItem } from "@/src/types";

export default function MyBookingsPage() {
  const { bookings, isLoading, error, hasBookings } = useMyBookings();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "PENDING":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <Ticket className="text-emerald-400" size={32} />
            </div>
            My Bookings
          </h1>
          <p className="text-zinc-500 mt-4 text-lg">
            จัดการการจองและดูตั๋วเข้าชมคอนเสิร์ตของคุณ
          </p>
        </div>

        {!hasBookings ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-800 rounded-[2.5rem] bg-zinc-900/20">
            <Ticket size={64} className="text-zinc-800 mb-6" />
            <p className="text-zinc-500 text-xl font-medium">
              คุณยังไม่มีประวัติการจอง
            </p>
            <Link
              href="/"
              className="mt-8 bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-2xl font-bold transition-all active:scale-95"
            >
              สำรวจคอนเสิร์ตเลย
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.booking_id}
                className="group relative bg-zinc-900 border border-zinc-800 rounded-4xl overflow-hidden hover:border-zinc-700 transition-all duration-300"
              >
                <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  {/* Left: Concert Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                      <span className="text-zinc-600 font-mono text-sm tracking-wider uppercase">
                        Order ID: #{booking.booking_id}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold group-hover:text-emerald-400 transition-colors">
                        {booking.concert?.concert_name || "Concert Name"}
                      </h2>
                      <div className="flex flex-wrap gap-y-2 gap-x-6 mt-3 text-zinc-400">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={16} className="text-emerald-500" />
                          {new Date(booking.created_at).toLocaleDateString(
                            "th-TH",
                            { dateStyle: "long" },
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={16} className="text-emerald-500" />
                          {booking.concert?.location || "Main Stadium"}
                        </div>
                      </div>
                    </div>

                    {/* Seat Summary */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {booking.booking_items?.map((item: BookingItem   ) => (
                        <div
                          key={item.booking_item_id}
                          className="flex items-center gap-2 bg-black/40 border border-white/5 px-3 py-1.5 rounded-xl text-xs"
                        >
                          <Armchair size={12} className="text-zinc-500" />
                          <span className="text-zinc-300 font-medium">
                            Zone {item.seat?.zone?.zone_name}
                          </span>
                          <span className="text-white font-bold">
                            {item.seat?.seat_number}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Price & Action */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 lg:min-w-[200px] border-t lg:border-t-0 lg:border-l border-zinc-800 pt-6 lg:pt-0 lg:pl-8">
                    <div className="text-left lg:text-right">
                      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">
                        Total Price
                      </p>
                      <p className="text-3xl font-black text-white italic">
                        ฿{Number(booking.total_price).toLocaleString()}
                      </p>
                    </div>

                    {booking.status === "PENDING" ? (
                      <Link
                        href={`/payment/${booking.booking_id}`}
                        className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-white/5"
                      >
                        PAY NOW <Clock size={20} />
                      </Link>
                    ) : (
                      <Link
                        href={`/booking/${booking.booking_id}/status`}
                        className="flex items-center gap-3 bg-zinc-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-zinc-700 transition-all border border-zinc-700 active:scale-95"
                      >
                        DETAILS <ChevronRight size={20} />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Decorative Bottom Bar */}
                {booking.status.toString() === "CONFIRMED" && (
                  <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
