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
      
      // 1. ดึงข้อมูลที่นั่งเพื่อตรวจสอบราคาและโซน (และเช็กว่ามีที่นั่งอยู่จริงไหม)
      const seats = await tx.seat.findMany({
        where: { seat_id: { in: uniqueSeatIds }, status: SeatStatus.AVAILABLE },
        include: { zone: true }
      });

      if (seats.length !== uniqueSeatIds.length) {
        throw new Error("บางที่นั่งไม่ว่างหรือถูกจองไปแล้ว");
      }

      // 2. ล็อคสถานะที่นั่งทันที (Optimistic Locking)
      const expireTime = new Date(Date.now() + 15 * 60000); // 15 นาที
      const updatedSeats = await tx.seat.updateMany({
        where: {
          seat_id: { in: uniqueSeatIds },
          status: SeatStatus.AVAILABLE // ย้ำเงื่อนไขอีกรอบเพื่อกันการจองซ้อน
        },
        data: {
          status: SeatStatus.RESERVED,
          reserved_until: expireTime
        }
      });

      // ถ้าจำนวนที่อัปเดตได้ ไม่เท่ากับที่ส่งมา แสดงว่ามีคนตัดหน้าไปในเสี้ยววินาทีนั้น
      if (updatedSeats.count !== uniqueSeatIds.length) {
        throw new Error("ที่นั่งถูกจองตัดหน้าไปแล้ว กรุณาลองใหม่");
      }

      const totalPrice = seats.reduce((total, seat) => total + Number(seat.zone.price), 0);

      // 3. สร้าง Booking และ Invoice
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
        include: { invoices: true }
      });

      return newBooking;
    });

    return res.status(201).json({ success: true, data: result });

  } catch (e: any) {
    console.error("Booking Error:", e);
    // ส่ง Error Message ที่เราจงใจ Throw ออกไปให้ User เห็น
    return res.status(400).json({
      success: false,
      message: e.message || "เกิดข้อผิดพลาดในการจอง"
    });
  }
};
// GET

export const getMyBooking = async (req:Request, res:Response  ) =>{

  try{
    const bookings = await prisma.booking.findMany({
      where:{
        user_id: req.user?.uid!
      },
      include:{
        concert: true,
        booking_items:{
          include:{
            seat: {
              include:{
                zone:true
              }
            } 
          }
        },
        invoices:true
      },
      orderBy:{
        created_at: 'desc'
      }
      
    });
    res.status(200).json({
      success:true,
      data: bookings
    });

  }catch(e){
    console.log(e)
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