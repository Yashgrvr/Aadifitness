import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Razorpay from "razorpay";

const prisma = new PrismaClient();

const planAmounts: Record<string, number> = {
  "1_month": 99900,
  "3_months": 249900,
  "6_months": 449900,
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, plan, amount } = body;

    if (!clientId || !plan || !amount) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!planAmounts[plan]) {
      return NextResponse.json(
        { success: false, message: "Invalid plan" },
        { status: 400 }
      );
    }

    if (amount !== planAmounts[plan]) {
      return NextResponse.json(
        { success: false, message: "Amount mismatch with plan" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json(
        { success: false, message: "Client not found" },
        { status: 404 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `client_${clientId}_${Date.now()}`,
      notes: {
        clientId,
        plan,
      },
    });

    // OPTIONAL: you already have Payment model; keep log minimal for now
    await prisma.payment.create({
      data: {
        razorpayOrderId: order.id,
        amount,
        currency: "INR",
        status: "pending",
        clientEmail: client.email,
        clientName: client.name,
        planDuration: plan === "1_month" ? 30 : plan === "3_months" ? 90 : 180,
        trainerId: client.trainerId ?? "", // if you don’t have trainer yet, use dummy and adjust later
      },
    });

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        amount,
        currency: "INR",
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("create-order error", e);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
