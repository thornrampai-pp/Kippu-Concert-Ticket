import express, { Request, Response } from "express";
import { ENV } from "./config/env";
import userRouter from "./routes/userRoutes"; // Import router ที่คุณสร้างไว้
import cors from 'cors'


const app = express();

app.use(cors({ origin: ENV.FRONTEND_URL, credentials: true }));
app.use(express.json());


app.get("/", (req, res) => {
  res.json({ message : "Kippu API is running" });
});

app.use("/users", userRouter);


app.listen(ENV.PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${ENV.PORT}`);
});
