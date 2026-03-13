import { ENV, omiseClient } from "../config/env"
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { BookingStatus, InvoiceStatus, PaymentStatus } from "@prisma/client";
import { finalizeSuccessfulPayment } from "../service/payment";

export const createPayment = async(req:Request,res:Response) =>{
  const { bookingId, token, source } = req.body;
  const userId = req.user?.uid;

  if(!userId) return res.status(404).json({success:false,message:"Unauthorized"});

  try{
    const bookingData = await prisma.booking.findFirst({
      where:{
        booking_id: Number(bookingId),
        user_id: userId,
        status:BookingStatus.PENDING
      },
      include:{
        booking_items:true,
        invoices:true,
      }
    });

      if(!bookingData) return res.status(404).json({
        success:false,
        message:"Not found booking data"
      });

    const invoice = bookingData.invoices.find(
      inv => inv.status === InvoiceStatus.UNPAID
    ); // invoice unpaid

    if(!invoice){
      return res.status(404).json({
        success:false,
        message:"Not found invoice"
      });
    }
    if (invoice.due_date < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invoice expired"
      });
    }

    // เช็คเผื่อจ่ายซ้ำ
    const existingPayment = await prisma.payment.findFirst({
      where: {
        booking_id: bookingData.booking_id,
        status: PaymentStatus.SUCCESS
      }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Booking already paid"
      });
    }

    const amountInSatang = Math.round(Number(bookingData.total_price) * 100);

    const chargePayload: any = {
      amount: amountInSatang,
      currency: 'thb',
      return_uri: `${ENV.FRONTEND_URL}/booking/${bookingId}/status`,
      metadata: {
        bookingId: bookingData.booking_id 
      }
    };

    if(token){
      chargePayload.card = token;
    }else if(source){
      chargePayload.source = source;
    }else{
      return res.status(400).json({
        success: false,
        message: "Missing payment"
      });
      
    }

    const charge = await omiseClient.charges.create(chargePayload);


    // check status after chrge

    if (charge.status === 'successful') { // credit card
      await prisma.$transaction(async (tx) => {
      await finalizeSuccessfulPayment(tx,bookingData,charge,userId)
    });
    return res.status(200).json({
      success: true, message: "Payment successful"
    });
    } else if (charge.status === 'pending'){
      await prisma.payment.create({
        data: {
          user_id: userId,
          booking_id: bookingData.booking_id,
          amount: bookingData.total_price,
          payment_method: charge.source?.type || 'credit_card',
          transaction_id: charge.id,
          status: PaymentStatus.PENDING
        }
      });
      return res.status(200).json({
        success: true,
        status: 'pending',
        authorize_uri: charge.authorize_uri,
        download_uri: charge.source?.scannable_code?.image?.download_uri
      });
  }
  }catch(e){
    console.log(e);
    res.status(500).json({ success: false, message: "Server error" });
  }

}

export const omiseWebhookHandler = async (req: Request, res: Response) => {
  const { data, key } = req.body;

  try {

    if (key === "charge.complete") { // check is compleate payment

      const charge = data;

      if (charge.status !== "successful") { // if fail รอ corn จัดการ status ต่อ
        return res.status(200).json({ success: true });
      } 

      const bookingId = charge.metadata?.bookingId;

      if (!bookingId) {
        console.error("Webhook missing bookingId metadata");
        return res.status(200).json({ success: true });
      }

      // กัน webhook ยิงซ้ำ
      const existingPayment = await prisma.payment.findFirst({
        where: {
          transaction_id: charge.id,
          status: PaymentStatus.SUCCESS
        }
      });

      if (existingPayment) {
        return res.status(200).json({ success: true });
      }

      const bookingData = await prisma.booking.findUnique({
        where: {
          booking_id: Number(bookingId),
          status: BookingStatus.PENDING
        },
        include: {
          booking_items: true,
          invoices: true
        }
      });

      if (!bookingData) {
        return res.status(200).json({ success: true });
      }

      await prisma.$transaction(async (tx) => {
        await finalizeSuccessfulPayment(tx, bookingData, charge, bookingData.user_id);
      });

      console.log(`[Webhook] Payment successful for Booking: ${bookingId}`);
    }

    res.status(200).json({ success: true });

  } catch (e) {
    console.error("[Webhook Error]:", e);
    res.status(500).send("Internal Server Error");
  }
};