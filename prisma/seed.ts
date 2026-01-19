import { PrismaClient, Role, Country } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Map old event categories to new services
const OLD_CATEGORY_TO_SERVICE: Record<string, string> = {
  WEDDING: "wedding-photography",
  CORPORATE: "corporate-event",
  PHOTOSHOOT: "professional-photoshoot",
  BIRTHDAY: "birthday-shoots",
  BURIAL: "burial-memorial-events",
  OTHER: "other-services",
};

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Services first
  await seedServices();

  // Seed Add-ons
  await seedAddOns();

  // Migrate existing events (if any)
  await migrateExistingEvents();

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

async function seedServices() {
  console.log("\n📋 Seeding services...");

  const services = [
    {
      title: "Wedding Photography",
      slug: "wedding-photography",
      subtitle:
        "Capturing the magic of your special day with elegance and sophistication",
      description:
        "Capture your special day with beautiful timeless wedding photography. From intimate ceremonies to grand celebrations, we document every precious moment.",
      packages: [
        {
          name: "Standard Package",
          slug: "standard-package",
          description: "Perfect for traditional wedding ceremonies",
          sortOrder: 0,
          features: [
            "1 day coverage (ceremony + reception)",
            "2 costumes",
            "100 edited photos",
            "5-mins highlight video",
          ],
          pricing: [
            { country: Country.NG, price: 1900000, currency: "NGN" },
            { country: Country.UK, price: 1000, currency: "GBP" },
          ],
        },
        {
          name: "Premium Package",
          slug: "premium-package",
          description: "Comprehensive coverage for your special day",
          sortOrder: 1,
          features: [
            "Full day coverage",
            "2 photographers",
            "150 edited photos",
            "10-mins highlight video",
          ],
          pricing: [
            { country: Country.NG, price: 2850000, currency: "NGN" },
            { country: Country.UK, price: 1500, currency: "GBP" },
          ],
        },
        {
          name: "Luxury Package",
          slug: "luxury-package",
          description: "Premium coverage for traditional and white wedding",
          sortOrder: 2,
          features: [
            "2-day coverage (traditional + white wedding)",
            "Drone footage",
            "2 Photographers",
            "1 Videographer",
            "Photo album",
            "200 edited photos",
          ],
          pricing: [
            { country: Country.NG, price: 4750000, currency: "NGN" },
            { country: Country.UK, price: 2500, currency: "GBP" },
          ],
        },
      ],
    },
    {
      title: "Corporate Event Package",
      slug: "corporate-event",
      subtitle: "Turning every corporate moment into a timeless impression",
      description:
        "Professional event coverage for corporate functions, celebrations, and special occasions. Comprehensive documentation with artistic flair.",
      packages: [
        {
          name: "Essential Package",
          slug: "essential-package",
          description: "Perfect for smaller corporate events",
          sortOrder: 0,
          features: [
            "3-hours coverage",
            "1 Professional photographer",
            "50 Edited photos",
            "Online gallery delivery",
          ],
          pricing: [
            { country: Country.NG, price: 475000, currency: "NGN" },
            { country: Country.UK, price: 250, currency: "GBP" },
          ],
        },
        {
          name: "Professional Package",
          slug: "professional-package",
          description: "Ideal for medium-sized corporate events",
          sortOrder: 1,
          features: [
            "5-hours coverage",
            "1 Photographer",
            "1 Videographer",
            "80 Edited photos",
            "3-mins highlight video",
            "Branded flash drive delivery",
          ],
          pricing: [
            { country: Country.NG, price: 855000, currency: "NGN" },
            { country: Country.UK, price: 550, currency: "GBP" },
          ],
        },
        {
          name: "Premium Package",
          slug: "premium-package",
          description: "Complete coverage for major corporate events",
          sortOrder: 2,
          features: [
            "Full day coverage",
            "2 Photographer",
            "1 Videographer",
            "120 Edited photos",
            "5-mins highlight video + full recap video",
            "Drone footage (if location allows)",
            "Branded photo album (20 pages)",
          ],
          pricing: [
            { country: Country.NG, price: 1420000, currency: "NGN" },
            { country: Country.UK, price: 750, currency: "GBP" },
          ],
        },
        {
          name: "Premium Executive Package",
          slug: "premium-executive-package",
          description: "Ultimate package for multi-day corporate events",
          sortOrder: 3,
          features: [
            "2-day coverage",
            "2 photographers",
            "2 videographers",
            "200+ edited photos",
            "10-mins cinematic video",
            "Drone + interview + behind the scenes coverage",
            "Photo album + framed group photo",
          ],
          pricing: [
            { country: Country.NG, price: 2090000, currency: "NGN" },
            { country: Country.UK, price: 1100, currency: "GBP" },
          ],
        },
      ],
    },
    {
      title: "Birthday Package",
      slug: "birthday-shoots",
      subtitle:
        "Turning every birthday into a collection of unforgettable frames",
      description:
        "Capture your special day with beautiful timeless photography. From intimate ceremonies to grand celebrations, we document every precious moment.",
      packages: [
        {
          name: "Basic Package",
          slug: "basic-package",
          description: "Perfect for intimate birthday celebrations",
          sortOrder: 0,
          features: ["3-hours coverage", "70 edited photos"],
          pricing: [
            { country: Country.NG, price: 570000, currency: "NGN" },
            { country: Country.UK, price: 300, currency: "GBP" },
          ],
        },
        {
          name: "Standard Package",
          slug: "standard-package",
          description: "Great for standard birthday parties",
          sortOrder: 1,
          features: [
            "6-hour coverage",
            "120 edited photos",
            "3-mins highlight video",
            "10-mins highlight video + full video",
          ],
          pricing: [
            { country: Country.NG, price: 1140000, currency: "NGN" },
            { country: Country.UK, price: 600, currency: "GBP" },
          ],
        },
        {
          name: "Premium Package",
          slug: "premium-package",
          description: "Complete coverage for memorable birthdays",
          sortOrder: 2,
          features: [
            "Full day coverage",
            "200 edited photos",
            "10-mins highlight video + photo album",
          ],
          pricing: [
            { country: Country.NG, price: 1900000, currency: "NGN" },
            { country: Country.UK, price: 1000, currency: "GBP" },
          ],
        },
      ],
    },
    {
      title: "Funeral Package",
      slug: "burial-memorial-events",
      subtitle: "Thoughtfully documenting moments of remembrance and love",
      description:
        "Respectful and dignified photography for burial and memorial events. We capture moments with sensitivity and professionalism.",
      packages: [
        {
          name: "Basic Package",
          slug: "basic-package",
          description: "Essential coverage for memorial services",
          sortOrder: 0,
          features: [
            "4-hours coverage",
            "100 edited photos",
            "3-mins recap video",
          ],
          pricing: [
            { country: Country.NG, price: 950000, currency: "NGN" },
            { country: Country.UK, price: 500, currency: "GBP" },
          ],
        },
        {
          name: "Standard Package",
          slug: "standard-package",
          description: "Comprehensive memorial documentation",
          sortOrder: 1,
          features: [
            "Full day coverage",
            "150 edited photos",
            "5-mins recap video",
          ],
          pricing: [
            { country: Country.NG, price: 1520000, currency: "NGN" },
            { country: Country.UK, price: 800, currency: "GBP" },
          ],
        },
        {
          name: "Deluxe Package",
          slug: "deluxe-package",
          description: "Premium memorial coverage with album",
          sortOrder: 2,
          features: [
            "Full day coverage",
            "2 photographers",
            "Drone footage",
            "Printed album (30 pages)",
          ],
          pricing: [
            { country: Country.NG, price: 1900000, currency: "NGN" },
            { country: Country.UK, price: 1000, currency: "GBP" },
          ],
        },
      ],
    },
    {
      title: "Photoshoot Package",
      slug: "professional-photoshoot",
      subtitle: "Professional imagery that captures personality with precision",
      description:
        "Professional portrait sessions for individuals, families, and professionals looking for stunning headshots.",
      packages: [
        {
          name: "Basic Package",
          slug: "basic-package",
          description: "Quick studio session",
          sortOrder: 0,
          features: [
            "1 Outfit",
            "5 Edited photos",
            "1 hour session (Studio shoot only)",
          ],
          pricing: [
            { country: Country.NG, price: 285000, currency: "NGN" },
            { country: Country.UK, price: 150, currency: "GBP" },
          ],
        },
        {
          name: "Standard Package",
          slug: "standard-package",
          description: "Extended session with flexibility",
          sortOrder: 1,
          features: [
            "1 Outfit",
            "10 Edited photos",
            "1 hour 30 mins session",
            "Studio/outdoor shoot",
          ],
          pricing: [
            { country: Country.NG, price: 380000, currency: "NGN" },
            { country: Country.UK, price: 200, currency: "GBP" },
          ],
        },
      ],
    },
  ];

  for (const serviceData of services) {
    const { packages, ...serviceInfo } = serviceData;

    // Check if service already exists
    const existingService = await prisma.service.findUnique({
      where: { slug: serviceInfo.slug },
    });

    let service;
    if (existingService) {
      console.log(`  ✓ Service "${serviceInfo.title}" already exists`);
      service = existingService;
    } else {
      service = await prisma.service.create({ data: serviceInfo });
      console.log(`  ✓ Created service: ${serviceInfo.title}`);
    }

    // Seed packages with pricing for all countries
    if (packages) {
      for (const packageData of packages) {
        const { features, pricing, ...pkgInfo } = packageData;

        const existingPackage = await prisma.package.findUnique({
          where: {
            serviceId_slug: {
              serviceId: service.id,
              slug: pkgInfo.slug,
            },
          },
          include: {
            features: true,
            pricing: true,
          },
        });

        if (existingPackage) {
          console.log(`    ↻ Updating package "${pkgInfo.name}"`);

          // Update package details
          await prisma.package.update({
            where: { id: existingPackage.id },
            data: {
              ...pkgInfo,
            },
          });

          // Delete old features and create new ones
          await prisma.packageFeature.deleteMany({
            where: { packageId: existingPackage.id },
          });
          await prisma.packageFeature.createMany({
            data: features.map((feature, index) => ({
              packageId: existingPackage.id,
              feature,
              sortOrder: index,
            })),
          });

          // Update pricing for each country
          for (const priceData of pricing) {
            const existingPrice = existingPackage.pricing.find(
              (p) => p.country === priceData.country,
            );

            if (existingPrice) {
              await prisma.packagePricing.update({
                where: { id: existingPrice.id },
                data: {
                  price: priceData.price,
                  currency: priceData.currency,
                },
              });
              console.log(
                `      ✓ Updated pricing for ${priceData.country}: ${priceData.price} ${priceData.currency}`,
              );
            } else {
              await prisma.packagePricing.create({
                data: {
                  packageId: existingPackage.id,
                  ...priceData,
                },
              });
              console.log(
                `      ✓ Created pricing for ${priceData.country}: ${priceData.price} ${priceData.currency}`,
              );
            }
          }
        } else {
          await prisma.package.create({
            data: {
              ...pkgInfo,
              serviceId: service.id,
              features: {
                create: features.map((feature, index) => ({
                  feature,
                  sortOrder: index,
                })),
              },
              pricing: {
                create: pricing, // Create pricing for all countries
              },
            },
          });
          console.log(`    ✓ Created package: ${pkgInfo.name}`);
        }
      }
    }
  }
}

// GBP to NGN conversion rate
const GBP_TO_NGN_RATE = 1900;

async function seedAddOns() {
  console.log("\n🎁 Seeding add-ons...");

  // Add-ons organized by service slug
  const addOnsByService: Record<
    string,
    Array<{
      name: string;
      slug: string;
      description?: string;
      sortOrder: number;
      priceGBP: number; // UK price in GBP
    }>
  > = {
    // Photoshoot Service add-ons
    "professional-photoshoot": [
      {
        name: "Extra Outfit",
        slug: "extra-outfit",
        description: "Additional outfit change during the photoshoot session",
        sortOrder: 0,
        priceGBP: 50,
      },
      {
        name: "Extra Hour",
        slug: "extra-hour",
        description: "Extend your photoshoot session by one hour",
        sortOrder: 1,
        priceGBP: 60,
      },
      {
        name: "Set Design",
        slug: "set-design",
        description: "Custom set design and styling for your shoot",
        sortOrder: 2,
        priceGBP: 250,
      },
      {
        name: "Framed Photo",
        slug: "framed-photo",
        description: "Premium framed print of your favourite photo",
        sortOrder: 3,
        priceGBP: 150,
      },
      {
        name: "Studio Charge",
        slug: "studio-charge",
        description: "Studio rental and setup fee",
        sortOrder: 4,
        priceGBP: 60,
      },
    ],

    // Event coverage add-ons (Wedding, Birthday, Funeral)
    "wedding-photography": [
      {
        name: "Extra Photographer",
        slug: "extra-photographer",
        description: "Additional photographer for better coverage",
        sortOrder: 0,
        priceGBP: 300,
      },
      {
        name: "Photo Album",
        slug: "photo-album",
        description: "Premium printed photo album (30 pages)",
        sortOrder: 1,
        priceGBP: 200,
      },
    ],
    "birthday-shoots": [
      {
        name: "Extra Photographer",
        slug: "extra-photographer",
        description: "Additional photographer for better coverage",
        sortOrder: 0,
        priceGBP: 300,
      },
      {
        name: "Photo Album",
        slug: "photo-album",
        description: "Premium printed photo album (30 pages)",
        sortOrder: 1,
        priceGBP: 200,
      },
    ],
    "burial-memorial-events": [
      {
        name: "Extra Photographer",
        slug: "extra-photographer",
        description: "Additional photographer for better coverage",
        sortOrder: 0,
        priceGBP: 300,
      },
      {
        name: "Photo Album",
        slug: "photo-album",
        description: "Premium printed photo album (30 pages)",
        sortOrder: 1,
        priceGBP: 200,
      },
    ],

    // Corporate events have no add-ons (as specified)
  };

  for (const [serviceSlug, addOns] of Object.entries(addOnsByService)) {
    // Find the service
    const service = await prisma.service.findUnique({
      where: { slug: serviceSlug },
    });

    if (!service) {
      console.log(`  ⚠️  Service "${serviceSlug}" not found, skipping add-ons`);
      continue;
    }

    console.log(`  📦 Adding add-ons for ${service.title}...`);

    for (const addOnData of addOns) {
      const { priceGBP, ...addOnInfo } = addOnData;

      // Check if add-on already exists
      const existingAddOn = await prisma.addOn.findUnique({
        where: {
          serviceId_slug: {
            serviceId: service.id,
            slug: addOnInfo.slug,
          },
        },
        include: { pricing: true },
      });

      if (existingAddOn) {
        console.log(`    ↻ Updating add-on "${addOnInfo.name}"`);

        // Update add-on details
        await prisma.addOn.update({
          where: { id: existingAddOn.id },
          data: {
            name: addOnInfo.name,
            description: addOnInfo.description,
            sortOrder: addOnInfo.sortOrder,
          },
        });

        // Update pricing
        const pricingData = [
          { country: Country.UK, price: priceGBP, currency: "GBP" },
          {
            country: Country.NG,
            price: priceGBP * GBP_TO_NGN_RATE,
            currency: "NGN",
          },
        ];

        for (const pricing of pricingData) {
          const existingPricing = existingAddOn.pricing.find(
            (p) => p.country === pricing.country,
          );

          if (existingPricing) {
            await prisma.addOnPricing.update({
              where: { id: existingPricing.id },
              data: { price: pricing.price, currency: pricing.currency },
            });
          } else {
            await prisma.addOnPricing.create({
              data: {
                addOnId: existingAddOn.id,
                ...pricing,
              },
            });
          }
        }
      } else {
        // Create new add-on with pricing
        await prisma.addOn.create({
          data: {
            ...addOnInfo,
            serviceId: service.id,
            pricing: {
              create: [
                { country: Country.UK, price: priceGBP, currency: "GBP" },
                {
                  country: Country.NG,
                  price: priceGBP * GBP_TO_NGN_RATE,
                  currency: "NGN",
                },
              ],
            },
          },
        });
        console.log(`    ✓ Created add-on: ${addOnInfo.name}`);
      }
    }
  }

  console.log("  ✓ Add-ons seeding complete");
}

async function migrateExistingEvents() {
  console.log("\n🔄 Migrating existing events...");

  // Check if category column still exists by trying to query
  try {
    const events = await prisma.$queryRaw<
      Array<{ id: string; category: string; country: string }>
    >`
      SELECT id, category, country FROM "Event" WHERE "serviceId" IS NULL
    `;

    if (events.length === 0) {
      console.log("  ✓ No events to migrate");
      return;
    }

    console.log(`  Found ${events.length} events to migrate`);

    for (const event of events) {
      const serviceSlug =
        OLD_CATEGORY_TO_SERVICE[event.category] || "other-services";
      const fullSlug =
        event.country === "UK" ? `${serviceSlug}-uk` : serviceSlug;

      const service = await prisma.service.findUnique({
        where: { slug: fullSlug },
      });

      if (!service) {
        console.log(
          `  ⚠️  Service not found for slug: ${fullSlug}, skipping event ${event.id}`,
        );
        continue;
      }

      await prisma.$executeRaw`
        UPDATE "Event" SET "serviceId" = ${service.id} WHERE id = ${event.id}
      `;
      console.log(
        `  ✓ Migrated event ${event.id} from ${event.category} to ${service.title}`,
      );
    }
  } catch (error) {
    console.log("  ℹ️  Category column not found or already migrated");
  }
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
