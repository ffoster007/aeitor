// lib/prisma.ts

import { PrismaClient } from "@/lib/generated/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// สร้าง connection pool (PostgreSQL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// สร้าง adapter
const adapter = new PrismaPg(pool);

// Singleton (กัน connection leak)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // 👈 สำคัญมาก
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}