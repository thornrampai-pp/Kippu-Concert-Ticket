"use client";

import { Showtime, Zone } from "@/src/types";
import React, { useState } from "react";

interface Props {
  zones: Zone[] | undefined;
  showTimes: Showtime[] | undefined; 
  selectedShowTimeId: number | null; 
}

const ZoneRemain = ({ zones, showTimes, selectedShowTimeId }: Props) => {
  const [openZoneId, setOpenZoneId] = useState<number | null>(null);

  if (!zones || zones.length === 0) {
    return <div className="text-zinc-400">No zones</div>;
  }

  //  ดึงข้อมูลรอบที่เลือกมาเก็บไว้
  const currentShow = showTimes?.find(
    (st) => st.showtime_id === selectedShowTimeId,
  );

  return (
    <div className="space-y-4">
      {zones.map((zone) => {
        //  หาจำนวนที่นั่งว่างของโซนนี้ในรอบที่เลือก
        const avail = currentShow?.zones_availability?.find(
          (a) => a.zone_id === zone.zone_id,
        );
        const remaining = avail?.remaining ?? 0;
          const isOpen = openZoneId === zone.zone_id
        return (
          <div
            key={zone.zone_id}
            className="border border-zinc-700 rounded-xl overflow-hidden bg-zinc-800/30"
          >
            {/* ส่วนหัว (ปุ่มกดเปิด-ปิด) */}
            <button
              onClick={() => setOpenZoneId(isOpen ? null : zone.zone_id)}
              className="w-full flex justify-between items-center p-4 text-left hover:bg-zinc-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: zone.color }}
                />
                <span className="font-bold text-white">
                  Zone {zone.zone_name}
                </span>
              </div>
              <span
                className={`transform transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {/* ส่วนเนื้อหา */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen
                  ? "max-h-40 opacity-100 p-4 border-t border-zinc-700"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center w-full px-2">
                  <span className="text-zinc-400">ราคา</span>
                  <span className="text-white font-medium">
                    ฿{Number(zone.price).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full px-2">
                  <span className="text-zinc-400">สถานะที่นั่ง</span>
                  <span
                    className={`font-medium ${remaining > 0 ? "text-emerald-400" : "text-red-500"}`}
                  >
                    {remaining === 0
                      ? "เต็มแล้ว (Sold Out)"
                      : `${remaining.toLocaleString()} / ${zone.total_seats.toLocaleString()} ที่นั่งเหลืออยู่`}
                  </span>
                </div>

                {/* Progress Bar เล็กๆ ให้ดูง่าย */}
                <div className="w-full bg-zinc-700 h-1.5 rounded-full mt-2">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${(remaining / zone.total_seats) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ZoneRemain;
