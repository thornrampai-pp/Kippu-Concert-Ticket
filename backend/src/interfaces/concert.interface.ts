import { SeatStatus } from "@prisma/client";


//  Zone from fronend
export interface ZoneInput {
  zoneName: string;
  price: number;
  totalSeats: number;
  rowCount: number;
  seatPerRow: number;
}

//  Request Body 
export interface CreateConcertBody {
  concertName: string;
  concertDetail?: string;
  location: string;
  isVisible?: boolean;
  showTimes: string[];
  saleStartTime: string;
  maxTicketsPerUser?: number;
  zones: ZoneInput[];
}

export interface SeatCreateInput {
  zoneId: number;
  showtimeId: number;
  seatNumber: string;
  status: SeatStatus;
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

}