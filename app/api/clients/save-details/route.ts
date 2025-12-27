import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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
      fitnessGoal,
      firstName,
      lastName,
    } = body;

    if (
      !email ||
      currentWeight === undefined ||
      goalWeight === undefined ||
      !fitnessGoal
    ) {
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
    if (
      Number.isNaN(cw) ||
      Number.isNaN(gw) ||
      cw < 1 ||
      cw > 300 ||
      gw < 1 ||
      gw > 300
    ) {
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

    // ---- EMAIL DUPLICATE CHECK ----
    // clientId ko clean karo (null/undefined/"" sabko null treat)
    const cleanClientId =
      typeof clientId === "string" && clientId.trim().length > 0
        ? clientId.trim()
        : null;

    const existingByEmail = await prisma.client.findFirst({
      where: cleanClientId
        ? {
            email,
            // same email allowed ONLY for same client
            id: { not: cleanClientId },
          }
        : { email },
    });

    if (existingByEmail) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 409 }
      );
    }

    // ---- CREATE or UPDATE CLIENT ----
    let client = cleanClientId
      ? await prisma.client.findUnique({ where: { id: cleanClientId } })
      : null;

    const fullName =
      [firstName, lastName].filter((x) => x && x.trim().length > 0).join(" ") ||
      "New Client";

    if (client) {
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          name: fullName,
          email,
          currentWeight: cw,
          goalWeight: gw,
          fitnessGoal,
        },
      });
    } else {
      client = await prisma.client.create({
        data: {
          name: fullName,
          email,
          password: null,
          currentWeight: cw,
          goalWeight: gw,
          fitnessGoal,
          plan: "onboarding",
          progress: 0,
          sessionsCompleted: 0,
          sessionsTotal: 0,
          paymentStatus: "pending",
          planDuration: 30,
          planAmount: 0,
          credentialsSent: false,
          trainer: {
            connect: { id: DEFAULT_TRAINER_ID },
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
