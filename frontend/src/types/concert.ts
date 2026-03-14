import { SeatStatus } from "./enums";

export interface Concert {
  concert_id: number;
  concert_name: string;
  concert_detail?: string;
  image_url?: string;
  location: string;
  is_visible: boolean;
  sale_start_time: string;
  max_tickets_per_user: number;

  zones?: Zone[];
  show_times?: Showtime[];
}

export interface Showtime {
  showtime_id: number;
  show_date: string;
  concert_id: number;
}

export interface Zone {
  zone_id: number;
  zone_name: string;
  price: number; // ใน TS ใช้ number แทน Decimal
  row_count: number;
  seat_per_row: number;
  total_seats: number;
  concert_id: number;
}

export interface Seat {
  seat_id: number;
  zone_id: number;
  showtime_id: number;
  seat_number: string;
  row_label: string;
  column_num: number;
  status: SeatStatus;
  reserved_until?: string;

  zone?: Zone;
}
export interface ZoneInput {
  zone_name: string;
  price: number;
  total_seats: number;
  rowCount: number;
  seatPerRow: number;
}

export interface CreateConcertInput {
  concert_name: string;
  concert_detail: string;
  location: string;
  is_visible: boolean;
  show_item: string[];       // ISO String
  sale_start_time: string; // ISO String
  max_tickets_per_user: number;
  zones: ZoneInput[];      // Array ของ zones
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}