import { Request, Response } from "express";
import { PrismaClient, SeatStatus } from "@prisma/client";

const prisma = new PrismaClient();

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