import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic"; // important

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Client id is required" },
        { status: 400 }
      );
    }

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
    // Never throw raw error – always return JSON
    return NextResponse.json(
      { error: "Server error while fetching client" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Client id is required" },
        { status: 400 }
      );
    }

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
      { error: "Server error while updating client" },
      { status: 500 }
    );
  }
}
