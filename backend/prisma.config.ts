import { defineConfig, env } from "prisma/config";
import "dotenv/config"; // เพื่อใช้ env()

export default defineConfig({
  // ตำแหน่งของไฟล์ schema
  schema: "prisma/schema.prisma",

  // คอนฟิก DataSource URL (ใช้ env() แทน .env ในไฟล์ schema)
  datasource: {
    url: env("DATABASE_URL"),
  },

  // คอนฟิกการ Migration และ Seed
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
});
