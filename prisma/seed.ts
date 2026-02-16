import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.checklistItem.deleteMany();
  await prisma.diet.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.client.deleteMany();
  await prisma.trainer.deleteMany();

  // Create trainer
  const hashedPassword = await bcrypt.hash("trainer555", 10);
  const trainer = await prisma.trainer.create({
    data: {
      name: "Rahul Coach",
      email: "trainer@demo.com",
      password: hashedPassword,
      gymName: "VibRation Gym",
      upiId: "rahul@upi",
    },
  });

  console.log("✅ Trainer created:", trainer.email);

  // Create 2 sample clients
  for (let i = 1; i <= 2; i++) {
    const clientEmail = `client${i}@demo.com`;
    const clientPassword = await bcrypt.hash("client123", 10);
    const uniqueCode = uuid().slice(0, 8).toUpperCase();

    const client = await prisma.client.create({
      data: {
        name: `Client ${i}`,
        email: clientEmail,
        password: clientPassword,
        currentWeight: 82 + i,
        goalWeight: 75,
        plan: "Weight Loss - 12 weeks",
        progress: 50,
        sessionsCompleted: 6,
        sessionsTotal: 12,
        paymentStatus: "paid",
        trainerId: trainer.id,
      },
    });

    // Add workouts
    await prisma.workout.createMany({
      data: [
        {
          exercise: "Barbell Squat",
          sets: "4",
          reps: "8",
          weight: "100 kg",
          clientId: client.id,
        },
        {
          exercise: "Leg Press",
          sets: "3",
          reps: "12",
          weight: "150 kg",
          clientId: client.id,
        },
      ],
    });

    // Add diet
    await prisma.diet.createMany({
      data: [
        {
          time: "7:00 AM",
          meal: "Oats + Eggs",
          calories: 450,
          clientId: client.id,
        },
        {
          time: "1:00 PM",
          meal: "Chicken + Rice",
          calories: 650,
          clientId: client.id,
        },
      ],
    });

    console.log(`✅ Client ${i}:`, clientEmail, `Code: ${uniqueCode}`);
  }

  console.log("\n✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
