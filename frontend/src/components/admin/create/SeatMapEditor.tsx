"use client";

import { Stage, Layer, Rect, Text, Group } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useRef, useState } from "react";
import { ZoneInput } from "@/src/types";

interface Props {
  zones: ZoneInput[];
  onZoneChange: (updatedZones: ZoneInput[]) => void;
  isEdit?: boolean;
}

const SeatMapEditor = ({ zones, onZoneChange, isEdit = false }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, scale: 1 });

  // ฟังก์ชันคำนวณขนาด Stage ให้ Responsive
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const baseWidth = 800; // ความกว้างอ้างอิงที่เราออกแบบไว้
        const newScale = containerWidth / baseWidth;

        setDimensions({
          width: containerWidth,
          scale: newScale > 1 ? 1 : newScale, // ไม่ให้ขยายใหญ่เกิน 800px ต้นฉบับ
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDragEnd = (index: number, e: KonvaEventObject<DragEvent>) => {
    const updated = [...zones];
    // สำคัญ: ต้องหารด้วย scale เพื่อให้พิกัดในฐานข้อมูลเป็นค่ามาตรฐาน (base 800px)
    updated[index] = {
      ...updated[index],
      pos_x: Math.round(e.target.x() / dimensions.scale),
      pos_y: Math.round(e.target.y() / dimensions.scale),
    };
    onZoneChange(updated);
  };

  return (
    <div>
      <h3 className="text-black mb-4 font-bold">
        Layout Preview (Drag to set position)
      </h3>
      {/* 1. หุ้มด้วย Ref container */}
      <div
        ref={containerRef}
        className="bg-white rounded-lg overflow-hidden w-full border border-zinc-300"
      >
        <Stage
          width={dimensions.width}
          height={400 * dimensions.scale}
          scaleX={dimensions.scale}
          scaleY={dimensions.scale}
        >
          <Layer>
            {/* พื้นที่ Stage จำลอง */}
            <Rect width={1000} height={60} fill="#333" />
            <Text
              text="STAGE"
              width={1000}
              y={20}
              align="center"
              fill="white"
              fontStyle="bold"
            />

            {zones.map((zone, index) => (
              <Group
                key={index}
                x={zone.pos_x || 50}
                y={zone.pos_y || 100}
                draggable
                onDragEnd={(e) => handleDragEnd(index, e)}
              >
                <Rect
                  width={zone.width || 120}
                  height={zone.height || 80}
                  fill={zone.color || "#3b82f6"}
                  cornerRadius={5}
                  stroke="#fff"
                  strokeWidth={2}
                />
                <Text
                  text={`${zone.zone_name}\n${zone.price} THB`}
                  width={zone.width || 120}
                  height={zone.height || 80}
                  align="center"
                  verticalAlign="middle"
                  fill="white"
                  fontSize={14}
                />
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>
      <p className="text-xs text-zinc-500 mt-2 italic">
        * Mobile: แตะค้างเพื่อลากวางโซน
      </p>
    </div>
  );
};

export default SeatMapEditor;
