import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Razorpay from "razorpay";

const prisma = new PrismaClient();

// TODO: yahan Aadi trainer ka actual ObjectId daalo
const DEFAULT_TRAINER_ID = "693177322d42beddadbf04e4";

const planAmounts: Record<string, number> = {
  "1_month": 100,
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

    // receipt must be <= 40 chars
    const shortClientId = String(clientId).slice(-6);
    const shortTime = Date.now().toString().slice(-6);

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `c_${shortClientId}_${shortTime}`,
      notes: {
        clientId,
        plan,
      },
    });

    await prisma.payment.create({
      data: {
        razorpayOrderId: order.id,
        amount,
        currency: "INR",
        status: "pending",
        clientEmail: client.email,
        clientName: client.name,
        planDuration: plan === "1_month" ? 30 : plan === "3_months" ? 90 : 180,
        trainerId: client.trainerId || DEFAULT_TRAINER_ID,
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
