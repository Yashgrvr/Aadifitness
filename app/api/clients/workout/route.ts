import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { clientId, exercise, sets, reps, weight } = await req.json();

    if (!clientId || !exercise) {
      return NextResponse.json(
        { error: "clientId and exercise are required" },
        { status: 400 }
      );
    }

    const workout = await prisma.workout.create({
      data: {
        clientId,
        exercise,
        sets: sets ?? "",
        reps: reps ?? "",
        weight: weight ?? "",
      },
    });

    return NextResponse.json({ workout });
  } catch (err) {
    console.error("POST /api/workouts error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
