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
      where: {
        booking_id: Number(bookingId),
        user_id: userId,
        status: BookingStatus.PENDING
      },
      include: {
        booking_items: {

          include: { availability: true }
        },
        invoices: true,
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
        bookingId: String(bookingData.booking_id)
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
      const method = charge.card ? 'credit_card' : (charge.source?.type || 'unknown');

      await prisma.payment.create({
        data: {
          user_id: userId,
          booking_id: bookingData.booking_id,
          amount: bookingData.total_price,
          payment_method: method,
          transaction_id: charge.id,
          status: PaymentStatus.PENDING
        }
      });
      return res.status(200).json({
        success: true,
        status: 'pending',
        authorize_uri: charge.authorize_uri ?? null,
        download_uri: charge.source?.scannable_code?.image?.download_uri ?? null
      });
    }
  }catch(e){
    console.log(e);
    console.error("🔥 OMISE ERROR FULL:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }

}
export const omiseWebhookHandler = async (req: Request, res: Response) => {
  const { data } = req.body; // Omise Webhook ส่งข้อมูลมาใน body

  try {
  
    if (data.object === "charge" && data.status === "successful") {
      const charge = data;
      const bookingId = charge.metadata?.bookingId;

      if (!bookingId) {
        console.error("Webhook missing bookingId metadata");
        return res.status(200).json({ success: true });
      }

      // 2. ป้องกันการทำงานซ้ำ (Idempotency Check)
      const existingPayment = await prisma.payment.findFirst({
        where: {
          transaction_id: charge.id,
          status: PaymentStatus.SUCCESS
        }
      });

      if (existingPayment) {
        return res.status(200).json({ success: true });
      }

      // 3. ดึงข้อมูล Booking พร้อม availability_id
      const bookingData = await prisma.booking.findFirst({
        where: {
          booking_id: Number(bookingId),
          status: BookingStatus.PENDING
        },
        include: {
          // 🚩 แก้ไข: ต้องดึง availability มาด้วยเพื่อให้ฟังก์ชัน finalize ทำงานได้
          booking_items: {
            include: {
              availability: true
            }
          },
          invoices: true
        }
      });

      if (!bookingData) {
        console.warn(`[Webhook] Booking ${bookingId} not found or not in PENDING status`);
        return res.status(200).json({ success: true });
      }

      // 4. รัน Transaction เพื่อจบการจอง
      await prisma.$transaction(async (tx) => {
        // มั่นใจว่า finalizeSuccessfulPayment ของคุณใช้ availability_id ในการ update status แล้ว
        await finalizeSuccessfulPayment(tx, bookingData, charge, bookingData.user_id);
      });

      console.log(`[Webhook] Payment successful for Booking: ${bookingId}`);
    }

    // Omise ต้องการ HTTP 200 เพื่อยืนยันว่าเราได้รับ Webhook แล้ว
    return res.status(200).json({ success: true });

  } catch (e) {
    console.error("[Webhook Error]:", e);
    
    return res.status(200).json({ success: false, message: "Internal logic error but webhook received" });
  }
};

export const getPaymentStatus = async (req: Request,res:Response) =>{
  const { bookingId } = req.params;
  const userId = req.user?.uid;

  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try{
    const booking = await prisma.booking.findUnique({
      where:{
        booking_id: Number(bookingId),
        user_id: userId 
      },
      select:{
        status: true,
        payments:{
          orderBy: {payment_id: 'desc'},
          take:1,
          select:{
            status: true,
            transaction_id: true
          }
        }
      }
      
    });
    if (!booking) {
      return res.status(404).json({ success: false, message: "ไม่พบข้อมูลการจอง" });
    }

    // ส่งสถานะกลับไปให้ Frontend ตัดสินใจว่าต้องทำอย่างไรต่อ
    res.status(200).json({
      success: true,
      data: booking
    
    });
  }catch(e){
    console.log(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const getReceipt = async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const userId = req.user?.uid;

  if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    const payment = await prisma.payment.findUnique({
      where: {
        payment_id: Number(paymentId),
        user_id: userId,
        status: PaymentStatus.SUCCESS
      },
      include: {
        booking: {
          include: {
            concert: true,
            booking_items: {
              include: {
                // 🚩 แก้ไข: เปลี่ยนจาก seat เป็น availability 
                availability: {
                  include: {
                    // ดึงข้อมูลเลขที่นั่งและโซน (ราคา/ชื่อโซน)
                    seat: {
                      include: { zone: true }
                    },
                    // 🚩 เพิ่มเติม: ดึงรอบการแสดงมาโชว์ในใบเสร็จ
                    showtime: true
                  }
                }
              }
            }
          }
        },
        // หมายเหตุ: ตรวจสอบใน Schema ว่า Payment มี relation กับ User หรือไม่ 
        // ถ้าไม่มีให้เอาบรรทัดล่างนี้ออก หรือดึงผ่าน booking.user แทน
        user: true
      }
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "ไม่พบใบเสร็จที่ต้องการ" });
    }

    return res.status(200).json({
      success: true,
      data: payment
    });

  } catch (e: any) {
    console.error("Get Receipt Error:", e);
    res.status(500).json({ success: false, message: "ไม่สามารถดึงข้อมูลใบเสร็จได้" });
  }
};