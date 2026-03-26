import { Router } from "express";
import { omiseWebhookHandler } from "../controllers/paymentControllers.js";

const routes = Router()

routes.post('/omise', omiseWebhookHandler);

export default routes;