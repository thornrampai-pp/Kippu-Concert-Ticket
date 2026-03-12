import { Router } from "express";
import { createBooking, getBookingById, getMyBooking } from "../controllers/bookingControllers";
import { verifyToken, } from "../middlewares/authMiddleware";



const router = Router();

router.post('/create',verifyToken,createBooking);
router.get('/my',verifyToken,getMyBooking);
router.get('/:bookingId',verifyToken,getBookingById);

export default router;


