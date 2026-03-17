import { BookingStatus, InvoiceStatus, PaymentStatus, SeatStatus } from "@prisma/client";

export async function finalizeSuccessfulPayment(tx: any, booking: any, charge: any, userId: string) {
  // 1. เปลี่ยนสถานะที่นั่งจาก RESERVED เป็น SOLD
  const seatIds = booking.booking_items.map((item: any) => item.seat_id);
  await tx.seat.updateMany({
    where: { seat_id: { in: seatIds } },
    data: {
      status: SeatStatus.SOLD,
      reserved_until: null // เคลียร์เวลาล็อคออก
    }
  });

  // อัปเดตสถานะการจองเป็น SUCCESS
  await tx.booking.update({
    where: { booking_id: booking.booking_id },
    data: { status: BookingStatus.SUCCESS }
  });

  //  อัปเดต Invoice เป็น PAID
  await tx.invoice.updateMany({
    where: { booking_id: booking.booking_id },
    data: { status: InvoiceStatus.PAID }
  });

  //  บันทึกข้อมูลการชำระเงิน พร้อมเวลา paid_at
  // ใช้ upsert เพื่อกันกรณี Webhook กับ Controller ทำงานซ้ำซ้อนกัน
  await tx.payment.upsert({
    where: { transaction_id: charge.id },
    update: {
      status: PaymentStatus.SUCCESS,
      paid_at: new Date()
    },
    create: {
      user_id: userId,
      booking_id: booking.booking_id,
      amount: booking.total_price,
      payment_method: charge.source ? charge.source.type : 'credit_card',
      transaction_id: charge.id,
      status: PaymentStatus.SUCCESS,
      paid_at: new Date()
    }
  });
}