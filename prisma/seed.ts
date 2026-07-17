import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@souledclone.dev" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@souledclone.dev",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const categories = ["T-Shirts", "Shirts", "Polos", "Men Pants", "Men Jeans", "Men Joggers"];
  for (const name of categories) {
    await db.category.upsert({
      where: { slug: name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
    });
  }

  console.log(`Seeded admin user: ${admin.email} (password: Admin@12345)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
