import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/firebaseAdmin";
import prisma from "../lib/prisma";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  // console.log(`back ${token}`)
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);

    req.user = decodedToken;

    next();
  } catch (e) {
    console.error(e);

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ดึง uid จาก req.user ที่ได้จาก verifyToken ตัวก่อนหน้า
    const uid = (req as any).user?.uid;

    if (!uid) {
      return res.status(401).json({ success: false, message: "User not identified" });
    }

    // ไปเช็คใน Database ของเรา (Prisma) ว่า User คนนี้มี Role เป็น ADMIN หรือไม่
    const user = await prisma.user.findUnique({
      where: { user_id: uid }, // สมมติว่าใน Model User คุณเก็บ firebase_uid ไว้
      select: { role: true }
    });

    if (user?.role.role_id !== 2) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required"
      });
    }

    next(); // ถ้าเป็น Admin จริง ให้ไปต่อ
  } catch (e) {
    console.error("Admin check error:", e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};