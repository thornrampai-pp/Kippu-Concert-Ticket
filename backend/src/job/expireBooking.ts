import cron from 'node-cron';
import prisma from '../lib/prisma';
import { SeatStatus, BookingStatus, InvoiceStatus } from '@prisma/client';

// รันทุกๆ 1 นาที
cron.schedule('* * * * *', async () => {
  const now = new Date();

  try {
    // 1. หา Booking ที่ยัง PENDING และ Invoice หมดเวลา (due_date < now)
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        invoices: {
          some: {
            status: InvoiceStatus.UNPAID,
            due_date: { lt: now }
          }
        }
      },
      include: {
        booking_items: true, // ในนี้จะมี availability_id อยู่
        invoices: {
          where: { status: InvoiceStatus.UNPAID }
        }
      }
    });

    if (expiredBookings.length === 0) return;

    console.log(`[Cron] Found ${expiredBookings.length} expired bookings. Processing...`);

    // 2. ใช้ Transaction เพื่อจัดการข้อมูลชุดใหญ่
    await prisma.$transaction(async (tx) => {
      for (const booking of expiredBookings) {
        // 🚩 แก้ไข: ดึง availability_id แทน seat_id
        const availabilityIds = booking.booking_items.map(item => item.availability_id);
        const invoiceIds = booking.invoices.map(inv => inv.invoice_id);

        // 🚩 แก้ไข: คืนสถานะที่นั่งในตาราง seatAvailability (เฉพาะรอบนั้นๆ)
        await tx.seatAvailability.updateMany({
          where: {
            availability_id: { in: availabilityIds },
            status: SeatStatus.RESERVED // ป้องกันการไปแก้สถานะ SOLD โดยไม่ตั้งใจ
          },
          data: {
            status: SeatStatus.AVAILABLE,
            reserved_until: null
          }
        });

        // อัปเดตสถานะการจองเป็น EXPIRED
        await tx.booking.update({
          where: { booking_id: booking.booking_id },
          data: { status: BookingStatus.EXPIRED }
        });

        // อัปเดตสถานะ Invoice เป็น CANCELLED
        await tx.invoice.updateMany({
          where: {
            invoice_id: { in: invoiceIds },
            status: InvoiceStatus.UNPAID
          },
          data: { status: InvoiceStatus.CANCELLED }
        });
      }
    });

    console.log(`[Cron] Successfully cleared ${expiredBookings.length} expired bookings.`);
  } catch (error) {
    console.error('[Cron Error]:', error);
  }
});