import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// 🟢 GET
export async function GET(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    // Next.js 14 and 15 compatibility
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) return NextResponse.json({ error: "Client id is required" }, { status: 400 });

    const items = await prisma.checklistItem.findMany({
      where: { clientId: id },
    });

    const formattedItems = items.map((item) => ({
      date: item.date,
      type: item.type,
      completed: item.completed,
      workoutId: item.type === "workout" ? item.itemId : undefined,
      dietId: item.type === "diet" ? item.itemId : undefined,
    }));

    return NextResponse.json(formattedItems);
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// 🟢 POST
export async function POST(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    // Handling params safely for both Next.js versions
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: "Client id is required" }, { status: 400 });
    }

    const body = await req.json();
    
    // 🐛 DEBUG LOG: Ye VS Code terminal me print hoga
    console.log("📥 CHECKLIST RECEIVED DATA:", body);

    const { date, type, workoutId, dietId, completed } = body;
    const itemId = type === "workout" ? workoutId : dietId;

    // Strict validation check
    if (!date || !type || !itemId) {
      console.log("❌ ERROR: Missing fields -> Date:", date, "Type:", type, "ItemId:", itemId);
      return NextResponse.json({ 
        error: "Missing required fields", 
        received: { date, type, itemId } 
      }, { status: 400 });
    }

    // Ensure completed is strictly boolean (true/false)
    const isCompleted = completed === true || completed === "true";

    const upsertedItem = await prisma.checklistItem.upsert({
      where: {
        clientId_date_type_itemId: {
          clientId: id,
          date: date,
          type: type,
          itemId: itemId,
        },
      },
      update: {
        completed: isCompleted,
      },
      create: {
        clientId: id,
        date: date,
        type: type,
        itemId: itemId,
        completed: isCompleted,
      },
    });

    console.log("✅ CHECKLIST SAVED SUCCESSFULLY:", upsertedItem.id);
    return NextResponse.json({ success: true, item: upsertedItem });

  } catch (err: any) {
    console.error("POST CHECKLIST ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}