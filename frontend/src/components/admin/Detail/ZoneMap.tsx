"use client";

import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect, Text, Group } from "react-konva";
import { Showtime, Zone } from "@/src/types";

interface Props {
  zones: Zone[] | undefined;
  showTimes: Showtime[] | undefined;
  selectedShowTimeId: number | null;
}

const ZoneMap = ({ zones, showTimes, selectedShowTimeId }: Props) => {
  const [stageSize, setStageSize] = useState({ width: 800, height: 400 });
  const [hoveredZoneId, setHoveredZoneId] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById("map-container");
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetWidth * 0.5,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!zones || zones.length === 0) {
    return (
      <div className="text-zinc-500 text-center p-10">ไม่มีข้อมูลแผนผัง</div>
    );
  }

  // ✅ ดึงข้อมูลรอบที่เลือกมาเก็บไว้
  const currentShow = showTimes?.find(
    (st) => st.showtime_id === selectedShowTimeId,
  );

  const scale = stageSize.width / 800;

  return (
    <div
      id="map-container"
      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden relative"
    >
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
      >
        <Layer>
          {/* STAGE */}
          <Rect
            x={200}
            y={20}
            width={400}
            height={40}
            fill="#27272a"
            cornerRadius={5}
          />
          <Text
            x={200}
            y={32}
            width={400}
            text="STAGE"
            align="center"
            fill="#71717a"
            fontSize={14}
            fontStyle="bold"
          />

          {zones.map((zone) => {
            const isHovered = hoveredZoneId === zone.zone_id;

            // ✅ หาจำนวนที่นั่งว่างของโซนนี้ในรอบที่เลือก
            const avail = currentShow?.zones_availability?.find(
              (a) => a.zone_id === zone.zone_id,
            );
            const remaining = avail?.remaining ?? 0;
            const isSoldOut = remaining === 0;

            return (
              <Group
                key={zone.zone_id}
                onMouseEnter={() => {
                  document.body.style.cursor = "pointer";
                  setHoveredZoneId(zone.zone_id);
                }}
                onMouseLeave={() => {
                  document.body.style.cursor = "default";
                  setHoveredZoneId(null);
                }}
                onClick={() =>
                  !isSoldOut && alert(`เลือกโซน: ${zone.zone_name}`)
                }
              >
                <Rect
                  x={zone.pos_x}
                  y={zone.pos_y}
                  width={zone.width}
                  height={zone.height}
                  // ✅ ถ้าหมดให้เปลี่ยนเป็นสีเข้ม (Sold out)
                  fill={isSoldOut ? "#18181b" : zone.color}
                  stroke={isHovered ? "white" : "#3f3f46"}
                  strokeWidth={isHovered ? 2 : 1}
                  cornerRadius={4}
                  opacity={isHovered ? 1 : 0.8}
                />
                <Text
                  x={zone.pos_x}
                  y={zone.pos_y + zone.height / 2 - 6}
                  width={zone.width}
                  text={zone.zone_name}
                  align="center"
                  fill={isSoldOut ? "#52525b" : "white"}
                  fontSize={12}
                  fontStyle="bold"
                  listening={false}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {/* Tooltip */}
      {hoveredZoneId && (
        <div className="absolute top-4 right-4 bg-black/80 p-3 rounded-lg border border-zinc-700 pointer-events-none transition-opacity">
          {(() => {
            const z = zones.find((item) => item.zone_id === hoveredZoneId);
            const avail = currentShow?.zones_availability?.find(
              (a) => a.zone_id === hoveredZoneId,
            );
            const remaining = avail?.remaining ?? 0;

            return (
              <div className="text-xs">
                <p className="font-bold text-white text-sm mb-1">
                  Zone {z?.zone_name}
                </p>
                <p className="text-zinc-400">
                  ราคา: ฿{Number(z?.price).toLocaleString()}
                </p>
                <p
                  className={
                    remaining > 0 ? "text-emerald-400" : "text-red-500"
                  }
                >
                  คงเหลือ: {remaining} / {z?.total_seats}
                </p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ZoneMap;
