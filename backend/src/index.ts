import express, { Request, Response } from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";
import { ENV } from "./config/env.js";
import userRouter from './routes/userRoutes.js'
import concertRouter from './routes/concertRoutes.js'
import zoneRouter from './routes/zoneRoutes.js';
import bookingRouter  from './routes/bookingRoutes.js'
import paymentRouter  from './routes/paymentRoutes.js'
import webHookRouter  from './routes/webhookRoutes.js'

const app = express();

app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message : "Kippu API is running" });
});

app.use("/users", userRouter);
app.use("/concert", concertRouter);
app.use("/zone", zoneRouter);
app.use("/booking", bookingRouter);
app.use('/payment', paymentRouter);
app.use('/webhook', webHookRouter);



app.listen(ENV.PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${ENV.PORT}`);
});
