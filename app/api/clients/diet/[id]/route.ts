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
    const { time, meal, calories } = await req.json();

    if (!meal) {
      return NextResponse.json(
        { error: "meal is required" },
        { status: 400 }
      );
    }

    const diet = await prisma.diet.update({
      where: { id },
      data: {
        time: time ?? "",
        meal,
        calories: calories ?? 0,
      },
    });

    return NextResponse.json({ diet });
  } catch (err) {
    console.error("PUT /api/diets/[id] error:", err);
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

    await prisma.diet.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Diet deleted" });
  } catch (err) {
    console.error("DELETE /api/diets/[id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
