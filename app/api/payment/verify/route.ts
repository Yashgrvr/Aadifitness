import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, orderId, paymentId, signature, plan } = body;

    // 1. Basic Validation
    if (!clientId || !orderId || !paymentId || !signature || !plan) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Razorpay signature verify karein
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

    // 3. Update Payment record aur usey variable mein save karein
    const payment = await prisma.payment.update({
      where: { razorpayOrderId: orderId },
      data: {
        status: "completed",
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      },
    });

    // 4. Subscription End Date calculate karein
    // payment record se planDuration uthayein jo create-order mein save kiya tha
    const planDuration = payment.planDuration || 30; 
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + planDuration);

    // 5. Client record update karein aur Payment ke saath LINK karein
    await prisma.client.update({
      where: { id: clientId },
      data: {
        paymentStatus: "completed",
        subscriptionDate: new Date(),
        subscriptionEndDate,
        // Manual map ki jagah direct payment record ka amount use karein
        planAmount: payment.amount, 
        plan,
        // CRITICAL: Dono tables ko aapas mein link karne ke liye
        paymentId: payment.id, 
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