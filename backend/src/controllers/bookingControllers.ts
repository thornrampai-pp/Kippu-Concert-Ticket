import { BookingStatus, InvoiceStatus, SeatStatus } from "@prisma/client";
import { CreateBookingBody, InputParams } from "../interfaces/booking.interface"
import prisma from "../lib/prisma";
import { Request, Response } from "express";
export const createBooking = async (req: Request<{}, {}, CreateBookingBody>, res: Response) => {
  const { concertId, seatIds } = req.body;
  const userId = req.user?.uid;
  const uniqueSeatIds = [...new Set(seatIds)];

  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (!uniqueSeatIds.length) return res.status(400).json({ success: false, message: "No seats selected" });

  try {
    const result = await prisma.$transaction(async (tx) => {

      // 🚩 1. [เพิ่มใหม่] เช็คว่าที่นั่งเหล่านี้มีการจองที่สถานะ PENDING อยู่หรือไม่
      // เพื่อป้องกันไม่ให้สร้าง Booking ซ้อนกันในขณะที่คนแรกยังจ่ายเงินไม่เสร็จ
      const activeBookingWithSameSeats = await tx.booking.findFirst({
        where: {
          status: BookingStatus.PENDING,
          booking_items: {
            some: {
              seat_id: { in: uniqueSeatIds }
            }
          }
        }
      });

      if (activeBookingWithSameSeats) {
        throw new Error("ที่นั่งบางรายการมีรายการจองค้างชำระอยู่ กรุณารอสักครู่หรือเลือกที่นั่งใหม่");
      }

      // 2. ดึงข้อมูลที่นั่งเพื่อตรวจสอบราคาและโซน
      const seats = await tx.seat.findMany({
        where: {
          seat_id: { in: uniqueSeatIds },
          status: SeatStatus.AVAILABLE
        },
        include: { zone: true }
      });

      if (seats.length !== uniqueSeatIds.length) {
        throw new Error("บางที่นั่งไม่ว่างหรือถูกจองไปแล้ว");
      }

      // 3. ล็อคสถานะที่นั่ง (Optimistic Locking)
      const expireTime = new Date(Date.now() + 15 * 60000);
      const updatedSeats = await tx.seat.updateMany({
        where: {
          seat_id: { in: uniqueSeatIds },
          status: SeatStatus.AVAILABLE
        },
        data: {
          status: SeatStatus.RESERVED,
          reserved_until: expireTime
        }
      });

      if (updatedSeats.count !== uniqueSeatIds.length) {
        throw new Error("ที่นั่งถูกจองตัดหน้าไปแล้ว กรุณาลองใหม่");
      }

      const totalPrice = seats.reduce((total, seat) => total + Number(seat.zone.price), 0);

      // 4. สร้าง Booking และ Invoice
      const newBooking = await tx.booking.create({
        data: {
          user_id: userId,
          concert_id: concertId,
          total_price: totalPrice,
          status: BookingStatus.PENDING,
          booking_items: {
            create: seats.map(seat => ({
              seat_id: seat.seat_id,
              price: seat.zone.price
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
          booking_items: { include: { seat: true } } // ดึงกลับไปโชว์ที่หน้า Frontend ได้ทันที
        }
      });

      return newBooking;
    });

    return res.status(201).json({ success: true, data: result });

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
    const bookings = await prisma.booking.findMany({
      where: {
        user_id: req.user?.uid!,
        // กรองเฉพาะอันที่ไม่ใช่ CANCELLED (ถ้ามี)
        status: {
          in: [BookingStatus.PENDING, BookingStatus.SUCCESS]
        }
      },
      include: {
        concert: true,
        booking_items: {
          include: {
            seat: { include: { zone: true } }
          }
        },
        invoices: true
      },
      orderBy: {
        created_at: 'desc' // เอาอันใหม่ล่าสุดขึ้นก่อน
      }
    });

    // --- Logic การกำจัดรายการซ้ำ (Distinct by Seats) ---
    // เราจะสร้าง Map เพื่อเก็บที่นั่งที่ "ใหม่ที่สุด" ที่เราเจอ
    const latestBookingsMap = new Map();

    bookings.forEach(booking => {
      // สร้าง key จากรายการ seat_id ทั้งหมดใน booking นั้นๆ (เรียงลำดับเพื่อความแม่นยำ)
      const seatKey = booking.booking_items
        .map(item => item.seat_id)
        .sort()
        .join(',');

      // ถ้ายังไม่มี key นี้ใน Map ให้เพิ่มเข้าไป (เนื่องจากเรา orderBy desc มาแล้ว ตัวแรกที่เจอคือตัวล่าสุดเสมอ)
      if (!latestBookingsMap.has(seatKey)) {
        latestBookingsMap.set(seatKey, booking);
      } else {
        // กรณีพิเศษ: ถ้าตัวที่เจอใน Map เป็น PENDING แต่ตัวปัจจุบันที่กำลังตรวจเป็น CONFIRMED 
        // ให้เอาตัว CONFIRMED ทับ (เผื่อจังหวะ Webhook ทำงาน)
        const existing = latestBookingsMap.get(seatKey);
        if (existing.status === BookingStatus.PENDING && booking.status === BookingStatus.SUCCESS) {
          latestBookingsMap.set(seatKey, booking);
        }
      }
    });

    const result = Array.from(latestBookingsMap.values());

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (e) {
    console.log(e);
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
        user_id: userId //  ต้องเช็ก userId ตรงกับ account 
      },
      include: {
        concert: true,
        booking_items: {
          include: {
            seat: { include: { zone: true, showtime: true } }
          }
        },
        invoices: true,
        payments: true
      }
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลการจองนี้" });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};