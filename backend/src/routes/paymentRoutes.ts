import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { createPayment, getPaymentStatus, getReceipt } from "../controllers/paymentControllers.js";
import { validateCreatePayment } from "../middlewares/paymentMiddleware.js";

const routes = Router()

routes.post('/create', verifyToken, validateCreatePayment,createPayment);
routes.get('/status/:bookingId', verifyToken, getPaymentStatus); 
routes.get('/receipt/:paymentId', verifyToken, getReceipt);


export default routes;