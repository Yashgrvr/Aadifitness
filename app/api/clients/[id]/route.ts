import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

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
      date,
      checklist,
    } = body;

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // ✅ 1. Stats update (old behavior)
    if (action === "updateStats") {
      const updatedClient = await prisma.client.update({
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

      return NextResponse.json({ client: updatedClient });
    }

    // ✅ 2. Only weight update
    if (action === "updateWeight") {
      if (currentWeight === undefined) {
        return NextResponse.json(
          { error: "Weight is required" },
          { status: 400 }
        );
      }

      const updatedClient = await prisma.client.update({
        where: { id },
        data: { currentWeight: Number(currentWeight) },
        include: { workouts: true, diets: true },
      });

      return NextResponse.json({ client: updatedClient });
    }

    // ✅ 3. Daily checklist update (Json field)
    if (action === "updateChecklist") {
      if (!date || !checklist) {
        return NextResponse.json(
          { error: "Date and checklist are required" },
          { status: 400 }
        );
      }

      // 🔴 JsonValue typing ko bypass karne ka simple way
      const clientAny = client as any;
      const existing: Record<string, any> =
        (clientAny.checklist as Record<string, any>) || {};

      existing[date] = checklist;

      const updatedClient = await prisma.client.update({
        where: { id },
        data: { checklistItems: existing },
        include: { workouts: true, diets: true },
      });

      return NextResponse.json({ client: updatedClient });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("UPDATE CLIENT ERROR:", err);
    return NextResponse.json(
      { error: "Server error while updating client" },
      { status: 500 }
    );
  }
}
