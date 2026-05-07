// lib/db.ts
import { PrismaClient } from "@prisma/client";

// Next.js development mode mein multiple instances se bachne ke liye singleton pattern
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Yahan se 'prisma' export ho raha hai jo aapke API routes ko chahiye
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;