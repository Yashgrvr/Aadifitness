import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, name, currentWeight, trainerId } = await req.json();

    if (!email || !name || !trainerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.client.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Client already exists" },
        { status: 400 }
      );
    }

    // temp password (8 chars)
    const tempPassword = crypto.randomBytes(4).toString("hex").toUpperCase();

    const client = await prisma.client.create({
      data: {
        email,
        name,
        password: tempPassword,      // plain for now (simple flow)
        currentWeight: currentWeight || 0,
        goalWeight: currentWeight || 0,
        plan: "Not set",
        progress: 0,
        sessionsCompleted: 0,
        sessionsTotal: 0,
        paymentStatus: "pending",
        trainerId,
      },
    });

    return NextResponse.json({
      success: true,
      clientId: client.id,
      tempPassword,
    });
  } catch (err) {
    console.error("CREATE CLIENT ERROR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
