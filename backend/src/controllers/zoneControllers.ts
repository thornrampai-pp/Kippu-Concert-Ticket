import { Request, Response } from "express";
import { SeatStatus } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { UpdateParams, UpdateZoneDetailBody, UpdateZoneSeatDetail, ZoneInput } from "../interfaces/concert.interface.js";


export const updateZoneDetail = async (req: Request<UpdateParams, {}, UpdateZoneDetailBody>, res: Response) => {
  const { id } = req.params;

  const { zoneName, price, } = req.body;

  try {
    const zone = await prisma.zone.update({
      where: {
        zone_id: Number(id)
      },
      data: {
        ...(zoneName && { zone_name: zoneName }),
        ...(price && { price: price }),

      }
    });
    if (!zone) return res.status(404).json({ success: false, message: "Zone not found" });

    res.status(200).json({ success: true, message: "Update zone successfully", data: zone });

  } catch (e) {
    console.log(e)
    res.status(500).json({ success: false, message: "Server error" });

  }
}

export const updateZoneSeat = async (req: Request<UpdateParams, {}, UpdateZoneSeatDetail>, res: Response) => {
  const { id: zoneId } = req.params;

  const { row_count, seat_per_row, zone_name, price,pos_x,pos_y,width,height ,color} = req.body;

  try {
    const zone = await prisma.$transaction(async (tx) => {
      const zone = await tx.zone.findUnique({
        where: {
          zone_id: Number(zoneId),
        },
        include: {
          concert: true
        }
      });
      if (!zone) return res.status(404).json({
        success: false,
        message: "Zone not found"
      });
      if (new Date(zone.concert.sale_start_time) <= new Date()) {
        return res.status(404).json({
          success: false,
          message: "Can not update now"
        });
      }

      if (row_count && seat_per_row) {
        // ลบ seat
        await tx.seatMaster.deleteMany({
          where: {
            zone_id: Number(zoneId)
          }
        });

        const showTimes = await tx.showtime.findMany({
          where: { concert_id: zone.concert_id }
        });

        const newSeat = [];
        for (const show of showTimes) {
          for (let r = 1; r <= row_count; r++) {
            const rowLabel = String.fromCharCode(64 + r);
            for (let s = 1; s <= seat_per_row; s++) {
              newSeat.push({
                zone_id: Number(zoneId),
                showtime_id: show.showtime_id,
                seat_number: `${rowLabel}${s}`,
                row_label: rowLabel,
                column_num: s,
                status: SeatStatus.AVAILABLE
              });
            }
          }
        }

        await tx.seatMaster.createMany({
          data: newSeat
        });

      }

      const updateZone = await tx.zone.update({
        where: {
          zone_id: Number(zoneId)
        },
        data: {
          ...(zone_name && { zone_name: zone_name }),
          ...(price !== undefined && { price }),
          ...(row_count && { row_count: row_count }),
          ...(seat_per_row && { seat_per_row: seat_per_row }),
          ...(row_count && seat_per_row && { total_seats: row_count * seat_per_row }),
          ...(color && {color:color}),
          ...(pos_x !== undefined && { pos_x: pos_x }),
          ...(pos_y !== undefined && { pos_y: pos_y }),
          ...(width !== undefined && { width: width }),
          ...(height !== undefined && { height: height })
        }

      })
      return updateZone;
    })
    res.status(200).json({
      success: true,
      message: "Update zone successfully",
      data: zone
    })

  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Server error" });
  }

}
export const addZone = async (req: Request<UpdateParams, {}, ZoneInput>, res: Response) => {
  const { id: concertId } = req.params;
  const { zone_name, price, row_count, seat_per_row, pos_x, pos_y, width, height, color } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. ดึงข้อมูลคอนเสิร์ตและรอบการแสดงทั้งหมดที่มีอยู่
      const concert = await tx.concert.findUnique({
        where: { concert_id: Number(concertId) },
        include: { show_times: true }
      });

      if (!concert) throw new Error("Concert not found");

      // ตรวจสอบเวลาขาย (ห้ามเพิ่มโซนถ้าเปิดขายแล้ว)
      if (new Date(concert.sale_start_time) <= new Date()) {
        throw new Error("Cannot add zone after sale started");
      }

      // 2. สร้างโซนใหม่
      const newZone = await tx.zone.create({
        data: {
          zone_name,
          price,
          row_count,
          seat_per_row,
          total_seats: row_count * seat_per_row,
          concert_id: Number(concertId),
          color,
          pos_x: pos_x ?? 0,
          pos_y: pos_y ?? 0,
          width: width ?? 120,
          height: height ?? 80
        }
      });

      // 3. สร้าง SeatMaster (ข้อมูลเก้าอี้ถาวรในโซนนี้)
      const masterSeatsData = [];
      for (let r = 1; r <= row_count; r++) {
        const rowLabel = String.fromCharCode(64 + r); // A, B, C...
        for (let s = 1; s <= seat_per_row; s++) {
          masterSeatsData.push({
            zone_id: newZone.zone_id,
            seat_number: `${rowLabel}${s}`,
            row_label: rowLabel,
            column_num: s,
          });
        }
      }

      // บันทึกที่นั่งหลักลง DB
      await tx.seatMaster.createMany({ data: masterSeatsData });

      // ดึง ID ของที่นั่งหลักที่เพิ่งสร้างออกมา เพื่อนำไปสร้าง Availability รายรอบ
      const createdMasterSeats = await tx.seatMaster.findMany({
        where: { zone_id: newZone.zone_id }
      });

      // 4. สร้าง SeatAvailability (สร้างสถานะที่นั่งแยกตามรอบการแสดง)
      const availabilityData = [];
      for (const show of concert.show_times) {
        for (const master of createdMasterSeats) {
          availabilityData.push({
            showtime_id: show.showtime_id,
            seat_id: master.seat_id,
            status: SeatStatus.AVAILABLE
          });
        }
      }

      // บันทึกสถานะรายรอบลง DB
      await tx.seatAvailability.createMany({ data: availabilityData });

      return newZone;
    });

    res.status(201).json({ success: true, message: "Zone and seats created successfully", data: result });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message || "Server error" });
  }
};

export const deleteZone = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // ลบ Zone เดียว Prisma จะ Cascade Delete ที่นั่ง (SeatMaster/Availability) ให้เอง
    // หากใน Schema ตั้งค่า onDelete: Cascade ไว้
    const deletedZone = await prisma.zone.delete({
      where: {
        zone_id: Number(id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Zone and related seats deleted successfully",
      data: deletedZone
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error or zone not found" });
  }
};

export const getZonesByConcert = async (req: Request<UpdateParams, {}, {}>, res: Response) => {
  const { id:concert_id } = req.params;

  try {
    const zones = await prisma.zone.findMany({
      where: { concert_id: Number(concert_id) },
      orderBy: { price: 'desc' } // เรียงตามราคาจากสูงไปต่ำ
    });

    res.status(200).json({ success: true, data: zones });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// GET

export const getZoneLayout = async (req: Request<UpdateParams, {}, {}>, res: Response) => {
  const { id: zone_id } = req.params;
  const { showtime_id } = req.query;

  try {
    const zone = await prisma.zone.findUnique({
      where: { zone_id: Number(zone_id) },
      include: {
        // 🚩 เปลี่ยนจาก seats เป็น seats_master
        seats_master: {
          include: {
            // 🚩 จอยไปหาตารางสถานะ (Availability) เฉพาะรอบที่ระบุ
            availabilities: {
              where: {
                showtime_id: Number(showtime_id)
              }
            }
          },
          orderBy: [
            { row_label: 'asc' },
            { column_num: 'asc' }
          ]
        }
      }
    });

    if (!zone) return res.status(404).json({ success: false, message: "Zone not found" });

    // ปรับโครงสร้างข้อมูลเล็กน้อยก่อนส่งกลับ (Flatten data) 
    // เพื่อให้ Frontend ใช้งานง่ายเหมือนเดิม
    const formattedData = {
      ...zone,
      availabilities: zone.seats_master.map(master => ({
        seat_id: master.seat_id,
        seat_number: master.seat_number,
        row_label: master.row_label,
        column_num: master.column_num,
        // ดึงสถานะมาจากตาราง availabilities (ซึ่งจะมีแค่ 1 record เพราะเรา filter showtime_id ไว้)
        status: master.availabilities[0]?.status || "AVAILABLE",
        availability_id: master.availabilities[0]?.availability_id
      }))
    };

    delete (formattedData as any).seats_master;

    res.status(200).json({ success: true, data: formattedData });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};