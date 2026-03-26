import { Request, Response } from "express";
import { SeatStatus } from "@prisma/client";
import { runInNewContext } from "node:vm";
import prisma from "../lib/prisma.js";
import { CreateConcertBody, UpdateConcertBody, UpdateParams } from "../interfaces/concert.interface.js";


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
      concert_id: concert.concert_id,
      concert_name: concert.concert_name,
      concert_detail: concert.concert_detail,
      image_url: concert.image_url,
      location: concert.location,
      sale_start_time: concert.sale_start_time,
      is_visible: concert.is_visible,
      max_tickets_per_user: concert.max_tickets_per_user,
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

export const getAdminConcerts = async (req: Request, res: Response) => {
  try {
    // Admin จะเห็นคอนเสิร์ตทั้งหมด
    const concertsData = await prisma.concert.findMany({
      include: {
        show_times: {
          orderBy: {
            show_date: "asc",
          },
          include: {
            // 🚩 แก้ไข: เปลี่ยนจาก seats เป็น availabilities
            _count: {
              select: { availabilities: true }
            }
          }
        },
        _count: {
          select: { zones: true }
        }
      },
      orderBy: {
        concert_id: "desc",
      },
    });

    const formattedData = concertsData.map((concert) => ({
      concert_id: concert.concert_id,
      concert_name: concert.concert_name,
      concert_detail: concert.concert_detail,
      image_url: concert.image_url,
      location: concert.location,
      sale_start_time: concert.sale_start_time,
      is_visible: concert.is_visible,
      max_tickets_per_user: concert.max_tickets_per_user,
      zone_count: concert._count.zones,
      show_times: concert.show_times.map((st) => ({
        show_time_id: st.showtime_id,
        show_date: st.show_date,
        // 🚩 แก้ไข: ดึงค่าจาก availabilities ที่เรานับไว้
        total_seats: st._count.availabilities,
      })),
    }));

    return res.status(200).json({
      success: true,
      message: "Get all concerts for Admin successfully",
      data: formattedData,
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getConcertById = async (req: Request<UpdateParams, {}, UpdateConcertBody>, res: Response) => {
  const { id } = req.params;
  try {
    const concert = await prisma.concert.findUnique({
      where: {
        concert_id: Number(id),
      },
      include: {
        show_times: {
          orderBy: { show_date: "asc" },
          include: {
            // 🚩 1. ดึงเฉพาะรายการที่ AVAILABLE และต้องดึงผ่าน SeatMaster เพื่อเอา zone_id
            availabilities: {
              where: { status: SeatStatus.AVAILABLE },
              select: {
                seat: {
                  select: { zone_id: true }
                }
              }
            },
            // 🚩 2. นับจำนวนที่ว่างรวมของรอบนั้นๆ
            _count: {
              select: {
                availabilities: {
                  where: { status: SeatStatus.AVAILABLE }
                }
              }
            }
          }
        },
        zones: true
      },
    });

    if (!concert || !concert.is_visible) {
      return res.status(404).json({ success: false, message: "Concert not found" });
    }

    // 🚩 3. Mapping ข้อมูลใหม่
    const formattedData = {
      concert_id: concert.concert_id,
      concert_name: concert.concert_name,
      concert_detail: concert.concert_detail,
      image_url: concert.image_url,
      location: concert.location,
      sale_start_time: concert.sale_start_time,
      is_visible: concert.is_visible,
      max_tickets_per_user: concert.max_tickets_per_user,

      show_times: concert.show_times.map((st) => {
        // วนลูปนับว่าแต่ละ zone_id มีที่นั่งว่าง (from availabilities) เท่าไหร่
        const availabilityMap = st.availabilities.reduce((acc: Record<number, number>, curr) => {
          const zId = curr.seat.zone_id;
          acc[zId] = (acc[zId] || 0) + 1;
          return acc;
        }, {});

        return {
          showtime_id: st.showtime_id,
          show_date: st.show_date,
          remaining_total: st._count.availabilities, // จำนวนที่ว่างรวมทั้งรอบ
          // ส่งข้อมูลที่ว่างแยกตามโซนให้ Frontend ไปวาดกราฟิกหรือแสดงรายการ
          zones_availability: concert.zones.map(z => ({
            zone_id: z.zone_id,
            remaining: availabilityMap[z.zone_id] || 0
          }))
        };
      }),
      zones: concert.zones
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
  const {
    concert_name,
    concert_detail,
    location,
    image_url,
    is_visible,
    show_times,
    sale_start_time,
    max_tickets_per_user,
    zones
  } = req.body;

  try {
    const concert = await prisma.$transaction(async (tx) => {

      // 1. สร้าง Concert, Showtimes และ Zones
      const newConcert = await tx.concert.create({
        data: {
          concert_name,
          concert_detail: concert_detail || '',
          location,
          image_url,
          is_visible: is_visible ?? true,
          sale_start_time: new Date(sale_start_time),
          max_tickets_per_user: max_tickets_per_user ?? 2,
          show_times: {
            create: show_times.map(date => ({
              show_date: new Date(date)
            }))
          },
          zones: {
            create: zones.map((z) => ({
              zone_name: z.zone_name,
              price: z.price,
              total_seats: z.row_count * z.seat_per_row,
              row_count: z.row_count,
              seat_per_row: z.seat_per_row,
              color: z.color,
              pos_x: z.pos_x ?? 0,
              pos_y: z.pos_y ?? 0,
              width: z.width ?? 120,
              height: z.height ?? 80
            }))
          }
        },
        include: {
          zones: true,
          show_times: true
        }
      });

      // --- ฟังก์ชัน Helper สำหรับสร้าง Label แถว ---
      const getRowLabel = (n: number): string => {
        let label = "";
        while (n > 0) {
          let m = (n - 1) % 26;
          label = String.fromCharCode(65 + m) + label;
          n = Math.floor((n - m) / 26);
        }
        return label;
      };

      // 2. สร้าง SeatMaster (ข้อมูลกายภาพที่นั่ง) - สร้างแค่ "ชุดเดียว" ต่อคอนเสิร์ต
      const seatMasterData: any[] = [];

      for (const zone of newConcert.zones) {
        // หาข้อมูล input ของโซนนั้นเพื่อเอา row_count / seat_per_row
        const zoneInput = zones.find(z => z.zone_name === zone.zone_name);
        if (!zoneInput) continue;

        for (let r = 1; r <= zone.row_count; r++) {
          const rowLabel = getRowLabel(r);
          for (let s = 1; s <= zone.seat_per_row; s++) {
            seatMasterData.push({
              zone_id: zone.zone_id,
              seat_number: `${rowLabel}${s}`,
              row_label: rowLabel,
              column_num: s,
            });
          }
        }
      }

      // บันทึกข้อมูลผังที่นั่งหลักทั้งหมดลง DB
      await tx.seatMaster.createMany({
        data: seatMasterData
      });

      // 3. สร้าง SeatAvailability (สถานะการขาย) - แยกตามรอบการแสดง
      // ดึง SeatMaster IDs ที่เพิ่งสร้างขึ้นมา
      const createdMasters = await tx.seatMaster.findMany({
        where: { zone: { concert_id: newConcert.concert_id } },
        select: { seat_id: true }
      });

      for (const show of newConcert.show_times) {
        const availabilityData = createdMasters.map(m => ({
          showtime_id: show.showtime_id,
          seat_id: m.seat_id,
          status: SeatStatus.AVAILABLE
        }));

        // ใช้ Chunking (แบ่งทีละ 1,000) เพื่อป้องกัน Error กรณีที่นั่งเยอะเกินไป
        for (let i = 0; i < availabilityData.length; i += 1000) {
          await tx.seatAvailability.createMany({
            data: availabilityData.slice(i, i + 1000)
          });
        }
      }

      return newConcert;
    }, {
      timeout: 30000 // เพิ่ม timeout เป็น 30 วินาที เพราะต้องเขียนข้อมูลเยอะ
    });

    res.status(201).json({
      success: true,
      message: "Create concert with master seats and availability successfully",
      data: concert
    });

  } catch (error) {
    console.error("Create Concert Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update

export const updateConcert = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    concert_name,     
    concert_detail,    
    location,
    is_visible,        
    sale_start_time,   
    max_tickets_per_user ,
    image_url

  } = req.body;

  try {
    const concert = await prisma.concert.update({
      where: {
        concert_id: Number(id)
      },
      data: {
        ...(concert_name && { concert_name }),
        ...(concert_detail && { concert_detail }),
        ...(location && { location }),
        ...(is_visible !== undefined && { is_visible }),
        ...(sale_start_time && { sale_start_time: new Date(sale_start_time) }),
        ...(max_tickets_per_user !== undefined && { max_tickets_per_user }),
        ...(image_url && { image_url })
      }
    });
    if (!concert) return res.status(404).json({ success: false, message: "Concert not found" });

    res.status(200).json({ success: true, message: "Update concert successfully", data: concert });


  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });

  }

}