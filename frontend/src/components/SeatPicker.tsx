import { useEffect, useState } from "react";
import { Circle, Layer, Stage, Rect, Text, Group } from "react-konva"; // ✅ เพิ่ม Rect, Text, Group
import { Concert, PendingBooking, Seat, Zone } from "../types";
import { useZone } from "../hooks/useConcert";
import { useRouter } from "next/navigation";
import { useBooking } from "../hooks/useBooking";

interface SeatPickerProps {
  concert:  Concert
  zone: Zone;
  showtimeId: number | null;
  // maxTickets: number;
  onCancel: () => void;
}

const SeatPicker = ({ concert,zone, showtimeId, onCancel }: SeatPickerProps) => {
  const { zoneLayout, isLoading, fetchZoneLayout } = useZone();
  const router = useRouter();
  const { saveBooking } = useBooking();

  // ใน SeatPicker.tsx
  const [selectedSeats, setSelectedSeats] = useState<
    { id: number; name: string }[]
  >([]);

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeats((prev) => {
      const isSelected = prev.find((s) => s.id === seat.seat_id);
      if (isSelected) {
        return prev.filter((s) => s.id !== seat.seat_id);
      }
      if (prev.length >= concert.max_tickets_per_user) {
        alert(`จองได้สูงสุด ${concert.max_tickets_per_user} ที่นั่ง`);
        return prev;
      }
      return [...prev, { id: seat.seat_id, name: seat.seat_number }];
    });
  };

  const handleConfirm = () => {
    // 1. ค้นหารอบการแสดงที่ User เลือกจาก ID เพื่อเอาวันเวลามาโชว์
    const selectedShowtime = concert.show_times?.find(
      (s) => s.showtime_id === showtimeId,
    );

    // 2. แปลงวันที่ให้เป็น Format ที่อ่านง่าย (Human Readable)
    const formattedDate = selectedShowtime
      ? new Date(selectedShowtime.show_date).toLocaleString("th-TH", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "ไม่ระบุรอบการแสดง";

    // 3. บันทึกลง SessionStorage
    saveBooking({
      concertId: concert.concert_id,
      concertName: concert.concert_name,
      concertImage: concert.image_url?.[0] || "",
      concertLocation: concert.location || "สถานที่จัดงาน", // ✅ ใส่ตาม Interface
      showtime: formattedDate,
      // เพิ่ม field นี้ใน Interface ด้วยจะดีมาก เพื่อเอาไว้โชว์ที่หน้า Confirm
      // showtimeDate: formattedDate,
      zoneId: zone.zone_id,
      zoneName: zone.zone_name,
      price: Number(zone.price),
      seats: selectedSeats,
      totalPrice: selectedSeats.length * Number(zone.price),
    });

    router.push("/confirm");
  };
  useEffect(() => {
    if (zone.zone_id && showtimeId) {
      fetchZoneLayout(zone.zone_id, showtimeId);
    }
  }, [zone.zone_id, showtimeId, fetchZoneLayout]);

  if (isLoading)
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white"></div>
      </div>
    );
  if (!zoneLayout || !zoneLayout.seats) return null;

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-3xl border border-zinc-800 shadow-2xl">
      {/* ส่วนหัวแสดงชื่อโซนและปุ่มปิด */}
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <div>
          <h2 className="text-white text-xl font-bold">
            โซน: {zone.zone_name}
          </h2>
          <p className="text-zinc-500 text-sm">
            ราคา {Number(zone.price).toLocaleString()} บาท
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          ยกเลิก
        </button>
      </div>

      <div className="overflow-auto max-w-full bg-black/40 rounded-xl border border-white/5 p-4">
        <Stage width={800} height={500}>
          <Layer>
            <Group x={150} y={20}>
              {/* ตัวเวที */}
              <Rect
                width={500}
                height={40}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: 40 }}
                fillLinearGradientColorStops={[0, "#3f3f46", 1, "#18181b"]}
                cornerRadius={5}
                stroke="#52525b"
                strokeWidth={1}
              />
              {/* ข้อความบนเวที */}
              <Text
                text="STAGE"
                width={500}
                height={40}
                align="center"
                verticalAlign="middle"
                fill="#a1a1aa"
                fontSize={14}
                fontStyle="bold"
                letterSpacing={5}
              />
            </Group>

            {/* 🎟️ 2. วาดที่นั่ง (Seats) */}
            {zoneLayout.seats.map((seat: Seat) => {
              // ปรับค่า Offset Y ลงมาหน่อยเพื่อให้ไม่ทับเวที (เช่น +100)
              const zoneStartX = zoneLayout.pos_x;
              const zoneStartY = zoneLayout.pos_y;

              const seatGapX = 45; // ห่างกันแนวนอน 45px
              const seatGapY = 45; // ห่างกันแนวตั้ง 45px

              const rowOffset = (seat.row_label.charCodeAt(0) - 65) * seatGapY;
              const colOffset = (seat.column_num - 1) * seatGapX;

              const x = zoneStartX + colOffset + 20;
              const y = zoneStartY + rowOffset + 20;

              const isAvailable = seat.status === "AVAILABLE";
              const isSelected = selectedSeats.some(
                (s) => s.id === seat.seat_id,
              );

              return (
                <Group key={seat.seat_id}>
                  <Circle
                    x={x}
                    y={y}
                    radius={16}
                    fill={
                      !isAvailable
                        ? "#18181b" // จองแล้ว
                        : isSelected
                          ? "#10b981" // เลือกอยู่
                          : "#3f3f46" // ว่าง
                    }
                    stroke={
                      isSelected
                        ? "#fff"
                        : !isAvailable
                          ? "#3f3f46"
                          : "transparent"
                    }
                    strokeWidth={2}
                    shadowColor="black"
                    shadowBlur={isSelected ? 10 : 0}
                    onClick={() => isAvailable && handleSeatClick(seat)}
                    onTap={() => isAvailable && handleSeatClick(seat)}
                  />
                  {/* ตัวเลข/อักษรบนที่นั่ง */}
                  <Text
                    x={x - 15}
                    y={y - 5}
                    text={seat.seat_number}
                    width={30}
                    align="center"
                    fontSize={9}
                    fill={isAvailable ? "#a1a1aa" : "#52525b"}
                    listening={false}
                  />
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>

      {/* 🧾 3. ส่วนสรุปรายการ (Summary Footer) */}
      <div className="w-full mt-6 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-6 px-4">
        <div className="flex flex-col">
          <span className="text-zinc-500 text-sm">ที่นั่งที่เลือก:</span>
          <span className="text-white font-medium truncate">
            {selectedSeats.length > 0
              ? selectedSeats.map((s) => s.name).join(", ")
              : "ยังไม่ได้เลือก"}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-zinc-500 text-sm">ราคารวม:</span>
          <span className="text-emerald-400 text-2xl font-bold">
            ฿{(selectedSeats.length * Number(zone.price)).toLocaleString()}
          </span>
        </div>
        <button
          disabled={selectedSeats.length === 0}
          className="col-span-2 mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
          onClick={handleConfirm}
        >
          ยืนยันการเลือก {selectedSeats.length} ที่นั่ง
        </button>
      </div>
    </div>
  );
};;

export default SeatPicker;
