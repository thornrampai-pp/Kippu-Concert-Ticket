import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { CreateConcertBody, SeatCreateInput, UpdateConcertBody, UpdateParams } from "../interfaces/concert.interface";
import { SeatStatus } from "@prisma/client";
import { runInNewContext } from "node:vm";


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


export const getConcertById = async (req: Request<UpdateParams, {}, UpdateConcertBody>, res: Response) => {
  const { id } = req.params;
  try {
    const concert = await prisma.concert.findUnique({
      where: {
        concert_id: Number(id),
      },
      include: {
        show_times: {
          orderBy: {
            show_date: "asc",
          },
          include: {
            seats: {
              where: { status: SeatStatus.AVAILABLE },
              select: { zone_id: true }
            },
            _count: {
              select: {
                seats: {
                  where: { status: SeatStatus.AVAILABLE } // นับเฉพาะที่ว่างในรอบนั้น
                }
              }
            }
          }
        },
        zones: true // ข้อมูลพื้นฐานของโซน (ราคา, พิกัด) ดึงแยกไว้แบบเดิมได้
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
      concert_id: concert.concert_id,
      concert_name: concert.concert_name,
      concert_detail: concert.concert_detail,
      image_url: concert.image_url,
      location: concert.location,
      sale_start_time: concert.sale_start_time,
      is_visible: concert.is_visible,
      max_tickets_per_user: concert.max_tickets_per_user,
      // แสดง List รอบเวลาทั้งหมดที่มีในฐานข้อมูล
      show_times: concert.show_times.map((st) => {
        // 1. สร้าง Map เพื่อนับว่าในรอบนี้ แต่ละ zone_id เหลือที่นั่งเท่าไหร่
        const availabilityMap = st.seats.reduce((acc: Record<number, number>, seat) => {
          acc[seat.zone_id] = (acc[seat.zone_id] || 0) + 1;
          return acc;
        }, {});

        return {
          showtime_id: st.showtime_id,
          show_date: st.show_date,
          remaining_total: st._count.seats,
          // ✅ 2. เพิ่มฟิลด์นี้ เพื่อให้ Frontend รู้ว่าโซนไหนเหลือกี่ที่ในรอบนี้
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
  // 
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

      // 2. Mapping เข้า Prisma (ฝั่งซ้ายคือชื่อใน DB, ฝั่งขวาคือค่าจากตัวแปร)
      const newConcert = await tx.concert.create({
        data: {
          concert_name: concert_name,          // Map: concertName -> concert_name
          concert_detail: concert_detail || '',      // Map: concertDetail -> concert_detail
          location: location,
          image_url: image_url,
          is_visible: is_visible ?? true,      // Map: isVisible -> is_visible
          sale_start_time: new Date(sale_start_time),
          max_tickets_per_user: max_tickets_per_user ?? 2,

          // สร้าง Showtimes หลายรอบ
          show_times: {
            create: show_times.map(date => ({
              show_date: new Date(date)
            }))
          },

          // สร้าง Zones
          zones: {
            create: zones.map((z) => ({
              zone_name: z.zone_name,          // Map: zoneName -> zone_name
              price: z.price,
              total_seats: z.row_count * z.seat_per_row,      // Map: totalSeats -> total_seats
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

      // 3. STEP 2: วนลูปสร้างที่นั่ง (Seats) แยกตามรอบและโซน
      const zoneMap = new Map(
        newConcert.zones.map((z) => [z.zone_name, z.zone_id])
      );

      for (const show of newConcert.show_times) {
        // สร้าง Buffer ขนาดใหญ่สำหรับเก็บที่นั่ง "ทุกโซน" ในรอบการแสดงนี้
        const allSeatsInShow: any[] = [];

        for (const zoneInput of zones) {
          const createdZoneId = zoneMap.get(zoneInput.zone_name);
          if (!createdZoneId) continue;

          const getRowLabel = (n: number): string => {
            let label = "";
            while (n > 0) {
              let m = (n - 1) % 26;
              label = String.fromCharCode(65 + m) + label; // 65 คือ 'A'
              n = Math.floor((n - m) / 26);
            }
            return label;
          };

          for (let r = 1; r <= zoneInput.row_count; r++) {
            const rowLabel = getRowLabel(r);
            for (let s = 1; s <= zoneInput.seat_per_row; s++) {
              allSeatsInShow.push({
                zone_id: createdZoneId,
                showtime_id: show.showtime_id,
                seat_number: `${rowLabel}${s}`,
                row_label: rowLabel,
                column_num: s,
                status: SeatStatus.AVAILABLE,
              });
            }
          }
        }

        // ยิง Query ครั้งเดียวต่อรอบการแสดง (เช่น รอบละ 2,000 - 5,000 seats)
        if (allSeatsInShow.length > 0) {
          await tx.seat.createMany({
            data: allSeatsInShow,
            skipDuplicates: true, // ป้องกัน Error ถ้ามีการรันซ้ำ
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