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

    // Prisma query mein fitnessGoal aur createdAt ko select karein
    const pendingClients = await prisma.client.findMany({
      where: {
        trainerId,
        paymentStatus: "completed",
        password: null, // Jab tak password null hai, tab tak client pending rahega
      },
      select: {
        id: true,
        name: true,
        email: true,
        currentWeight: true,
        goalWeight: true,
        fitnessGoal: true, // ✅ Plan ki jagah fitnessGoal select karein
        plan: true,
        createdAt: true,   // ✅ Payment date ke liye createdAt select karein
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedClients = pendingClients.map((client) => ({
      ...client,
      // ✅ FIX: client.plan ki jagah asli fitnessGoal mapping use karein
      fitnessGoal: client.fitnessGoal || "Weight Loss", 
      // ✅ FIX: Dummy date ki jagah database se asli date (createdAt) dikhayein
      paymentDate: client.createdAt, 
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