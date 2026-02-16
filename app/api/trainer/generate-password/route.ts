import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generatePassword } from "@/lib/passwordgenerator";
import { sendPasswordEmail } from "@/lib/emailservices";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, trainerId } = body;

    if (!clientId || !trainerId) {
      return NextResponse.json(
        { success: false, message: "Missing clientId or trainerId" },
        { status: 400 }
      );
    }

    // Verify trainer exists
    const trainer = await prisma.trainer.findUnique({
      where: { id: trainerId },
    });
    if (!trainer) {
      return NextResponse.json(
        { success: false, message: "Trainer not found" },
        { status: 404 }
      );
    }

    // Get client
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      return NextResponse.json(
        { success: false, message: "Client not found" },
        { status: 404 }
      );
    }

    // Check if password already sent
    if (client.password) {
      return NextResponse.json(
        {
          success: false,
          message: `Password already sent on ${client.passwordGeneratedAt?.toLocaleDateString()}`,
        },
        { status: 409 }
      );
    }

    // Generate password
    const plainPassword = generatePassword(12);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Update client
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        password: hashedPassword,
        passwordGeneratedAt: new Date(),
        passwordExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        trainerId: trainerId,
      },
    });

    // Send email
    const emailSent = await sendPasswordEmail(
      client.email,
      client.name || "User",
      plainPassword
    );

    return NextResponse.json(
      {
        success: true,
        message: "Password generated and sent successfully",
        clientId: updatedClient.id,
        emailSent,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("generate-password error", e);
    return NextResponse.json(
      { success: false, message: "Failed to generate password" },
      { status: 500 }
    );
  }
}
