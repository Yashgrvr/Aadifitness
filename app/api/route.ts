import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

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

      if (!trainer) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const ok = await bcrypt.compare(password, trainer.password);
      if (!ok) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { id: trainer.id, email: trainer.email, role: "trainer" },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

      return NextResponse.json({
        success: true,
        role: "trainer",
        id: trainer.id,
        name: trainer.name,
        token,
      });
    }

    // CLIENT LOGIN
    if (role === "client") {
      const client = await prisma.client.findUnique({
        where: { email },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      // ✅ FIX: Handle null password with type safety
      const hashed = client.password;

      if (!hashed) {
        return NextResponse.json(
          { error: "Account not fully activated. Contact trainer." },
          { status: 403 }
        );
      }

      const ok = await bcrypt.compare(password, hashed);
      if (!ok) {
        return NextResponse.json(
          { error: "Invalid credentials" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        {
          id: client.id,
          email: client.email,
          role: "client",
          trainerId: client.trainerId,
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

      return NextResponse.json({
        success: true,
        role: "client",
        id: client.id,
        name: client.name,
        token,
      });
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
