import { Router } from "express";
import { omiseWebhookHandler } from "../controllers/paymentControllers";

const routes = Router()

routes.post('/omise', omiseWebhookHandler);

export default routes;