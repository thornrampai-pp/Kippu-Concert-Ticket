import express, { Request, Response } from "express";
import { ENV } from "./config/env";
import userRouter from "./routes/userRoutes"; 
import concertRouter from "./routes/concertRoutes";
import zoneRouter from "./routes/zoneRoutes";
import bookingRouter from "./routes/bookingRoutes"
import paymentRouter from './routes/paymentRoutes'
import webHookRouter from './routes/webhookRoutes'
import cors from 'cors'
import cookieParser from "cookie-parser";
import './job/expireBooking'

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
