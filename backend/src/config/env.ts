import dotenv from "dotenv";
import Omise from "omise"; 
dotenv.config({ quiet: true })

type EnvConfig = {
  PORT: string
  DATABASE_URL: string
  DIRECT_URL: string
  PROJECT_ID: string
  CLIENT_EMAIL: string
  PRIVATEKEY: string
  FRONTEND_URL: string
  OMISE_PUBLIC_KEY: string
  OMISE_SECRET_KEY: string
}

export const ENV: EnvConfig = {
  PORT: process.env.PORT!,
  DATABASE_URL: process.env.DATABASE_URL! ,
  DIRECT_URL: process.env.DIRECT_URL!,
  PROJECT_ID: process.env.PROJECT_ID!,
  CLIENT_EMAIL: process.env.CLIENT_EMAIL!,
  PRIVATEKEY: process.env.PRIVATEKEY!,
  FRONTEND_URL: process.env.FRONTEND_URL!,
  OMISE_PUBLIC_KEY: process.env.OMISE_PUBLIC_KEY!,
  OMISE_SECRET_KEY: process.env.OMISE_SECRET_KEY!,
  
};

export const omiseClient = (Omise as any)({
  publicKey: ENV.OMISE_PUBLIC_KEY,
  secretKey: ENV.OMISE_SECRET_KEY,
});



