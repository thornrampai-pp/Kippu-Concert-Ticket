import { Request, Response } from "express";
import prisma  from "../lib/prisma";
import { auth } from '../lib/firebaseAdmin'
import { LoginGoogleBody } from "../interfaces/auth.interface";


export const loginGoogle = async (req: Request<{}, {}, LoginGoogleBody>, res: Response) => {
  const { idToken } = req.body;

  try {
    const decodeToken = await auth.verifyIdToken(idToken);

    const { uid, email, name, picture } = decodeToken;

    const user = await prisma.user.upsert({
      where: { user_id: uid },
      update: {
        user_name: name || uid,
        image_url: picture!,
      },
      create: {
        user_id: uid,
        email: email!,
        user_name: name || uid,
        image_url: picture!,
        role_id: 1
      }
    });
    res.cookie("token", idToken, {
      httpOnly: true,     // ป้องกันไม่ให้ JavaScript (Frontend) อ่านไฟล์นี้ได้
      secure: process.env.NODE_ENV === "production", // ใช้เฉพาะ HTTPS ในโปรดักชัน
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 วัน
    });
    return res.status(200).json({
      messsage: "Login successful",
      data: user
    });
  } catch (e) {
    console.error("Verify token error:", e);
    return res.status(401).json({ success: false, message: "Invalid token or server error" });
  }
}

export const logoutGoogle = async (req: Request, res: Response) => {
  try {
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
}