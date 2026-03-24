import { BookingStatus, InvoiceStatus, PaymentStatus, SeatStatus } from "@prisma/client";

export async function finalizeSuccessfulPayment(tx: any, booking: any, charge: any, userId: string) {
  const availabilityIds = booking.booking_items.map(
    (item: any) => item.availability_id
  );

  await tx.seatAvailability.updateMany({
    where: {
      availability_id: { in: availabilityIds }
    },
    data: {
      status: SeatStatus.SOLD,
      reserved_until: null
    }
  });

  await tx.booking.update({
    where: { booking_id: booking.booking_id },
    data: { status: BookingStatus.SUCCESS }
  });

  await tx.invoice.updateMany({
    where: { booking_id: booking.booking_id },
    data: { status: InvoiceStatus.PAID }
  });

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