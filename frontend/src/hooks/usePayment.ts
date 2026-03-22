import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { paymentService } from "@/src/services/paymentService";
import { ApiError, OmiseCardType } from "../types";

// ✅ 1. ประกาศ Type ให้ Window รู้จัก OmiseCard ทั่วทั้ง Hook
declare global {
  interface Window {
    OmiseCard: OmiseCardType;
  }
}

export const useOmisePayment = (bookingId: number, amount: number) => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const isConfigured = useRef(false);
  console.log(process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY)
  useEffect(() => {
    // กัน configure ซ้ำ (React Strict Mode)

    if (typeof window !== "undefined" && window.OmiseCard) {
      window.OmiseCard.configure({
        key: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY,
        currency: "thb",
        frameLabel: "KIPPU TICKETS",
        submitLabel: "ชำระเงิน",
        onFormClosed: () => setIsProcessing(false),
      });
      isConfigured.current = true;
      console.log("✅ CONFIGURED KEY:", process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY);
    }
  }, []);
 
  const processPayment = async (payload: { token?: string; source?: string }) => {
    // กันการยิงซ้ำถ้ากำลังประมวลผลอยู่
    // if (isProcessing) return;

    setIsProcessing(true);
    try {
      console.log("🚀 1. ยิงไป Backend ด้วย payload:", payload); // เพิ่ม Log เพื่อเช็ค
      const res = await paymentService.createPayment(bookingId, payload);
      console.log("✅ 2. Backend ตอบกลับมาว่า:", res); // เพิ่ม Log เพื่อเช็ค

      if (res?.success) {
        if (res.authorize_uri) {
          window.location.href = res.authorize_uri;
        } else {
          router.push('/');
        }
      } else {
        throw new Error(res?.message || "การชำระเงินไม่สำเร็จ");
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      alert(error?.message || "เกิดข้อผิดพลาดในการชำระเงิน");
      setIsProcessing(false); // ปลดล็อคสถานะถ้าพัง
    } finally {
      // ⚠️ อย่าเพิ่งรีบ setIsProcessing(false) ถ้ากำลังจะ Redirect
      if (typeof window !== "undefined" && window.location.href.includes('omise')) {
        // ปล่อยให้มันโหลดหน้าใหม่ไป
      } else {
        setIsProcessing(false);
      }
    }
  };

  const handleCreditCard = () => {
    // ✅ เช็คความพร้อมของระบบและยอดเงิน
    if (typeof window === "undefined" || !window.OmiseCard) {
      alert("ระบบชำระเงินยังไม่พร้อมใช้งาน กรุณารอสักครู่");
      return;
    }
    if (amount <= 0) return;

    window.OmiseCard.open({
      amount: Math.round(amount * 100),
      currency: "thb",
      // ✅ 3. ระบุให้เปิดหน้าบัตรเครดิต
      // defaultPaymentMethod: "creditcard",
      onCreateTokenSuccess: (token: string) => processPayment({ token }),
    });
  };

  const handlePromptPay = () => {
    if (!window.OmiseCard || !process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY) {
      alert("Omise ยังไม่พร้อม");
      return;
    }
    console.log("1. Clicked PromptPay");
    console.log("2. Check window.OmiseCard:", window.OmiseCard);
    console.log("3. Check Public Key:", process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY);
    
    if (!window.OmiseCard) {
      alert("Omise Library not found! กรุณารีเฟรชหน้าจอ");
      return;
    }

    window.OmiseCard.open({
      amount: Math.round(amount ),
      currency: "thb",
      sourceArray: ["promptpay"],
      defaultPaymentMethod: "promptpay",

      onCreateSourceSuccess: function (sourceId: string) {
        console.log("✅ SOURCE:", sourceId);
        processPayment({ source: sourceId });
      },

      onCreateSourceError: function (err: unknown) {
        console.error("❌ SOURCE ERROR:", err);
      }
    });
    console.log("🚀 [STEP 5] Popup Opened. Waiting for User to click Pay...");
  };
  return {
    handleCreditCard,
    handlePromptPay,
    isProcessing,
  };
};