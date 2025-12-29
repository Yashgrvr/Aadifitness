import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client"; // ✅ Prisma import added for Types

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, weeklyData } = body;

    // 1. Basic Validation
    if (!clientId) {
      return NextResponse.json(
        { success: false, message: "Client ID is required" }, 
        { status: 400 }
      );
    }

    if (!weeklyData || typeof weeklyData !== 'object') {
      return NextResponse.json(
        { success: false, message: "Invalid weekly data format" }, 
        { status: 400 }
      );
    }

    // 2. Database Transaction (Delete old + Create new)
    const result = await prisma.$transaction(async (tx) => {
      
      // Purana workout saaf karein is client ke liye
      await tx.workout.deleteMany({
        where: { clientId: clientId },
      });

      // ✅ TypeScript Fix: Array ka type define kiya taaki error na aaye
      const workoutsToCreate: Prisma.WorkoutCreateManyInput[] = [];

      const days = Object.keys(weeklyData);

      for (const day of days) {
        const exercises = weeklyData[day];
        
        if (Array.isArray(exercises)) {
          exercises.forEach((ex: any) => {
            // Sirf valid exercises add karein
            if (ex.exercise && ex.exercise.trim() !== "") {
              workoutsToCreate.push({
                exercise: ex.exercise,
                sets: String(ex.sets || "0"),
                reps: String(ex.reps || "0"),
                weight: String(ex.weight || "0"),
                gifUrl: ex.gifUrl || null,
                day: day, // Monday, Tuesday, etc.
                clientId: clientId,
              });
            }
          });
        }
      }

      // 3. Bulk Create (Agar data hai toh)
      if (workoutsToCreate.length > 0) {
        return await tx.workout.createMany({
          data: workoutsToCreate,
        });
      }
      
      return { count: 0 };
    });

    return NextResponse.json({
      success: true,
      message: "Weekly workout plan updated successfully!",
      count: result.count
    });

  } catch (error: any) {
    console.error("BULK_SAVE_ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" }, 
      { status: 500 }
    );
  }
}