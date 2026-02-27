import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { clientId, weeklyData } = await req.json();

    if (!clientId) return NextResponse.json({ error: "No Client ID" }, { status: 400 });

    // ⚡ Terminal mein check karna ye log aata hai ya nahi
    console.log("Cleaning workouts for client:", clientId);

    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Force Delete (Isse saara purana kachra saaf hoga)
      const deleted = await tx.workout.deleteMany({
        where: { clientId: String(clientId) }
      });
      console.log(`Deleted ${deleted.count} old workouts.`);

      // Step 2: Prepare Fresh Data
      const workoutsToCreate: any[] = [];
      
      Object.entries(weeklyData).forEach(([day, exercises]: [string, any]) => {
        if (Array.isArray(exercises)) {
          exercises.forEach((ex: any) => {
            if (ex.exercise && ex.exercise.trim() !== "") {
              workoutsToCreate.push({
                clientId: String(clientId),
                day: day,
                exercise: ex.exercise,
                sets: String(ex.sets || "0"),
                reps: String(ex.reps || "0"),
                weight: String(ex.weight || "0"),
                gifUrl: ex.gifUrl || "",
                insight: ex.insight || ""
              });
            }
          });
        }
      });

      // Step 3: Insert only if new data exists
      if (workoutsToCreate.length > 0) {
        return await tx.workout.createMany({ data: workoutsToCreate });
      }
    });

    return NextResponse.json({ success: true, message: "Cleaned and Overwritten" });
  } catch (error) {
    console.error("CRITICAL ERROR:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}