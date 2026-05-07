import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trainerId = searchParams.get("trainerId");

    if (!trainerId) {
      return NextResponse.json({ error: "Trainer ID required" }, { status: 400 });
    }

    // Trainer ke saare clients fetch karo unke nested data ke saath
    const clients = await prisma.client.findMany({
      where: { 
        trainerId: trainerId,
        paymentStatus: "completed" // Sirf unhe dikhao jinka payment ho chuka hai
      },
      include: {
        workouts: true,
        diets: true,
        checklistItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("API ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}