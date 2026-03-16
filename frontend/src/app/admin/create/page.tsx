"use client";
import ConcertForm from "@/src/components/ConcertForm";
import Header from "@/src/components/Header";
import SeatMapEditor from "../../../components/SeatMapEditor";
import { useState } from "react";
import ZonesForm from "@/src/components/ZonesForm";
import { CreateConcertInput } from "@/src/types";
import { useCreateConcert, useImageUpload } from "@/src/hooks/useConcert";
import { useAdminGuard } from "@/src/hooks/useAuth";

export default function Page() {
  // ดึงค่า isAdmin มาใช้งาน
  const { isLoading: authLoading, isAdmin } = useAdminGuard();

  const [concertData, setConcertData] = useState<CreateConcertInput>({
    concert_name: "",
    image_url: [],
    concert_detail: "",
    location: "",
    is_visible: false,
    sale_start_time: "",
    max_tickets_per_user: 1,
    show_times: [],
    zones: [],
  });

  const { handleCreateConcert, loading } = useCreateConcert();
  const imageUpload = useImageUpload();

  const onSubmit = async () => {
    await handleCreateConcert(concertData, imageUpload.uploadAllImages);
  };

  // --- ส่วนการจัดการการแสดงผลเพื่อแก้หน้าขาว ---
  return (
    <div className="min-h-screen bg-zinc-900 pb-20">
      {/* 1. วาง Header ไว้ข้างนอกเสมอ เพื่อไม่ให้หน้าขาวตอนโหลด */}
      <Header />

      {
        authLoading ? (
          // 2. แสดงสถานะโหลดเฉพาะเนื้อหาข้างใน
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-white animate-pulse">Checking Access...</p>
          </div>
        ) : isAdmin ? (
          // 3. ถ้าเป็น Admin ถึงจะโชว์ฟอร์ม
          <>
            <div className="max-w-5xl mx-auto px-4">
              <h1 className="text-white py-8 text-4xl font-bold">
                Create Concert
              </h1>
            </div>
            <div className="space-y-5">
              <div className="bg-gray-300 max-w-5xl p-6 rounded-lg mx-4 md:mx-auto">
                <p className="text-black font-bold text-2xl">Concert Info</p>
                <ConcertForm
                  concertData={concertData}
                  setConcertData={setConcertData}
                  imageUploadProps={imageUpload}
                />
              </div>

              <div className="bg-gray-300 max-w-5xl p-6 rounded-lg mx-4 md:mx-auto">
                <p className="text-black font-bold text-2xl">Zone Info</p>
                <ZonesForm
                  zones={concertData.zones}
                  setConcertData={setConcertData}
                />
              </div>

              <div className="bg-gray-300 max-w-5xl p-6 rounded-lg mx-4 md:mx-auto">
                <p className="text-black font-bold text-2xl">Seat Map</p>
                <SeatMapEditor
                  zones={concertData.zones}
                  onZoneChange={(zones) =>
                    setConcertData((prev) => ({ ...prev, zones }))
                  }
                />
              </div>

              <div className="flex justify-end mt-6 max-w-5xl mx-auto px-4">
                <button
                  onClick={onSubmit}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold px-6 py-3 rounded-lg"
                >
                  {loading ? "Creating..." : "Create Concert"}
                </button>
              </div>
            </div>
          </>
        ) : null /* ถ้าไม่ใช่ Admin เดี๋ยว useAdminGuard จะ Redirect เอง */
      }
    </div>
  );
}
