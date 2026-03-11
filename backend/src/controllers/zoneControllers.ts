import { Request, Response } from "express";
import prisma from "../lib/prisma";
import admin from '../lib/firebaseAdmin'
import { UpdateParams, UpdateZoneDetailBody, UpdateZoneSeatDetial, ZoneInput } from "../interfaces/concert.interface";
import { SeatStatus } from "@prisma/client";


export const updateZoneDetail = async (req: Request<UpdateParams, {}, UpdateZoneDetailBody>, res: Response) => {
  const { id } = req.params;

  const { zoneName, price, } = req.body;

  try {
    const zone = await prisma.zone.update({
      where: {
        zone_id: Number(id)
      },
      data: {
        ...(zoneName && { zone_name: zoneName }),
        ...(price && { price: price }),

      }
    });
    if (!zone) return res.status(404).json({ success: false, message: "Zone not found" });

    res.status(200).json({ success: true, message: "Update zone successfully", data: zone });

  } catch (e) {
    console.log(e)
    res.status(500).json({ success: false, message: "Server error" });

  }
}

export const updateZoneSeat = async (req: Request<UpdateParams, {}, UpdateZoneSeatDetial>, res: Response) => {
  const { id: zoneId } = req.params;

  const { rowCount, seatPerRow, zoneName, price } = req.body;

  try {
    const zone = await prisma.$transaction(async (tx) => {
      const zone = await tx.zone.findUnique({
        where: {
          zone_id: Number(zoneId),
        },
        include: {
          concert: true
        }
      });
      if (!zone) return res.status(404).json({
        success: false,
        message: "Zone not found"
      });
      if (new Date(zone.concert.sale_start_time) <= new Date()) {
        return res.status(404).json({
          success: false,
          message: "Can not update now"
        });
      }

      if (rowCount && seatPerRow) {
        // ลบ seat
        await tx.seat.deleteMany({
          where: {
            zone_id: Number(zoneId)
          }
        });

        const showTimes = await tx.showtime.findMany({
          where: { concert_id: zone.concert_id }
        });

        const newSeat = [];
        for (const show of showTimes) {
          for (let r = 1; r <= rowCount; r++) {
            const rowLabel = String.fromCharCode(64 + r);
            for (let s = 1; s <= seatPerRow; s++) {
              newSeat.push({
                zone_id: Number(zoneId),
                showtime_id: show.showtime_id,
                seat_number: `${rowLabel}${s}`,
                status: SeatStatus.AVAILABLE
              });
            }
          }
        }

        await tx.seat.createMany({
          data: newSeat
        });

      }

      const updateZone = await tx.zone.update({
        where: {
          zone_id: Number(zoneId)
        },
        data: {
          ...(zoneName && { zone_name: zoneName }),
          ...(price && { price: price }),
          ...(rowCount && seatPerRow && { total_seats: rowCount * seatPerRow })
        }

      })
      return updateZone;
    })
    res.status(200).json({
      success: true,
      message: "Update zone successfully",
      data: zone
    })

  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Server error" });
  }

}

export const addZone = async (req: Request<UpdateParams, {}, ZoneInput>, res: Response) => {
  const { id: concertId } = req.params;
  const { zoneName, price, rowCount, seatPerRow } = req.body;


  try {
    const result = await prisma.$transaction(async (tx) => {
      const concert = await tx.concert.findUnique({
        where: {
          concert_id: Number(concertId),
        },
        include: {
          show_times: true
        }
      });
      if (!concert) return res.status(404).json({
        success: false,
        message: "Concert not found"
      });


      if (new Date(concert.sale_start_time) <= new Date()) {
       return res.status(400).json({
          success: false,
          message: "Can not add zone now"
        });
      }
       
        

        const newZone = await tx.zone.create({
          data: {
            zone_name: zoneName,
            price: price,
            total_seats: rowCount * seatPerRow,
            concert_id: Number(concertId)
          }
        });

        const newSeats = [];
        for (const show of concert.show_times) {
          for (let r = 1; r <= rowCount; r++) {
            const rowLabel = String.fromCharCode(64 + r); // A, B, C...
            for (let s = 1; s <= seatPerRow; s++) {
              newSeats.push({
                zone_id: newZone.zone_id,
                showtime_id: show.showtime_id,
                seat_number: `${rowLabel}${s}`,
                status: "AVAILABLE" as any
              });
            }
          }
        }
        await tx.seat.createMany({
          data: newSeats
        });

        return newZone;
      }
    );
    res.status(201).json({
      success: true,
      message: "Zone and seats created successfully",
      data: result
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET

export const getZonesByConcert = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const zones = await prisma.zone.findMany({
      where: { concert_id: Number(id) },
      orderBy: { price: 'desc' } // เรียงตามราคาจากสูงไปต่ำ
    });

    res.status(200).json({ success: true, data: zones });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getZoneLayout = async (req: Request, res: Response) => {
  const { zone_id } = req.params;
  
  const { showtime_id } = req.query; 

  try {
    const zone = await prisma.zone.findUnique({
      where: { zone_id: Number(zone_id) },
      include: {
        seats: {
          where: {
            showtime_id: Number(showtime_id)
          },
          orderBy: { seat_number: 'asc' } // เรียงตามเลขที่นั่ง A1, A2...
        }
      }
    });

    if (!zone) return res.status(404).json({ success: false, message: "Zone not found" });

    res.status(200).json({ success: true, data: zone });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};