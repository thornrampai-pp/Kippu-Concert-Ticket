import React, { useEffect } from "react";
import { useConcertDates, useImageUpload } from "../../../hooks/useConcert";
import Image from "next/image";
import { CreateConcertInput, ImageFile } from "../../../types";

interface ImageUploadProps {
  images: ImageFile[]; 
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
  isUploading: boolean;
  uploadAllImages: () => Promise<string[]>;
}
interface Props {
  concertData: CreateConcertInput;
  setConcertData: React.Dispatch<React.SetStateAction<CreateConcertInput>>;
  imageUploadProps: ImageUploadProps;
  isEdit?: boolean;
}


const ConcertForm = ({
  concertData,
  setConcertData,
  imageUploadProps,
  isEdit = false,
}: Props) => {
  
  const { dates, addDate, removeDate, setDates } = useConcertDates();
  const { images, handleImageChange, removeImage } = imageUploadProps

  useEffect(() => {
    if (isEdit && concertData.show_times) {
      // แปลงวันที่ให้อยู่ในรูปแบบ datetime-local (yyyy-MM-ddThh:mm)
      const formattedDates = concertData.show_times.map((d) =>
        new Date(d).toISOString().slice(0, 16),
      );
      setDates(formattedDates);
    }
  }, []);

  useEffect(() => {
    setConcertData((prev) => ({
      ...prev,
      show_times: dates,
    }));
  }, [dates, setConcertData]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
        <div className="w-full md:flex-1 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-2 border-dashed border-zinc-400 p-4 rounded-xl">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative aspect-video rounded-lg overflow-hidden group border border-zinc-200"
              >
                <Image
                  src={img.preview}
                  fill
                  alt={`Preview ${index}`}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}

            {/* ปุ่มสำหรับกดเลือกรูปเพิ่ม */}
            <label className="flex flex-col items-center justify-center aspect-video border-2 border-dotted border-zinc-500 rounded-lg cursor-pointer hover:bg-zinc-900 transition">
              <span className="text-3xl text-zinc-500">+</span>
              <span className="text-xs text-zinc-500">Add Image</span>
              <input
                type="file"
                multiple // 👈 สำคัญ: ต้องใส่เพื่อให้เลือกหลายรูปพร้อมกันได้
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <div className="space-y-2">
            Sale time
            <input
              type="datetime-local"
              className="w-full p-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2"
              value={concertData.sale_start_time}
              onChange={(e) =>
                setConcertData({
                  ...concertData,
                  sale_start_time: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <p>Concert Date</p>

              <button
                onClick={addDate}
                className="bg-gray-500 text-white w-6 h-6 flex items-center justify-center rounded-sm"
              >
                +
              </button>
            </div>

            {dates.map((date, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => {
                    const newDates = [...dates];
                    newDates[index] = e.target.value;
                    setDates(newDates);
                  }}
                  className="flex-1 w-full  p-2 bg-gray-100 rounded-lg"
                />

                <button
                  onClick={() => removeDate(index)}
                  className="bg-red-500 w-6 h-6 text-white rounded flex items-center justify-center"
                >
                  x
                </button>
              </div>
            ))}
          </div>

          <div>
            <p> Is Visible</p>
            <button
              onClick={() =>
                setConcertData({
                  ...concertData,
                  is_visible: !concertData.is_visible,
                })
              }
              className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                concertData.is_visible ? "bg-black" : "bg-gray-400"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                  concertData.is_visible ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-3">
          <div className="space-y-1">
            <p>Concert Name</p>
            <input
              type="text"
              className="w-full p-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2"
              value={concertData.concert_name}
              onChange={(e) =>
                setConcertData({
                  ...concertData,
                  concert_name: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1">
            <p>Concert Location</p>
            <input
              type="text"
              className="w-full p-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2"
              value={concertData.location}
              onChange={(e) =>
                setConcertData({
                  ...concertData,
                  location: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1">
            <p>Concert Detail</p>
            <input
              type="text"
              className="w-full p-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2"
              value={concertData.concert_detail}
              onChange={(e) =>
                setConcertData({
                  ...concertData,
                  concert_detail: e.target.value,
                })
              }
            />
          </div>

          <div>
            <p>Max tickets per user</p>
            <input
              type="number"
              min="1"
              className="w-full p-2 bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2"
              value={
                concertData.max_tickets_per_user === 0
                  ? ""
                  : concertData.max_tickets_per_user
              }
              
              onChange={(e) =>
                setConcertData({
                  ...concertData,
                  max_tickets_per_user: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcertForm;
