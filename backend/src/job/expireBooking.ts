import cron from 'node-cron';
import prisma from '../lib/prisma';
import { SeatStatus, BookingStatus, InvoiceStatus } from '@prisma/client';

cron.schedule('* * * * *', async () => {
  console.log('[Cron] Checking for expired bookings...');

  try {
    // 1.  Booking ที่หมดอายุ 
    
    const expiredInvoices = await prisma.invoice.findMany({
      where: {
        status: InvoiceStatus.UNPAID,
        due_date: { lt: new Date() }
      },
      include: {
        booking: {
          include: {
            booking_items: true
          }
        }
      }
    });

    if (expiredInvoices.length === 0) return;

    // ล้างข้อมูลที่หมดอายุทั้งหมด
    await prisma.$transaction(async (tx) => {
      for (const invoice of expiredInvoices) {
        const bookingId = invoice.booking_id;
        const seatIds = invoice.booking.booking_items.map(item => item.seat_id);

        // change seate status to available
        await tx.seat.updateMany({
          where: { seat_id: { in: seatIds } },
          data: { status: SeatStatus.AVAILABLE, reserved_until: null }
        });

        // change Booking status to EXPIRED
        await tx.booking.update({
          where: { booking_id: bookingId },
          data: { status: BookingStatus.EXPIRED }
        });

        // change invoice status to  เป็น CANCELLED
        await tx.invoice.update({
          where: { invoice_id: invoice.invoice_id },
          data: { status: InvoiceStatus.CANCELLED }
        });
      }
    });

    console.log(`[Cron] Successfully cleared ${expiredInvoices.length} expired bookings.`);
  } catch (error) {
    console.error('[Cron Error]:', error);
  }
});