import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, orderId, paymentId, signature, plan } = body;

    if (!clientId || !orderId || !paymentId || !signature || !plan) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || "";
    const expectedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update Payment record
    const payment = await prisma.payment.update({
      where: { razorpayOrderId: orderId },
      data: {
        status: "completed",
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      },
    });

    // Update Client subscription status
    const planDurationMap: Record<string, number> = {
      "1_month": 30,
      "3_months": 90,
      "6_months": 180,
    };

    const planAmountMap: Record<string, number> = {
      "1_month": 100,
      "3_months": 249900,
      "6_months": 449900,
    };

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(
      subscriptionEndDate.getDate() + (planDurationMap[plan] || 30)
    );

    await prisma.client.update({
      where: { id: clientId },
      data: {
        paymentStatus: "completed",
        subscriptionDate: new Date(),
        subscriptionEndDate,
        planAmount: planAmountMap[plan] || 0,
        plan,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully",
        clientId,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("verify-payment error", e);
    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 500 }
    );
  }
}
