"use client";

import { Stage, Layer, Rect, Text, Group } from "react-konva";
import { ZoneInput } from "../types";
import { KonvaEventObject } from "konva/lib/Node";

interface Props {
  zones: ZoneInput[];
  onZoneChange: (updatedZones: ZoneInput[]) => void;
}

const SeatMapEditor = ({ zones, onZoneChange }: Props) => {
  const handleDragEnd = (index: number, e: KonvaEventObject<DragEvent>) => {
    const updated = [...zones];
    updated[index] = {
      ...updated[index],
      pos_x: Math.round(e.target.x()), // ปัดเศษพิกัด
      pos_y: Math.round(e.target.y()),
    };
    onZoneChange(updated);
  };

  return (
    <div>
      <h3 className="text-black mb-4 font-bold">
        Layout Preview (Drag to set position)
      </h3>
      <div className="bg-white rounded-lg overflow-hidden">
        <Stage width={800} height={400}>
          <Layer>
            {/* พื้นที่ Stage จำลอง */}
            <Rect width={800} height={60} fill="#333" />
            <Text
              text="STAGE"
              width={800}
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
                />
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default SeatMapEditor;
