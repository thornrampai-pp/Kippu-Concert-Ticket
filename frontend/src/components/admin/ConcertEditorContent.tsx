"use client";

import { useState } from "react";

import { CreateConcertInput } from "@/src/types";
import {
  useCreateConcert,
  useUpdateConcert,
  useImageUpload,
} from "@/src/hooks/useConcert";
import ConcertForm from "./create/ConcertForm";
import ZonesForm from "./create/ZonesForm";
import SeatMapEditor from "./create/SeatMapEditor";

type Props = {
  initialData: CreateConcertInput;
  isEdit: boolean;
  id?: string;
};

export default function ConcertEditorContent({
  initialData,
  isEdit,
  id,
}: Props) {
 

  const [concertData, setConcertData] =
    useState<CreateConcertInput>(initialData);


  const { handleCreateConcert, loading: loadingCreate } = useCreateConcert();
  const { handleUpdateConcert, loading: loadingUpdate } = useUpdateConcert();
  const imageUpload = useImageUpload(initialData.image_url);


  const loading = loadingCreate || loadingUpdate;

 
  const onSubmit = async () => {
    try {
      if (isEdit) {
        if (!id) {
          console.error("Missing id");
          return;
        }

        await handleUpdateConcert(id, concertData, imageUpload.uploadAllImages);
      } else {
        await handleCreateConcert(concertData, imageUpload.uploadAllImages);
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  return (
    <div className="space-y-5">
      {/* 🎤 Concert Info */}
      <div className="bg-gray-300 max-w-5xl p-6 rounded-lg mx-4 md:mx-auto">
        <p className="text-black font-bold text-2xl">Concert Info</p>
        <ConcertForm
          concertData={concertData}
          setConcertData={setConcertData}
          imageUploadProps={imageUpload}
          isEdit={isEdit}
        />
      </div>

      <div className="bg-gray-300 max-w-5xl p-6 rounded-lg mx-4 md:mx-auto">
        <p className="text-black font-bold text-2xl">Zone Info</p>
        <ZonesForm
          zones={concertData.zones}
          setConcertData={setConcertData}
          isEdit={isEdit}
        />
      </div>

      <div className="bg-gray-300 max-w-5xl p-6 rounded-lg mx-4 md:mx-auto">
        <p className="text-black font-bold text-2xl">Seat Map</p>
        <SeatMapEditor
          zones={concertData.zones}
          onZoneChange={(zones) =>
            setConcertData((prev) => ({
              ...prev,
              zones,
            }))
          }
          isEdit={isEdit}
        />
      </div>


      <div className="flex justify-end mt-6 max-w-5xl mx-auto px-4 pb-10">
        <button
          onClick={onSubmit}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold px-6 py-3 rounded-lg"
        >
          {loading ? "Saving..." : isEdit ? "Update Concert" : "Create Concert"}
        </button>
      </div>
    </div>
  );
}
