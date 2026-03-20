import { Seat } from './concert';
import { BookingStatus, PaymentStatus, InvoiceStatus } from './enums';

export interface Booking {
  booking_id: number;
  user_id: string;
  concert_id: number;
  total_price: number;
  status: BookingStatus;
  created_at: string;

  booking_items?: BookingItem[];
  payments?: Payment[];
  invoices?: Invoice[];
}

export interface BookingItem {
  booking_item_id: number;
  booking_id: number;
  seat_id: number;

  seat?: Seat;
}

export interface Payment {
  payment_id: number;
  user_id: string;
  booking_id: number;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  paid_at?: string;
  status: PaymentStatus;

  receipts?: Receipt[];
}
export interface Invoice {
  invoice_id: number;
  booking_id: number;
  invoice_number: string;
  due_date: string;
  status: InvoiceStatus;
  created_at: string;
}

export interface Receipt {
  receipt_id: number;
  payment_id: number;
  receipt_number: string;
  amount_price: number;
  issued_at: string;
  pdf_url?: string;
}

export interface PendingBooking {
  concertId: number;
  concertName: string;
  concertImage: string;
  concertLocation: string;
  showtime: string;
  zoneId: number;
  zoneName: string;
  price: number;
  // เก็บทั้ง ID (ส่ง Backend) และ Number (โชว์ UI)
  seats: {
    id: number;     // seat_id สำหรับ Prisma
    name: string;   // seat_number สำหรับแสดงผล เช่น "A1"
  }[];
  totalPrice: number;
}