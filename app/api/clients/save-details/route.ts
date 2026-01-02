import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// Fallback ID agar frontend se trainerId na aaye
const DEFAULT_TRAINER_ID = "693177322d42beddadbf04e4";

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clientId,
      email,
      currentWeight,
      goalWeight,
      initialWeight, // Frontend se naya field
      firstName,
      lastName,
      fitnessGoal,
      trainerId, // Frontend se dynamic trainerId ka support
    } = body;

    // 1. Basic Validation
    if (!email || currentWeight === undefined || goalWeight === undefined || !fitnessGoal) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400 }
      );
    }

    const cw = Number(currentWeight);
    const gw = Number(goalWeight);
    const iw = initialWeight ? Number(initialWeight) : cw;

    if (Number.isNaN(cw) || Number.isNaN(gw) || cw < 1 || cw > 300 || gw < 1 || gw > 300) {
      return NextResponse.json(
        { success: false, message: "Weights must be between 1 and 300 kg" },
        { status: 400 }
      );
    }

    const validGoals = ["weight_loss", "muscle_gain", "maintenance", "strength"];
    if (!validGoals.includes(fitnessGoal)) {
      return NextResponse.json(
        { success: false, message: "Invalid fitness goal" },
        { status: 400 }
      );
    }

    // 2. Email Duplicate Check (Updated logic)
    const cleanClientId = typeof clientId === "string" && clientId.trim().length > 0
      ? clientId.trim()
      : null;

    const existingByEmail = await prisma.client.findFirst({
      where: {
        email: email,
        NOT: cleanClientId ? { id: cleanClientId } : undefined,
      },
    });

    if (existingByEmail) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 409 }
      );
    }

    // 3. Create or Update Client
    let client;
    const fullName = [firstName, lastName].filter((x) => x && x.trim().length > 0).join(" ") || "New Client";

    if (cleanClientId) {
      // ✅ UPDATE: Existing client ka data update karein
      client = await prisma.client.update({
        where: { id: cleanClientId },
        data: {
          name: fullName,
          email,
          currentWeight: cw,
          goalWeight: gw,
          fitnessGoal: fitnessGoal as any,
        },
      });
    } else {
      // ✅ CREATE: Naya client banayein (Password: null taaki pending mein dikhe)
      client = await prisma.client.create({
        data: {
          name: fullName,
          email,
          password: null, // Critical for "Pending" status
          currentWeight: cw,
          initialWeight: iw, // Registration ke waqt ka weight save karein
          goalWeight: gw,
          fitnessGoal: fitnessGoal as any,
          plan: "onboarding",
          progress: 0,
          sessionsCompleted: 0,
          sessionsTotal: 0,
          paymentStatus: "pending",
          planDuration: 30,
          planAmount: 0,
          credentialsSent: false,
          trainer: {
            connect: { id: trainerId || DEFAULT_TRAINER_ID },
          },
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Details saved successfully",
        clientId: client.id,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("save-details error", e);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}