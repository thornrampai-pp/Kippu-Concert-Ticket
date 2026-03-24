import { SeatStatus } from "./enums";


export interface Concert {
  concert_id: number;
  concert_name: string;
  concert_detail?: string | null;
  image_url: string[];
  location: string;
  is_visible: boolean;
  sale_start_time: string; // DateTime -> string
  max_tickets_per_user: number;

  zones?: Zone[];
  show_times: Showtime[];
}


export interface Showtime {
  showtime_id: number;
  show_date: string;
  remaining_total: number;

  availabilities?: SeatAvailability[];

  zones_availability: {
    zone_id: number;
    remaining: number;
  }[];

}


export interface Zone {
  zone_id: number;
  zone_name: string;
  price: string;
  color: string;

  row_count: number;
  seat_per_row: number;
  total_seats: number;

  concert_id: number;

  pos_x: number;
  pos_y: number;
  width: number;
  height: number;

  booked_seats?: number;

  seats_master?: SeatMaster[];
  availabilities?: SeatAvailability[];
}
export 
interface SeatMaster {
  seat_id: number;
  zone_id: number;
  seat_number: string;
  row_label: string;
  column_num: number;
  zone?: Zone;
}

export interface SeatAvailability {
  availability_id: number;
  showtime_id: number;
  seat_id: number;
  status: SeatStatus;
  reserved_until?: string | null;
  
  
  seat_number: string;
  row_label: string;
  column_num: number;
 
  seat?: SeatMaster; 
  showtime?: Showtime;
}

export interface CreateConcertInput {
  concert_name: string;
  concert_detail?: string;
  image_url: string[];
  location: string;
  is_visible: boolean;

  sale_start_time: string;
  max_tickets_per_user: number;

  show_times: string[];
  zones: ZoneUpdatePayload[];
}


export interface ZoneInput {
  zone_name: string;
  price: number;

  row_count: number;
  seat_per_row: number;
  total_seats: number;

  color: string;

  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
}


export interface UpdateZoneSeatDetail {
  zoneName?: string;
  price?: number;
  rowCount?: number;      
  seatPerRow?: number;    
  posX?: number;
  posY?: number;
  width?: number;
  height?: number;
  color?: string;
}

export interface SeatMap {
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// กำหนด Interface เพื่อความชัดเจน
export interface ImageFile {
  file: File;
  preview: string;
}

export interface ZoneUpdatePayload extends ZoneInput {
  zone_id?: number;
}

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

export interface PendingSeat {
  id: number;
  name: string;
}

export interface SeatAvailabilityFlat {
  availability_id: number;
  seat_id: number;
  seat_number: string;
  row_label: string;
  column_num: number;
  status: SeatStatus;
}