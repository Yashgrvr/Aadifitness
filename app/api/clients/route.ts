import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const dynamic = 'force-dynamic';


const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trainerId = searchParams.get("trainerId");

    if (!trainerId) {
      return NextResponse.json(
        { error: "trainerId is required" },
        { status: 400 }
      );
    }

    const clients = await prisma.client.findMany({
      where: { trainerId },
      include: {
        workouts: true,
        diets: true,
      },
    });

    return NextResponse.json({ clients });
  } catch (err) {
    console.error("GET /api/clients error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
