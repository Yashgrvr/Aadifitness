import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Add workout
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

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        workouts: true,
        diets: true,
      },
    });

    return NextResponse.json({ client, workout });
  } catch (err) {
    console.error("POST /api/clients/workout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Delete workout
export async function DELETE(req: NextRequest) {
  try {
    const { clientId, id } = await req.json();

    if (!clientId || !id) {
      return NextResponse.json(
        { error: "clientId and id are required" },
        { status: 400 }
      );
    }

    await prisma.workout.delete({
      where: { id },
    });

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        workouts: true,
        diets: true,
      },
    });

    return NextResponse.json({ client });
  } catch (err) {
    console.error("DELETE /api/clients/workout error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
