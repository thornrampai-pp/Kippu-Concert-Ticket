import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { createBooking, getBookingById, getMyBooking } from "../controllers/bookingControllers.js";



const router = Router();

router.post('/create',verifyToken,createBooking);
router.get('/my',verifyToken,getMyBooking);
router.get('/:bookingId',verifyToken,getBookingById);

export default router;


