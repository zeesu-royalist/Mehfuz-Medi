import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const TS_IMAGES = [
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop",
];

const SHIRT_IMAGES = [
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1620012253295-c05518e99309?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop",
];

const POLO_IMAGES = [
  "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&auto=format&fit=crop",
];

const PANTS_IMAGES = [
  "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop",
];

const JEANS_IMAGES = [
  "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop",
];

const JOGGERS_IMAGES = [
  "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=600&auto=format&fit=crop",
];

interface ProductTemplate {
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  tag: string;
}

const TEMPLATES: Record<string, ProductTemplate[]> = {
  "t-shirts": [
    { name: "Batman: Dark Knight", description: "Oversized Fit, premium heavy loop knit fabric with front chest embroidery detailing.", price: 1499, discountPrice: 999, tag: "OVERSIZED FIT" },
    { name: "Iron Man: Arc Reactor", description: "Classic crewneck fit with glow-in-the-dark graphic chest print detailing.", price: 1299, discountPrice: 899, tag: "GLOW PRINT" },
    { name: "Captain America: Vintage Shield", description: "Soft cotton jersey knit graphic tee celebrating Marvel Comic archives.", price: 999, discountPrice: 799, tag: "VINTAGE FIT" },
    { name: "Deadpool: Merc with a Mouth", description: "Fun graphic t-shirt with premium front chest screen printed graphics.", price: 1299, discountPrice: 999, tag: "OFFICIAL MERCH" },
    { name: "Naruto: Shippuden Hokage", description: "Anime merchandise oversized tee featuring graphic prints on the back panel.", price: 1499, discountPrice: 1199, tag: "ANIME DROP" },
    { name: "Goku: Ultra Instinct", description: "Super Saiyan orange highlight streetwear oversized tee.", price: 1499, discountPrice: 1199, tag: "ANIME DROP" },
    { name: "Harry Potter: Gryffindor Crest", description: "Classic crimson red t-shirt with varsity embroidery work.", price: 1299, discountPrice: 999, tag: "WARNER BROS" },
    { name: "Star Wars: Mandalorian Clan", description: "Premium olive green graphic tee with the bounty hunter print.", price: 1499, discountPrice: 1299, tag: "LIMITED EDITION" },
    { name: "Rick and Morty: Portal", description: "Acid wash style graphic tee featuring science portal graphics.", price: 1399, discountPrice: 1099, tag: "OVERSIZED FIT" },
    { name: "Attack on Titan: Survey Corps", description: "Dark green oversized tee featuring printed graphics.", price: 1499, discountPrice: 1199, tag: "ANIME DROP" },
  ],
  "shirts": [
    { name: "Classic White Linen", description: "Linen-blend breathable summer resort shirt with relaxed camp collar.", price: 1999, discountPrice: 1499, tag: "LINEN BLEND" },
    { name: "Blue Cotton Chambray", description: "Soft brushed cotton utility shirt with front double button pockets.", price: 1799, discountPrice: 1399, tag: "CASUAL WEAR" },
    { name: "Black Poplin Slim Shirt", description: "Premium stretch cotton poplin shirt ideal for smart evening events.", price: 2199, discountPrice: 1699, tag: "FORMAL LOOK" },
    { name: "Olive Utility Cargo Shirt", description: "Rugged twill weave utility cargo shirt with patch pocket details.", price: 2299, discountPrice: 1899, tag: "STREETWEAR" },
    { name: "Red Flannel Checkered", description: "Mid-weight checkered plaid cotton shirt with vintage button closures.", price: 1899, discountPrice: 1499, tag: "CLASSIC RETRO" },
    { name: "Striped Resort Shirt", description: "Horizontal striped lightweight vacation shirt with flat lock stitching.", price: 1699, discountPrice: 1299, tag: "RESORT WEAR" },
    { name: "Oxford Button-Down Blue", description: "Heavyweight basketweave oxford cotton casual shirt.", price: 1999, discountPrice: 1599, tag: "PREPPY LOOK" },
    { name: "Denim Utility Blue Shirt", description: "Washed indigo denim shirt with contrast copper stitching.", price: 2499, discountPrice: 1999, tag: "DENIM DROP" },
    { name: "Cuban Collar Floral Shirt", description: "Floral pattern resort shirt perfect for beach outings.", price: 1799, discountPrice: 1399, tag: "CAMP COLLAR" },
    { name: "Mustard Corduroy Shirt", description: "Fine wale corduroy casual shirt with buttoned chest details.", price: 2299, discountPrice: 1799, tag: "VINTAGE COZY" },
  ],
  "polos": [
    { name: "Crimson Athletic Polo", description: "Breathable mesh cotton polo shirt with contrast ribbed tipping.", price: 1299, discountPrice: 999, tag: "ATHLETIC FIT" },
    { name: "Classic Navy Pique Polo", description: "Timeless navy blue pique polo shirt with dual button placket.", price: 1199, discountPrice: 899, tag: "CLASSIC FIT" },
    { name: "Jet Black Golf Polo", description: "Sweat-wicking dry fit polyester polo with sleek zip closures.", price: 1499, discountPrice: 1199, tag: "DRY FIT" },
    { name: "Emerald Green Tipped", description: "Sporty casual pique knit polo with yellow highlighted tip trims.", price: 1299, discountPrice: 999, tag: "TIPPED COLLAR" },
    { name: "Heather Grey Smart Polo", description: "Premium jersey knit polo featuring a soft buttonless design.", price: 1399, discountPrice: 1099, tag: "SMART CASUAL" },
    { name: "Pastel Pink Summer Polo", description: "Lightweight summer knit polo shirt in fresh pastel hues.", price: 1199, discountPrice: 899, tag: "SUMMER DROP" },
    { name: "Charcoal Knit Polo", description: "Intricate cable knit premium smart polo shirt.", price: 1699, discountPrice: 1299, tag: "PREMIUM KNIT" },
    { name: "Mustard Vintage Polo", description: "Washed cotton vintage style polo with embroidered chest crest.", price: 1299, discountPrice: 999, tag: "VINTAGE VIBES" },
  ],
  "men-pants": [
    { name: "Khaki Classic Chino", description: "Mid-rise flat front chino trousers with soft peach finish.", price: 1999, discountPrice: 1499, tag: "CLASSIC STYLE" },
    { name: "Charcoal Slim Fit Chino", description: "Stretchable twill cotton chinos in a tapered smart profile.", price: 2199, discountPrice: 1699, tag: "SLIM TAPERED" },
    { name: "Olive Cargo Utility Pants", description: "Utility combat trousers with multi-pocket flap compartments.", price: 2499, discountPrice: 1999, tag: "CARGO LOOK" },
    { name: "Navy Tailored Trouser", description: "Tailored suit-style trousers with clean waistband buckles.", price: 2599, discountPrice: 2099, tag: "SMART OFFICE" },
    { name: "Sand Relaxed Linen Pants", description: "Drawstring elasticated linen pants ideal for seaside vacations.", price: 2299, discountPrice: 1799, tag: "RELAXED FIT" },
    { name: "Black Corduroy Trousers", description: "Wale corduroy trousers featuring deep side slide pockets.", price: 2399, discountPrice: 1899, tag: "CORD CLASSIC" },
    { name: "Tan Drawstring Lounge Pants", description: "Super-soft stretch cotton lounge trousers for day lounging.", price: 1799, discountPrice: 1299, tag: "LITE LOUNGE" },
    { name: "Slate Grey Tech Pants", description: "Water resistant active tech pants with utility zippers.", price: 2699, discountPrice: 2199, tag: "ACTIVE GEAR" },
  ],
  "men-jeans": [
    { name: "Light Indigo Slim Fit Jeans", description: "Faded light wash stretchable denim jeans in a modern cut.", price: 2499, discountPrice: 1999, tag: "STRETCH DENIM" },
    { name: "Dark Wash Straight Fit Jeans", description: "Classic straight-cut deep indigo rinse jeans with gold stitching.", price: 2299, discountPrice: 1799, tag: "STRAIGHT FIT" },
    { name: "Raw Selvedge Denim Jeans", description: "Premium unwashed selvedge denim jeans with red line cuffs.", price: 3499, discountPrice: 2999, tag: "PREMIUM SELVEDGE" },
    { name: "Distressed Light Blue Jeans", description: "Ripped knees and faded thigh highlights in a relaxed fit.", price: 2799, discountPrice: 2199, tag: "STREETWEAR" },
    { name: "Black Acid Wash Jeans", description: "Grunge style washed black denim jeans with slim leg fit.", price: 2499, discountPrice: 1999, tag: "SLIM FIT" },
    { name: "Grey Tapered Jeans", description: "Vintage grey wash jeans tapering towards the ankles.", price: 2399, discountPrice: 1899, tag: "TAPERED LEG" },
    { name: "Mid Wash Indigo Jeans", description: "Comfortable standard mid-wash blue denim jeans.", price: 2299, discountPrice: 1699, tag: "DAILY DENIM" },
  ],
  "men-joggers": [
    { name: "Tech Fleece Black Joggers", description: "Performance tech fleece trousers with heat-sealed zippers.", price: 2199, discountPrice: 1699, tag: "TECH FLEECE" },
    { name: "Heather Grey Lounge Joggers", description: "Relaxed fit drawstring loopback cotton fleece sweatpants.", price: 1799, discountPrice: 1299, tag: "COZY LOUNGE" },
    { name: "Olive Active Utility Joggers", description: "Waterproof elastic cuff joggers with cargo leg pockets.", price: 2299, discountPrice: 1799, tag: "UTILITY DROP" },
    { name: "Navy Sports Training Joggers", description: "Dry-fit stretch joggers designed for intense workout routines.", price: 1999, discountPrice: 1499, tag: "SPORTSWEAR" },
    { name: "Off-White Relaxed Joggers", description: "Streetwear aesthetic off-white fleece joggers.", price: 1899, discountPrice: 1499, tag: "STREETWEAR" },
    { name: "Charcoal Knit Cargo Joggers", description: "Structured knit cargo sweatpants with utility pockets.", price: 2399, discountPrice: 1899, tag: "RELAXED FIT" },
    { name: "Crimson Streetwear Joggers", description: "Bold red track joggers with side contrast taping strips.", price: 1999, discountPrice: 1399, tag: "STREETSTYLE" },
  ],
};

const IMAGES_BY_CATEGORY: Record<string, string[]> = {
  "t-shirts": TS_IMAGES,
  "shirts": SHIRT_IMAGES,
  "polos": POLO_IMAGES,
  "men-pants": PANTS_IMAGES,
  "men-jeans": JEANS_IMAGES,
  "men-joggers": JOGGERS_IMAGES,
};

async function main() {
  console.log("Starting database seeding for 50 products...");

  const categories = await db.category.findMany();
  if (categories.length === 0) {
    console.error("No categories found. Please seed categories first using npm run db:seed");
    process.exit(1);
  }

  let totalSeeded = 0;

  for (const cat of categories) {
    const slug = cat.slug;
    const templates = TEMPLATES[slug];
    if (!templates) {
      console.log(`Skipping category slug: ${slug} (no templates defined)`);
      continue;
    }

    console.log(`Seeding ${templates.length} products for Category: ${cat.name} (${slug})...`);

    const imageUrls = IMAGES_BY_CATEGORY[slug] || TS_IMAGES;

    for (let index = 0; index < templates.length; index++) {
      const template = templates[index];
      const productSlug = `${template.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`;
      const sku = `TSS-${slug.toUpperCase()}-${index + 100}`;
      
      const imgUrl = imageUrls[index % imageUrls.length];

      await db.product.upsert({
        where: { sku },
        update: {},
        create: {
          name: template.name,
          slug: productSlug,
          description: template.description,
          price: template.price,
          discountPrice: template.discountPrice,
          sku,
          stock: 120,
          status: "PUBLISHED",
          isFeatured: index % 2 === 0, // Mark every other product as featured
          categoryId: cat.id,
          tag: template.tag,
          images: {
            create: [
              {
                url: imgUrl,
                publicId: `mock_${slug}_image_${index + 1}`,
                position: 0,
                alt: `${template.name} View`,
              }
            ]
          },
          variants: {
            create: [
              { size: "S", stock: 30, sku: `${sku}-S` },
              { size: "M", stock: 30, sku: `${sku}-M` },
              { size: "L", stock: 30, sku: `${sku}-L` },
              { size: "XL", stock: 30, sku: `${sku}-XL` },
            ]
          }
        }
      });
      totalSeeded++;
    }
  }

  console.log(`Successfully seeded ${totalSeeded} products in the database!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
