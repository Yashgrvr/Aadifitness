import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const trainerId = req.headers.get("x-trainer-id");

    if (!trainerId) {
      return NextResponse.json(
        { success: false, message: "Missing trainer ID" },
        { status: 400 }
      );
    }

    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
    });

    if (!trainer) {
      return NextResponse.json(
        { success: false, message: "Trainer not found" },
        { status: 404 }
      );
    }

    // yahan sirf woh fields lo jo Client model me exist karte hain
    const pendingClients = await prisma.client.findMany({
      where: {
        trainerId,
        paymentStatus: "completed",
        password: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        currentWeight: true,
        goalWeight: true,
        plan: true,
        // paymentDate nahi hai to hata diya
        // passwordGeneratedAt bhi agar model me nahi hai to hata do
      },
      orderBy: {
        createdAt: "desc", // paymentDate ki jagah createdAt se sort
      },
    });

    const formattedClients = pendingClients.map((client) => ({
      ...client,
      fitnessGoal: client.plan, // temporary mapping
      paymentDate: new Date().toISOString(), // dummy, UI ke liye
      passwordGeneratedAt: null,
    }));

    return NextResponse.json(
      {
        success: true,
        count: formattedClients.length,
        clients: formattedClients,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("pending-clients error", e);
    return NextResponse.json(
      { success: false, message: "Failed to fetch pending clients" },
      { status: 500 }
    );
  }
}
