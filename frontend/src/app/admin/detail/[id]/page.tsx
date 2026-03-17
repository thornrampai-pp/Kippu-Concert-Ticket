"use client";

import { useParams, useRouter } from "next/navigation";
import { useConcertById } from "@/src/hooks/useConcert";
import Header from "@/src/components/Header";
import Image from "next/image";
import { IoArrowBack } from "react-icons/io5";
import ZoneRemain from "@/src/components/admin/Detail/ZoneRemain";
import ZoneMap from "@/src/components/admin/Detail/ZoneMap";
import {  useState } from "react";

const ConcertDetailPage = () => {
  const router = useRouter();

  const params = useParams();
  const id = params.id as string;

  const { concert, isLoading, error } = useConcertById(id);
 

  // ✅ 2. เมื่อโหลดข้อมูลเสร็จ ให้ set รอบแรกเป็นค่าเริ่มต้น
const [selectedShowTimeId, setSelectedShowTimeId] = useState<number | null>(
  null,
);

 const activeShowTimeId =
   selectedShowTimeId ?? concert?.show_times?.[0]?.showtime_id;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  }

  // 2. จัดการสถานะ Error หรือไม่พบข้อมูล
  if (error || !concert) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center text-white">
        <p className="text-xl mb-4">{error || "ไม่พบข้อมูลคอนเสิร์ต"}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-zinc-700 rounded-lg"
        >
          กลับไปหน้าหลัก
        </button>
      </div>
    );
  }

  // 3. แสดงผลข้อมูลจริง
  return (
    <div className="min-h-screen bg-zinc-900 pb-20">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        {/* Navigation */}
        <IoArrowBack
          size={30}
          onClick={() => router.back()}
          className="mb-6 text-zinc-400 hover:text-white transition"
        />

        {/* ข้อมูลคอนเสิร์ต */}
        <div className="mb-5 flex flex-row justify-between">
          <div>
            <h1 className="text-white text-3xl font-bold">
              {concert.concert_name}-{concert.is_visible ? "Sale now" : "Close"}
            </h1>
          </div>
          <div>
            <button
              onClick={() => router.push(`/admin/concert/${concert.concert_id}`)}
              className="bg-zinc-500 text-black px-4 py-2 rounded-lg"
            >
              Edit Concert
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="relative w-full md:w-80 h-100 rounded-2xl overflow-hidden shadow-xl ">
            <Image
              src={concert.image_url[0]}
              alt={concert.concert_name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="text-white text-1xl space-y-2  ">
            <div className="space-y-2">
              <p className="text-2xl">Concert Detail: </p>
              <p className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-3">
                {concert.concert_detail}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-white text-2xl">Concert Location: </p>
              <p className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-3">
                {concert.location}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-white text-2xl">Sale Date: </p>
              <p className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white mb-3">
                {new Date(concert.sale_start_time).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-white text-2xl">Select Show Time: </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {concert.show_times?.map((item) => (
                  <button
                    key={item.showtime_id}
                    onClick={() => setSelectedShowTimeId(item.showtime_id)}
                    className={`px-4 py-3 rounded-lg border transition-all ${
                      activeShowTimeId === item.showtime_id
                        ? "bg-white text-black border-white"
                        : "bg-zinc-800 text-white border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    {new Date(item.show_date).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8">
          <h2 className="text-white text-2xl mb-4">Seat Availability</h2>
          <ZoneMap
            zones={concert.zones}
            showTimes={concert.show_times} // ส่งเพิ่ม
            selectedShowTimeId={selectedShowTimeId}
          />
          <div className="mt-6">
            <ZoneRemain
              zones={concert.zones}
              showTimes={concert.show_times} // ส่งเพิ่ม
              selectedShowTimeId={selectedShowTimeId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcertDetailPage;
