import { Request, Response,NextFunction } from "express";
import admin from "../lib/firebaseAdmin";

export const verifyToken = async (req: Request, res: Response, next: NextFunction) =>{
  const token = req.headers.authorization?.split(' ')[1];

  if(!token) return res.status(401).json({
    success: true,
    message: "Unauthorized"
  });

  try{
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // เก็บข้อมูลไว้ใน req เพื่อใช้ใน Controller ถัดไป
    next();

  }catch(e){
    console.log(e)
  }


}