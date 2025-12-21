import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { clientId, oldPassword, newPassword } = await req.json();

    if (!clientId || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    if (client.password !== oldPassword) {
      return NextResponse.json(
        { error: "Incorrect temporary password" },
        { status: 401 }
      );
    }

    await prisma.client.update({
      where: { id: clientId },
      data: { password: newPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated",
    });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
