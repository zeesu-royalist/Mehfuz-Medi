import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Find the Category "T-Shirts" (slug: t-shirts)
  const category = await db.category.findUnique({
    where: { slug: "t-shirts" },
  });

  if (!category) {
    console.error("Category 'T-Shirts' not found. Please run the main db:seed first.");
    process.exit(1);
  }

  // Create the Product
  const product = await db.product.upsert({
    where: { sku: "TSS-SPIDER-APEX" },
    update: {},
    create: {
      name: "Spider-Man: Apex Web",
      slug: "spider-man-apex-web",
      description: "Oversized Fit, Premium Heavy Gauge Fabric, Embroidery detailing on chest, Spider-Man theme licensing merchandise from Marvel.",
      price: 1299.00,
      discountPrice: 999.00,
      sku: "TSS-SPIDER-APEX",
      stock: 50,
      status: "PUBLISHED",
      isFeatured: true,
      categoryId: category.id,
      tag: "OVERSIZED FIT",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop",
            publicId: "mock_image_spider_apex",
            position: 0,
            alt: "Spider-Man: Apex Web Oversized T-Shirt",
          }
        ]
      },
      variants: {
        create: [
          { size: "S", stock: 15, sku: "TSS-SPIDER-APEX-S" },
          { size: "M", stock: 20, sku: "TSS-SPIDER-APEX-M" },
          { size: "L", stock: 15, sku: "TSS-SPIDER-APEX-L" },
        ]
      }
    }
  });

  console.log(`Product created: ${product.name} (SKU: ${product.sku})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
