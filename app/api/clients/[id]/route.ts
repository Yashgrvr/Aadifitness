import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET single client
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: { workouts: true, diets: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (err: any) {
    console.error("GET CLIENT ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// POST – update stats
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await req.json();
    const {
      action,
      currentWeight,
      goalWeight,
      progress,
      plan,
      sessionsCompleted,
      sessionsTotal,
    } = body;

    if (action !== "updateStats") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    console.log("UPDATE CLIENT ID:", id);
    console.log("BODY:", body);

    const client = await prisma.client.update({
      where: { id },
      data: {
        currentWeight: Number(currentWeight),
        goalWeight: Number(goalWeight),
        progress: Number(progress),
        plan: String(plan),
        sessionsCompleted: Number(sessionsCompleted),
        sessionsTotal: Number(sessionsTotal),
      },
      include: { workouts: true, diets: true },
    });

    return NextResponse.json({ client });
  } catch (err: any) {
    console.error("UPDATE CLIENT ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
