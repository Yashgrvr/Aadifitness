import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const dynamic = 'force-dynamic';


const prisma = new PrismaClient();

// Add diet item
export async function POST(req: NextRequest) {
  try {
    const { clientId, time, meal, calories } = await req.json();

    if (!clientId || !meal) {
      return NextResponse.json(
        { error: "clientId and meal are required" },
        { status: 400 }
      );
    }

    const diet = await prisma.diet.create({
      data: {
        clientId,
        time: time ?? "",
        meal,
        calories: calories ?? 0,
      },
    });

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        workouts: true,
        diets: true,
      },
    });

    return NextResponse.json({ client, diet });
  } catch (err) {
    console.error("POST /api/clients/diet error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Delete diet item
export async function DELETE(req: NextRequest) {
  try {
    const { clientId, id } = await req.json();

    if (!clientId || !id) {
      return NextResponse.json(
        { error: "clientId and id are required" },
        { status: 400 }
      );
    }

    await prisma.diet.delete({
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
    console.error("DELETE /api/clients/diet error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
