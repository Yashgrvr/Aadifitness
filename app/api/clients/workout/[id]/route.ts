import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { exercise, sets, reps, weight } = await req.json();

    if (!exercise) {
      return NextResponse.json(
        { error: "exercise is required" },
        { status: 400 }
      );
    }

    const workout = await prisma.workout.update({
      where: { id },
      data: {
        exercise,
        sets: sets ?? "",
        reps: reps ?? "",
        weight: weight ?? "",
      },
    });

    return NextResponse.json({ workout });
  } catch (err) {
    console.error("PUT /api/workouts/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    await prisma.workout.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Workout deleted" });
  } catch (err) {
    console.error("DELETE /api/workouts/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
