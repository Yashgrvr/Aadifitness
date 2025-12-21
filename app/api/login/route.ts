import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

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

    // TRAINER LOGIN
    if (role === "trainer") {
      const trainer = await prisma.trainer.findUnique({
        where: { email },
      });
      console.log("TRAINER LOOKUP:", email, trainer);

      if (!trainer) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Plain-text compare (until trainer passwords भी hash करोगे)
      const isPasswordValid = password === trainer.password;
      console.log("TRAINER PASSWORD CHECK:", isPasswordValid);

      if (!isPasswordValid) {
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

    // CLIENT LOGIN
    if (role === "client") {
      const client = await prisma.client.findUnique({
        where: { email },
        include: {
          trainer: true,
          payment: true,
        },
      });
      console.log("CLIENT LOOKUP:", email, client);

      if (!client) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Subscription expiry check
      if (
        client.subscriptionEndDate &&
        new Date() > client.subscriptionEndDate
      ) {
        return NextResponse.json(
          {
            error: "Subscription expired. Please renew to continue.",
            paymentStatus: "expired",
          },
          { status: 403 }
        );
      }

      const storedPassword = client.password;
      if (!storedPassword) {
        return NextResponse.json(
          { error: "Account not fully activated. Contact trainer." },
          { status: 403 }
        );
      }

      // bcrypt se hashed password compare
      const isPasswordValid = await bcrypt.compare(password, storedPassword);
      console.log("CLIENT PASSWORD CHECK:", {
        input: password,
        hash: storedPassword,
        ok: isPasswordValid,
      });

      if (!isPasswordValid) {
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

      // ✅ Check if password is temp (< 20 chars) or hashed (60+ chars)
      const needsOnboarding = storedPassword.length < 20;

      return NextResponse.json({
        ok: true,
        token,
        role: "client",
        name: client.name,
        clientId: client.id,
        trainerId: client.trainerId,
        paymentStatus: client.paymentStatus,
        subscriptionEndDate: client.subscriptionEndDate,
        needsOnboarding,
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
