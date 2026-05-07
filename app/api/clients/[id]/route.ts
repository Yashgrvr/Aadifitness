import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Next.js 15 format: params ab ek Promise hai
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Params ko await karna zaroori hai!
    const resolvedParams = await params;

    const client = await prisma.client.findUnique({
      where: { 
        id: resolvedParams.id 
      },
      include: {
        workouts: true,
        diets: true,
        checklistItems: true
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error("Error fetching single client:", error);
    return NextResponse.json({ error: "Error fetching client details" }, { status: 500 });
  }
}   