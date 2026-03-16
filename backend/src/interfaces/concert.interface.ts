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

export interface SeatCreateInput {
  zone_id: number;
  showtime_id: number;
  seat_number: string;
  status: SeatStatus;
  row_label: string;
  column_num: number;
}

export interface UpdateConcertBody {
  concertName?: string;
  concertDetail?: string;
  location?: string;
  isVisible?: boolean;
  saleStartTime?: string; // รับเป็น ISO String จากนั้นค่อยแปลงเป็น Date
  maxTicketsPerUser?: number;
}

export type UpdateParams = { id: string };


export interface UpdateZoneDetailBody{
  zoneName?: string;
  price?: number;
}

export interface UpdateZoneSeatDetial{
  zoneName?: string;
  price?: number;
  rowCount?: number;
  seatPerRow?: number;

  color: string;

  posX?: number;
  posY?: number;
  width?: number;
  height?: number;

}