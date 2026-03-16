import React, { useState } from "react";
import { CreateConcertInput, ZoneInput } from "../types";

interface Props {
  zones: ZoneInput[];
  setConcertData: React.Dispatch<React.SetStateAction<CreateConcertInput>>;
}

const ZonesForm = ({ zones, setConcertData }: Props) => {
  const [zoneInput, setZoneInput] = useState<ZoneInput>({
    zone_name: "",
    price: 0,
    total_seats: 0, 
    color:'',
    row_count: 0,
    seat_per_row: 0,
    pos_x: 50,
    pos_y: 100,
    width: 120,
    height: 80,
  });

  const addZone = () => {
    if (!zoneInput.zone_name) return;

    
    const calculatedTotalSeats = zoneInput.row_count * zoneInput.seat_per_row;

    const finalZone = {
      ...zoneInput,
      total_seats: calculatedTotalSeats,
    };

    setConcertData((prev) => ({
      ...prev,
      zones: [...prev.zones, finalZone], // 👈 ใช้ finalZone ที่คำนวณแล้ว
    }));

    // Reset ค่ากลับเป็นเริ่มต้น
    setZoneInput({
      zone_name: "",
      price: 0,
      total_seats: 0,
      color: "#3b82f6",
      row_count: 0,
      seat_per_row: 0,
      pos_x: 50,
      pos_y: 100,
      width: 120,
      height: 80,
    });
  };
  const removeZone = (index: number) => {
    setConcertData((prev) => ({
      ...prev,
      zones: prev.zones.filter((_, i) => i !== index),
    }));
  };
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p>Zone name</p>
        <input
          value={zoneInput.zone_name}
          onChange={(e) =>
            setZoneInput({ ...zoneInput, zone_name: e.target.value })
          }
          type="text"
          className="w-full p-2 bg-gray-100 rounded-lg"
        />
      </div>

      <div className="space-y-1">
        <p>Price</p>
        <input
          value={zoneInput.price}
          onChange={(e) =>
            setZoneInput({ ...zoneInput, price: Number(e.target.value) })
          }
          type="number"
          min={1}
          className="w-full p-2 bg-gray-100 rounded-lg"
        />
      </div>

      <div className="flex gap-2">
        <div className="space-y-1 flex-1">
          <p>Color</p>
          <input
            value={zoneInput.color}
            onChange={(e) =>
              setZoneInput({
                ...zoneInput,
                color: e.target.value,
              })
            }
            type="color"
            min={1}
            className="w-full p-2 bg-gray-100 rounded-lg"
          />
        </div>

        <div className="space-y-1 flex-1">
          <p>Row Count</p>
          <input
            value={zoneInput.row_count}
            onChange={(e) =>
              setZoneInput({
                ...zoneInput,
                row_count: Number(e.target.value),
              })
            }
            type="number"
            min={1}
            className="w-full p-2 bg-gray-100 rounded-lg"
          />
        </div>

        <div className="space-y-1 flex-1">
          <p>Seat Per Row</p>
          <input
            value={zoneInput.seat_per_row}
            onChange={(e) =>
              setZoneInput({
                ...zoneInput,
                seat_per_row: Number(e.target.value),
              })
            }
            type="number"
            min={1}
            className="w-full p-2 bg-gray-100 rounded-lg"
          />
        </div>
      </div>

      {/* ปุ่มเพิ่ม zone */}
      <button
        type="button"
        onClick={addZone}
        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
      >
        + Add Zone
      </button>

      {/* แสดง zones ที่เพิ่มแล้ว */}
      {zones.length > 0 && (
        <div className="pt-4">
          <p className="font-bold border-b pb-2">
            Zones Added ({zones.length})
          </p>

          <div className="space-y-2 mt-2">
            {zones.map((zone, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border-l-4"
                style={{ borderLeftColor: zone.color || "#ccc" }} // แสดงสีของโซนที่ขอบด้านซ้าย
              >
                <div className="flex flex-col">
                  <span className="font-bold text-zinc-900">
                    {zone.zone_name}
                  </span>
                  <span className="text-xs text-zinc-500 italic">
                    {zone.price.toLocaleString()} THB |{" "}
                    {zone.row_count * zone.seat_per_row} Seats
                  </span>
                </div>

                {/* ปุ่มลบ (Remove Button) */}
                <button
                  type="button"
                  onClick={() => removeZone(index)} // 👈 เรียกฟังก์ชันที่คุณเขียนไว้
                  className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                  title="Remove zone"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ZonesForm;
