import { Router } from "express";
import { createPayment, getPaymentStatus, getReceipt } from "../controllers/paymentControllers";
import { verifyToken, } from "../middlewares/authMiddleware";
import { validateCreatePayment, } from "../middlewares/paymentMiddleware";

const routes = Router()

routes.post('/create', verifyToken, validateCreatePayment,createPayment);
routes.get('/status/:bookingId', verifyToken, getPaymentStatus); 
routes.get('/receipt/:paymentId', verifyToken, getReceipt);


export default routes;