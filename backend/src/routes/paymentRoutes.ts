import { Router } from "express";
import { createPayment } from "../controllers/paymentControllers";
import { verifyToken, } from "../middlewares/authMiddleware";
import { validateCreatePayment, } from "../middlewares/paymentMiddleware";

const routes = Router()

routes.post('/create', verifyToken, validateCreatePayment,createPayment);

export default routes;