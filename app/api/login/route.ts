import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    // ===========================
    // TRAINER LOGIN
    // ===========================
    if (role === "trainer") {
      const trainer = await prisma.trainer.findUnique({
        where: { email },
      });

      if (!trainer) {
        console.log("Trainer not found:", email);
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // ✅ Use bcrypt for password comparison
      const isPasswordValid = await bcrypt.compare(password, trainer.password);

      if (!isPasswordValid) {
        console.log("Trainer password mismatch:", email);
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { id: trainer.id, role: "trainer", email: trainer.email },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return NextResponse.json({
        ok: true,
        token,
        role: "trainer",
        name: trainer.name,
        trainerId: trainer.id,
      });
    }

    // ===========================
    // CLIENT LOGIN
    // ===========================
    if (role === "client") {
      const client = await prisma.client.findUnique({
        where: { email },
        include: {
          trainer: true,
          payment: true,
        },
      });

      if (!client) {
        console.log("Client not found:", email);
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // ✅ NEW: Check if payment is completed
      if (client.paymentStatus !== "completed") {
        console.log(
          "Client payment not completed:",
          email,
          "Status:",
          client.paymentStatus
        );
        return NextResponse.json(
          {
            error: "Payment pending. Please complete payment to access dashboard.",
            paymentStatus: client.paymentStatus,
          },
          { status: 403 }
        );
      }

      // ✅ NEW: Check if subscription expired
      if (client.subscriptionEndDate && new Date() > client.subscriptionEndDate) {
        console.log("Client subscription expired:", email);
        return NextResponse.json(
          {
            error: "Subscription expired. Please renew to continue.",
            paymentStatus: "expired",
          },
          { status: 403 }
        );
      }

      // ✅ NEW: Validate password with bcrypt (NEXT 16 FIX)
      const hashed = client.password;

      if (!hashed) {
        console.log("Client has no password set:", email);
        return NextResponse.json(
          { error: "Account not fully activated. Contact trainer." },
          { status: 403 }
        );
      }

      const isPasswordValid = await bcrypt.compare(password, hashed);

      if (!isPasswordValid) {
        console.log("Client password mismatch:", email);
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        {
          id: client.id,
          role: "client",
          email: client.email,
          trainerId: client.trainerId,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" }
      );

      return NextResponse.json({
        ok: true,
        token,
        role: "client",
        name: client.name,
        clientId: client.id,
        trainerId: client.trainerId,
        paymentStatus: client.paymentStatus,
        subscriptionEndDate: client.subscriptionEndDate,
      });
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}