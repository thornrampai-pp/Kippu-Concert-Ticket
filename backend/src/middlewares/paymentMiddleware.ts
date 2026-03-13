import { Request, Response, NextFunction } from "express";

// protect request
export const validateCreatePayment = (req: Request, res: Response, next: NextFunction) => {
  const { bookingId, token, source } = req.body;

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      message: "bookingId is required"
    });
  }

  if (!token && !source) {
    return res.status(400).json({
      success: false,
      message: "token or source required"
    });
  }

  next();
};