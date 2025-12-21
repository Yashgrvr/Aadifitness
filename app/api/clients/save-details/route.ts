import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, email, currentWeight, goalWeight, fitnessGoal } = body;

    // required checks
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

    const validGoals = [
      "weight_loss",
      "muscle_gain",
      "maintenance",
      "strength",
    ];
    if (!validGoals.includes(fitnessGoal)) {
      return NextResponse.json(
        { success: false, message: "Invalid fitness goal" },
        { status: 400 }
      );
    }

    // ensure email is unique for some other client
    const existingByEmail = await prisma.client.findFirst({
      where: {
        email,
        ...(clientId ? { id: { not: clientId } } : {}),
      },
    });
    if (existingByEmail) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 409 }
      );
    }

    // if clientId provided and exists => update
    let client = clientId
      ? await prisma.client.findUnique({ where: { id: clientId } })
      : null;

    if (client) {
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          email,
          currentWeight: cw,
          goalWeight: gw,
          // map fitnessGoal from prompt into your structure:
          // for now just store in plan or leave as is (we'll wire later)
          // you don't have a fitnessGoal field, so we just keep weights now.
        },
      });
    } else {
      // create new client with DEFAULTS for all required fields in your schema
      client = await prisma.client.create({
        data: {
          // required fields
          name: "New Client", // can be updated later
          email,
          password: null,
          currentWeight: cw,
          goalWeight: gw,
          plan: "onboarding", // placeholder; your real plan/payment later
          progress: 0,
          sessionsCompleted: 0,
          sessionsTotal: 0,
          paymentStatus: "pending",
          planDuration: 30,
          planAmount: 0,
          credentialsSent: false,
          // relations: for now no trainer / payment linked
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
