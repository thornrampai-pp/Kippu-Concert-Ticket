"use client";
import ConcertForm from "@/src/components/ConcertForm";
import Header from "@/src/components/Header";
import SeatMapEditor from "../../../components/SeatMapEditor";
import { useState } from "react";
import ZonesForm from "@/src/components/ZonesForm";
import { CreateConcertInput } from "@/src/types";
import { useCreateConcert, useImageUpload } from "@/src/hooks/useConcert";


export default function Page() {

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
    const { handleCreateConcert, loading, } = useCreateConcert();

    const imageUpload = useImageUpload(); // กล่องเก็บรูปอยู่ที่นี่

    const onSubmit = async () => {
      // ดึงไฟล์จากกล่องที่นี่ แล้วอัปโหลดก่อนสร้าง Concert
      await handleCreateConcert(concertData, imageUpload.uploadAllImages);
    };

   
  return (
    <div className="min-h-screen bg-zinc-900">
      <Header />
      <h1 className="flex items-center justify-start text-white pt-5 pl-5 pb-5 text-4xl font-bold">
        Create Concert
      </h1>
      <div className="space-y-5">
        <div className="bg-gray-300 max-w-5xl  p-4 rounded-lg mr-10 ml-10">
          <p className="text-black font-bold text-2xl">Concert Info</p>
          <ConcertForm
            concertData={concertData}
            setConcertData={setConcertData}
            imageUploadProps={imageUpload}
          />
        </div>
        <div className="bg-gray-300 max-w-5xl  p-4 rounded-lg mr-10 ml-10">
          <p className="text-black font-bold text-2xl">Zone Info</p>
          <ZonesForm
            zones={concertData.zones}
            setConcertData={setConcertData}
          />
        </div>
        <div className="bg-gray-300 max-w-5xl  p-4 rounded-lg mr-10 ml-10">
          <p className="text-black font-bold text-2xl">Seat Map</p>
          <SeatMapEditor
            zones={concertData.zones}
            onZoneChange={(zones) =>
              setConcertData((prev) => ({
                ...prev,
                zones,
              }))
            }
          />
        </div>
        <div className="flex justify-end mt-6 mr-10">
          <button
            onClick={onSubmit}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold px-6 py-3 rounded-lg"
          >
            {loading ? "Creating..." : "Create Concert"}
          </button>
        </div>
        <div className="w-50 h-50"></div>
      </div>
    </div>
  );
}
