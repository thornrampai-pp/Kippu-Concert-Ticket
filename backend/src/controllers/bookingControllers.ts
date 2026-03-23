import { BookingStatus, InvoiceStatus, SeatStatus } from "@prisma/client";
import { CreateBookingBody, InputParams } from "../interfaces/booking.interface"
import prisma from "../lib/prisma";
import { Request, Response } from "express";


export const createBooking = async (req: Request<{}, {}, CreateBookingBody>, res: Response) => {

  const { concertId, availabilityIds } = req.body;
  const userId = req.user?.uid;

  // ป้องกันค่าซ้ำและแปลงเป็น Number
  const uniqueAvailIds = [...new Set(availabilityIds.map(id => Number(id)))];

  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!uniqueAvailIds.length) return res.status(400).json({ success: false, message: "No seats selected" });

  try {
    const result = await prisma.$transaction(async (tx) => {

      // เช็คว่าที่นั่งในรอบนี้ (Availability) มีการจองค้าง (PENDING) อยู่หรือไม่
      const activeBookingWithSameSeats = await tx.booking.findFirst({
        where: {
          status: BookingStatus.PENDING,
          booking_items: {
            some: {
              availability_id: { in: uniqueAvailIds }
            }
          }
        }
      });

      if (activeBookingWithSameSeats) {
        throw new Error("ที่นั่งบางรายการมีรายการจองค้างชำระอยู่ กรุณารอสักครู่หรือเลือกที่นั่งใหม่");
      }

      //  ดึงข้อมูลจากตาราง SeatAvailability เพื่อเช็คสถานะและดึงราคาจาก Zone
      const seatAvails = await tx.seatAvailability.findMany({
        where: {
          availability_id: { in: uniqueAvailIds },
          status: SeatStatus.AVAILABLE
        },
        include: {
          seat: {
            include: { zone: true }
          }
        }
      });

      if (seatAvails.length !== uniqueAvailIds.length) {
        throw new Error("บางที่นั่งไม่ว่างหรือถูกจองไปแล้ว");
      }

      //  ล็อคสถานะที่นั่ง (Optimistic Locking) ที่ตาราง SeatAvailability
      const expireTime = new Date(Date.now() + 15 * 60000); // 15 นาที
      const updatedAvails = await tx.seatAvailability.updateMany({
        where: {
          availability_id: { in: uniqueAvailIds },
          status: SeatStatus.AVAILABLE
        },
        data: {
          status: SeatStatus.RESERVED,
          reserved_until: expireTime
        }
      });

      if (updatedAvails.count !== uniqueAvailIds.length) {
        throw new Error("ที่นั่งถูกจองตัดหน้าไปแล้ว กรุณาลองใหม่");
      }

      // คำนวณราคารวม (ดึงจาก zone.price ผ่าน relation ของ seat)
      const totalPrice = seatAvails.reduce((total, item) => total + Number(item.seat.zone.price), 0);

      //  สร้าง Booking และ Invoice โดยอ้างอิง availability_id
      const newBooking = await tx.booking.create({
        data: {
          user_id: userId,
          concert_id: Number(concertId),
          total_price: totalPrice,
          status: BookingStatus.PENDING,
          booking_items: {
            create: seatAvails.map(item => ({
              availability_id: item.availability_id, // ใช้ ID สถานะรายรอบ
              price: item.seat.zone.price
            }))
          },
          invoices: {
            create: {
              invoice_number: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              due_date: expireTime,
              status: InvoiceStatus.UNPAID
            }
          }
        },
        include: {
          invoices: true,
          booking_items: {
            include: {
              availability: {
                include: {
                  seat: true // เพื่อเอาเลขที่นั่งกลับไปแสดงผลที่หน้าบ้าน
                }
              }
            }
          }
        }
      });

      return newBooking;
    });

    return res.status(201).json({
      success: true,
      message: "จองที่นั่งสำเร็จ กรุณาชำระเงินภายใน 15 นาที",
      data: result
    });

  } catch (e: any) {
    console.error("Booking Error:", e);
    return res.status(400).json({
      success: false,
      message: e.message || "เกิดข้อผิดพลาดในการจอง"
    });
  }
};

// GET
export const getMyBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const bookings = await prisma.booking.findMany({
      where: {
        user_id: userId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.SUCCESS]
        }
      },
      include: {
        concert: true,
        booking_items: {
          include: {
            availability: {
              include: {
                seat: { include: { zone: true } }
              }
            }
          }
        },
        invoices: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // --- Logic การกำจัดรายการซ้ำ (Distinct by Availabilities) ---
    const latestBookingsMap = new Map();

    bookings.forEach(booking => {
      // ใช้ availability_id แทน seat_id เพราะ 1 seat_id มีได้หลายรอบ
      const seatKey = booking.booking_items
        .map(item => item.availability_id)
        .sort()
        .join(',');

      if (!latestBookingsMap.has(seatKey)) {
        latestBookingsMap.set(seatKey, booking);
      } else {
        const existing = latestBookingsMap.get(seatKey);
        if (existing.status === BookingStatus.PENDING && booking.status === BookingStatus.SUCCESS) {
          latestBookingsMap.set(seatKey, booking);
        }
      }
    });

    const result = Array.from(latestBookingsMap.values());

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getBookingById = async (req: Request, res: Response) => {
  const bookingId = Number(req.params.bookingId);
  const userId = req.user?.uid;

  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (isNaN(bookingId)) return res.status(400).json({ success: false, message: "Invalid Booking ID" });

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        booking_id: bookingId,
        user_id: userId
      },
      include: {
        concert: true,
        booking_items: {
          include: {
            // 🚩 แก้ไข: โครงสร้างการ include ใหม่
            availability: {
              include: {
                seat: { include: { zone: true } },
                showtime: true // ดึงวันเวลาแสดงของรอบนั้นๆ มาโชว์ในหน้ารายละเอียด
              }
            }
          }
        },
        invoices: true,
        payments: true
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลการจองนี้" });
    }

    return res.status(200).json({ success: true, data: booking });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};