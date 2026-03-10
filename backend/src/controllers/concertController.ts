import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { CreateConcertBody, SeatCreateInput, UpdateConcertBody, UpdateParams} from "../interfaces/concert.interface";
import { SeatStatus } from "@prisma/client";


// GET
export const getAllConcert = async (req: Request, res: Response) => {
  try {
    const dateNow = new Date();

    const concertsData = await prisma.concert.findMany({
      where: {
        is_visible: true,
        show_times: {
          some: {
            show_date: {
              gte: dateNow,
            },
          },
        },
      },
      include: {
        show_times: {
          orderBy: {
            show_date: "asc",
          },
        },

      },
      orderBy: {
        // เรียงตามวันที่เปิดขายบัตร (วันที่ใกล้จะเปิดขายที่สุดขึ้นก่อน)
        sale_start_time: "asc",
      },
    });

    // Mapping ข้อมูลให้เป็นระเบียบตาม Interface ที่เราตั้งไว้
    const formattedData = concertsData.map((concert) => ({
      concert_Id: concert.concert_id,
      concert_name: concert.concert_name,
      concert_detail: concert.concert_detail,
      location: concert.location,
      sale_start_time: concert.sale_start_time,
      // แสดง List รอบเวลาทั้งหมดที่มีในฐานข้อมูล
      show_times: concert.show_times.map((st) => ({
        show_time_id: st.showtime_id,
        show_date: st.show_date,
      })),
    }));

    return res.status(200).json({
      success: true,
      message: "Get all upcoming concerts with full showtime list successfully",
      data: formattedData,
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getConcertById = async (req: Request<UpdateParams,{},UpdateConcertBody>, res: Response) => {
  const { id } = req.params;
  try {
    const concert = await prisma.concert.findUnique({
      where: {
        concert_id: Number(id),
      },
      include: {
        // เพิ่มการดึง show_times เพื่อให้เหมือนกับ getAllConcert
        show_times: {
          orderBy: {
            show_date: "asc",
          },
        },
        // ดึง zones ออกมาด้วยเพื่อคำนวณราคาเริ่มต้น (หรือแสดงรายการโซน)
        zones: {
          orderBy: {
            price: "asc",
          },
        },
      },
    });

    // 1. เช็คว่ามีข้อมูลไหม
    if (!concert) {
      return res.status(404).json({ success: false, message: "Concert not found" });
    }

    // 2. เช็คว่าถูกสั่งซ่อนไว้หรือไม่
    if (!concert.is_visible) {
      return res.status(403).json({ success: false, message: "Concert not found" });
    }

    // 3. Mapping ข้อมูลให้ชื่อ Field ตรงกับ getAllConcert
    const formattedData = {
      concert_Id: concert.concert_id,
      concert_name: concert.concert_name,
      concert_detail: concert.concert_detail,
      location: concert.location,
      sale_start_time: concert.sale_start_time,
      show_times: concert.show_times.map((st) => ({
        show_time_id: st.showtime_id,
        show_date: st.show_date,
      })),

    };

    return res.status(200).json({
      success: true,
      message: "Get concert successfully",
      data: formattedData,
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





// CREATE
export const createConcert = async (
  req: Request<{}, {}, CreateConcertBody>,
  res: Response
) => {
  // 
  const {
    concertName,
    concertDetail,
    location,
    isVisible,
    showTimes,
    saleStartTime,
    maxTicketsPerUser,
    zones
  } = req.body;

  try {
    const concert = await prisma.$transaction(async (tx) => {

      // 2. Mapping เข้า Prisma (ฝั่งซ้ายคือชื่อใน DB, ฝั่งขวาคือค่าจากตัวแปร)
      const newConcert = await tx.concert.create({
        data: {
          concert_name: concertName,          // Map: concertName -> concert_name
          concert_detail: concertDetail || '',      // Map: concertDetail -> concert_detail
          location: location,
          is_visible: isVisible ?? true,      // Map: isVisible -> is_visible
          sale_start_time: new Date(saleStartTime),
          max_tickets_per_user: maxTicketsPerUser ?? 2,

          // สร้าง Showtimes หลายรอบ
          show_times: {
            create: showTimes.map(date => ({
              show_date: new Date(date)
            }))
          },

          // สร้าง Zones
          zones: {
            create: zones.map((z) => ({
              zone_name: z.zoneName,          // Map: zoneName -> zone_name
              price: z.price,
              total_seats: z.totalSeats       // Map: totalSeats -> total_seats
            }))
          }
        },
        include: {
          zones: true,
          show_times: true
        }
      });

      // 3. STEP 2: วนลูปสร้างที่นั่ง (Seats) แยกตามรอบและโซน
      for (const show of newConcert.show_times) {
        for (const zoneInput of zones) {

          const createdZone = newConcert.zones.find(
            (z) => z.zone_name === zoneInput.zoneName
          );

          if (!createdZone) continue;

          const seatsBuffer: SeatCreateInput[] = [];

          for (let r = 1; r <= zoneInput.rowCount; r++) {
            const rowLabel = String.fromCharCode(64 + r);
            for (let s = 1; s <= zoneInput.seatPerRow; s++) {
              seatsBuffer.push({
                zoneId: createdZone.zone_id,
                showtimeId: show.showtime_id,
                seatNumber: `${rowLabel}${s}`,
                status: SeatStatus.AVAILABLE
              });
            }
          }

          // บันทึกลงตาราง Seat โดยต้อง Map ชื่อฟิลด์ให้ตรงกับ DB
          await tx.seat.createMany({
            data: seatsBuffer.map(s => ({
              zone_id: s.zoneId,
              showtime_id: s.showtimeId,
              seat_number: s.seatNumber,
              status: s.status
            }))
          });
        }
      }

      return newConcert;
    });

    res.status(201).json({
      success: true,
      message: "Create concert successfully",
      data: concert
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update

export const updateConcert = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    concertName,
    concertDetail,
    location,
    isVisible,
    saleStartTime,
    maxTicketsPerUser
  } = req.body;

  try {
    const concert = await prisma.concert.update({
      where: {
        concert_id: Number(id)
      },
      data: {
        ...(concertName && { concert_name: concertName }),
        ...(concertDetail && { concert_detail: concertDetail }),
        ...(location && { location: location }),
        ...(isVisible !== undefined && { is_visible: isVisible }),
        ...(saleStartTime && { sale_start_time: new Date(saleStartTime) }),
        ...(maxTicketsPerUser && { max_tickets_per_user: maxTicketsPerUser })

      }
    });
    if (!concert) return res.status(404).json({ success: false, message: "Concert not found" });

    res.status(200).json({ success: true, message: "Update concert successfully", data: concert });


  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });

  }

}