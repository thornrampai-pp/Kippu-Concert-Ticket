import { Request, Response } from "express"
import  prisma  from "../lib/prisma";
import { UpdateProfileBody } from "../interfaces/auth.interface";

export const getUser = async (req: Request, res: Response) => {
  const userId = req.user?.uid;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not found",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      include: { role: true }
    });

    if (!user) return res.status(404).json({ success: true, message: "User not found" });

    return res.status(200).json({ success: true, data: user });
  } catch (e) {
    console.log(e)
    res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateProfile = async (req: Request<{}, {}, UpdateProfileBody>, res: Response) => {
  const userId = req.user?.uid;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User not found",
    });
  }

  const { user_name, phoneNumber, image_url } = req.body;
  try {
    const updateUser = await prisma.user.update({
      where: { user_id: userId },
      data: {
        ...(user_name && { user_name }),
        ...(phoneNumber && { phoneNumber }),
        ...(image_url && { image_url }),
      },
    });

    res.json({
      success: true,
      data: updateUser
    });
  } catch (e) {
    console.log(e)
    res.status(500).json({ success: false, message: "Server error" });
  }

}