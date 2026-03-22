import cron from 'node-cron';
import prisma from '../lib/prisma';
import { SeatStatus, BookingStatus, InvoiceStatus } from '@prisma/client';

// รันทุกๆ 1 นาที
cron.schedule('* * * * *', async () => {
  const now = new Date();

  try {
    // 1. หา Booking ที่ยัง PENDING และ Invoice หมดเวลาแล้ว
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
        booking_items: true,
        invoices: true
      }
    });

    if (expiredBookings.length === 0) return;

    console.log(`[Cron] Found ${expiredBookings.length} expired bookings. Processing...`);

    // 2. ใช้ Transaction เพื่อความปลอดภัยของข้อมูล
    await prisma.$transaction(async (tx) => {
      for (const booking of expiredBookings) {
        const seatIds = booking.booking_items.map(item => item.seat_id);
        const invoiceIds = booking.invoices.map(inv => inv.invoice_id);

        // คืนสถานะที่นั่ง
        await tx.seat.updateMany({
          where: { seat_id: { in: seatIds } },
          data: {
            status: SeatStatus.AVAILABLE,
            reserved_until: null
          }
        });

        // อัปเดตสถานะการจอง
        await tx.booking.update({
          where: { booking_id: booking.booking_id },
          data: { status: BookingStatus.EXPIRED }
        });

        // อัปเดตสถานะ Invoice (เฉพาะใบที่ UNPAID)
        await tx.invoice.updateMany({
          where: { invoice_id: { in: invoiceIds }, status: InvoiceStatus.UNPAID },
          data: { status: InvoiceStatus.CANCELLED }
        });
      }
    });

    console.log(`[Cron] Successfully cleared expired items.`);
  } catch (error) {
    console.error('[Cron Error]:', error);
  }
});