import dotenv from "dotenv";
dotenv.config({ quiet: true })

type EnvConfig = {
  PORT: string
  DATABASE_URL: string
  DIRECT_URL: string
  PROJECT_ID: string
  CLIENT_EMAIL: string
  PRIVATEKEY: string
  FRONTEND_URL: string
}

export const ENV: EnvConfig = {
  PORT: process.env.PORT!,
  DATABASE_URL: process.env.DATABASE_URL! ,
  DIRECT_URL: process.env.DIRECT_URL!,
  PROJECT_ID: process.env.PROJECT_ID!,
  CLIENT_EMAIL: process.env.CLIENT_EMAIL!,
  PRIVATEKEY: process.env.PRIVATEKEY!,
  FRONTEND_URL: process.env.FRONTEND_URL!,
};

console.log("DB URL Check:", ENV.DATABASE_URL ? "Found" : "Not Found");
console.log(ENV.PORT);
// console.log(ENV.DATABASE_URL);
// console.log(ENV.DIRECT_URL);

