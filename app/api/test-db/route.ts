import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';


export async function GET(req: NextRequest) {
  try {
    // Just check DB connection
    await prisma.$connect();

    // Hash password
    const passwordHash = await bcrypt.hash("trainer555", 10);

    // Create / update trainer only, no other models
    const trainer = await prisma.trainer.upsert({
      where: { email: "trainer@demo.com" },
      update: {
        name: "Demo Trainer",
      },
      create: {
        name: "Demo Trainer",
        email: "trainer@demo.com",
        password: passwordHash,
        gymName: "Demo Gym",
        upiId: "demo@upi",
      },
    });

    return NextResponse.json({ ok: true, trainer });
  } catch (err: any) {
    console.error("TEST-DB ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "DB error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
