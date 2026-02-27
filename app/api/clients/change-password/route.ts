import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs"; // Hashing library

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { clientId, oldPassword, newPassword } = await req.json();

    if (!clientId || !oldPassword || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const cleanOldPassword = oldPassword.trim();
    const cleanNewPassword = newPassword.trim();
    
    let isMatch = false;

    // 🔥 THE FIX: Check if password in DB is Plain-Text or Hashed
    if (client.password === cleanOldPassword) {
        // Condition 1: Database mein password bina hash hue pada hai
        isMatch = true;
    } else {
        // Condition 2: Database mein password Hashed hai
        try {
            isMatch = await bcrypt.compare(cleanOldPassword, client.password || "");
        } catch(e) {
            console.log("Bcrypt compare skipped (Not a valid hash)");
        }
    }

    if (!isMatch) {
      console.log("❌ MISMATCH: Client ID:", clientId);
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 401 }
      );
    }

    // Naya Password HASH karke save karo (Taaki hamesha secure rahe)
    const hashedNewPassword = await bcrypt.hash(cleanNewPassword, 10);

    await prisma.client.update({
      where: { id: clientId },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Vault Secured! Password updated.",
    });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}