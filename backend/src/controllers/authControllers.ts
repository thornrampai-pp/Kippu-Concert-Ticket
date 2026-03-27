import { Request, Response } from "express";
import { auth } from "../lib/firebaseAdmin.js";
import prisma from "../lib/prisma.js";
import { LoginGoogleBody } from "../interfaces/auth.interface.js";

const isProduction = process.env.NODE_ENV === "production";

export const loginGoogle = async (req: Request<{}, {}, LoginGoogleBody>, res: Response) => {
  const { idToken } = req.body;

  try {
    const decodeToken = await auth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodeToken;
    
    const user = await prisma.user.upsert({
      where: { user_id: uid },
      update: {
        user_name: name || uid,
        image_url: picture || "", // ป้องกัน picture เป็น undefined
      },
      create: {
        user_id: uid,
        email: email || "",
        user_name: name || uid,
        image_url: picture || "",
        role_id: 1 
      }
    });

    res.cookie("token", idToken, {
      httpOnly: true,
      secure: isProduction, // บน localhost เป็น false, บน Render เป็น true
      sameSite: isProduction ? "none" : "lax", // บน localhost ใช้ lax ได้เพราะเป็น domain เดียวกัน
      maxAge: 60 * 60 * 1000,
      domain: isProduction ? ".onrender.com" : undefined,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: user
    });
  } catch (e) {
    console.error("Verify token error:", e);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

export const logoutGoogle = async (req: Request, res: Response) => {
  try {
   
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,      // ต้องตรงกับตอน Login
      sameSite: "none",  
      path: "/",         // ต้องตรงกัน
      domain: isProduction ? ".onrender.com" : undefined,
    });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
}

export const refreshToken = async (req: Request, res: Response) => {
  const { idToken } = req.body;
  try {
    await auth.verifyIdToken(idToken); // ตรวจสอบความถูกต้อง

    res.cookie("token", idToken, {
      httpOnly: true,
      secure: true,      // บังคับเป็น true เพราะใช้ SameSite None
      sameSite: "none",  // สำคัญมาก: เพื่อให้ Cookie ส่งข้าม Domain บน Render ได้
      maxAge: 60 * 60 * 1000, // 1 ชม.
      domain: isProduction ? ".onrender.com" : undefined,
      path: "/",
    });

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(401).json({ success: false });
  }
}