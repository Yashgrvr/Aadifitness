import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

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

    return NextResponse.json({ diet });
  } catch (err) {
    console.error("POST /api/diets error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
