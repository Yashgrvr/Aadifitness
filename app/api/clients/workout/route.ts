import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. GET Method (Logs mein jo 405 error aa raha hai, use ye fix karega)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ success: false, message: "Client ID is required" }, { status: 400 });
    }

    const workouts = await prisma.workout.findMany({
      where: { clientId: clientId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ success: true, workouts });
  } catch (error) {
    console.error("GET_WORKOUT_ERROR:", error);
    return NextResponse.json({ success: false, message: "Error fetching workouts" }, { status: 500 });
  }
}

// 2. POST Method (Purane single add ke liye)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, exercise, sets, reps, weight, day, gifUrl } = body;

    const workout = await prisma.workout.create({
      data: {
        clientId,
        exercise,
        sets: String(sets),
        reps: String(reps),
        weight: String(weight),
        day: day || "Monday",
        gifUrl: gifUrl || null
      },
    });

    return NextResponse.json({ success: true, workout });
  } catch (error) {
    console.error("POST_WORKOUT_ERROR:", error);
    return NextResponse.json({ success: false, message: "Error creating workout" }, { status: 500 });
  }
}