import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create manager user
  const managerEmail = "manager@dbroyal.com";

  // Check if manager already exists
  const existingManager = await prisma.user.findUnique({
    where: { email: managerEmail },
  });

  if (existingManager) {
    console.log("✓ Manager user already exists");
    console.log(`  Email: ${existingManager.email}`);
    console.log(`  Name: ${existingManager.name}`);
    console.log(`  Role: ${existingManager.role}`);
    return;
  }

  // Hash password
  const password = "Manager@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create manager
  const manager = await prisma.user.create({
    data: {
      email: managerEmail,
      name: "System Manager",
      passwordHash: hashedPassword,
      role: Role.MANAGER,
      phone: "+234-123-456-7890",
    },
  });

  console.log("✓ Manager user created successfully!");
  console.log(`  Email: ${manager.email}`);
  console.log(`  Name: ${manager.name}`);
  console.log(`  Role: ${manager.role}`);
  console.log(`  Password: ${password}`);
  console.log("\n⚠️  Please change the password after first login!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
