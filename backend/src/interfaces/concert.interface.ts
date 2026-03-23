import { SeatStatus } from "@prisma/client";


//  Zone from fronend
export interface ZoneInput {
  zone_name: string;
  price: number;
  total_seats: number;
  row_count: number;
  seat_per_row: number;
  concertId? : number;

  color: string;

  pos_x?: number;
  pos_y?: number;
  width?: number;
  height?: number;
}

//  Request Body 
export interface CreateConcertBody {
  concert_name: string;
  concert_detail?: string;
  location: string;
  is_visible?: boolean;
  image_url: string[];
  show_times: string[];
  sale_start_time: string;
  max_tickets_per_user?: number;

  zones: ZoneInput[];
}

export interface SeatMasterCreateInput {
  zone_id: number;
  seat_number: string;
  row_label: string;
  column_num: number;
}

export interface SeatAvailabilityCreateInput {
  showtime_id: number;
  seat_id: number; // ID จาก SeatMaster
  status: SeatStatus;
}

export interface UpdateConcertBody {
  concert_name?: string; // ปรับให้ตรงกับ DB field name (Snake_case)
  concert_detail?: string;
  location?: string;
  is_visible?: boolean;
  sale_start_time?: string;
  max_tickets_per_user?: number;
  image_url?: string[];
}
export type UpdateParams = { id: string };


export interface UpdateZoneDetailBody{
  zoneName?: string;
  price?: number;
}

export interface UpdateZoneSeatDetail {
  zone_name?: string;
  price?: number;
  row_count?: number;
  seat_per_row?: number;
  color?: string;
  pos_x?: number;
  pos_y?: number;
  width?: number;
  height?: number;
}