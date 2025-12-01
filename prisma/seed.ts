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
            { country: Country.NG, price: 950000, currency: "NGN" },
            { country: Country.UK, price: 500, currency: "USD" },
          ],
        },
        {
          name: "Premium Package",
          slug: "premium-package",
          description: "Comprehensive coverage for your special day",
          sortOrder: 1,
          features: [
            "Full day coverage",
            "2 photographers + 1 videographer",
            "150 edited photos",
            "10-mins highlight video + full video",
          ],
          pricing: [
            { country: Country.NG, price: 1500000, currency: "NGN" },
            { country: Country.UK, price: 850, currency: "USD" },
          ],
        },
        {
          name: "Luxury Package",
          slug: "luxury-package",
          description: "Premium coverage for traditional and white wedding",
          sortOrder: 2,
          features: [
            "2 day coverage (traditional + white wedding)",
            "Drone footage",
            "Photo album",
            "Framed print",
            "200 edited photos",
          ],
          pricing: [
            { country: Country.NG, price: 2200000, currency: "NGN" },
            { country: Country.UK, price: 1200, currency: "USD" },
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
            { country: Country.UK, price: 250, currency: "USD" },
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
            { country: Country.UK, price: 550, currency: "USD" },
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
            { country: Country.UK, price: 750, currency: "USD" },
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
            { country: Country.UK, price: 1100, currency: "USD" },
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
          features: [
            "3-hours coverage",
            "50 edited photos",
            "5-mins highlight video",
          ],
          pricing: [
            { country: Country.NG, price: 270000, currency: "NGN" },
            { country: Country.UK, price: 150, currency: "USD" },
          ],
        },
        {
          name: "Standard Package",
          slug: "standard-package",
          description: "Great for standard birthday parties",
          sortOrder: 1,
          features: [
            "6-hour coverage",
            "100 edited photos",
            "3-mins highlight video",
            "10-mins highlight video + full video",
          ],
          pricing: [
            { country: Country.NG, price: 570000, currency: "NGN" },
            { country: Country.UK, price: 300, currency: "USD" },
          ],
        },
        {
          name: "Premium Package",
          slug: "premium-package",
          description: "Complete coverage for memorable birthdays",
          sortOrder: 2,
          features: [
            "Full day coverage",
            "150 edited photos",
            "10-mins highlight video + photo album",
            "200 edited photos",
          ],
          pricing: [
            { country: Country.NG, price: 950000, currency: "NGN" },
            { country: Country.UK, price: 500, currency: "USD" },
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
            "50 edited photos",
            "3-mins recap video",
            "5-mins highlight video",
          ],
          pricing: [
            { country: Country.NG, price: 475000, currency: "NGN" },
            { country: Country.UK, price: 250, currency: "USD" },
          ],
        },
        {
          name: "Standard Package",
          slug: "standard-package",
          description: "Comprehensive memorial documentation",
          sortOrder: 1,
          features: [
            "Full day coverage",
            "100 edited photos",
            "5-mins recap video",
            "10-mins highlight video + full video",
          ],
          pricing: [
            { country: Country.NG, price: 760000, currency: "NGN" },
            { country: Country.UK, price: 400, currency: "USD" },
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
            "Printed album (20 pages)",
            "200 edited photos",
          ],
          pricing: [
            { country: Country.NG, price: 1014000, currency: "NGN" },
            { country: Country.UK, price: 600, currency: "USD" },
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
            { country: Country.NG, price: 190000, currency: "NGN" },
            { country: Country.UK, price: 100, currency: "USD" },
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
            { country: Country.NG, price: 228000, currency: "NGN" },
            { country: Country.UK, price: 120, currency: "USD" },
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
        });

        if (existingPackage) {
          console.log(`    ✓ Package "${pkgInfo.name}" already exists`);
          continue;
        }

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
          `  ⚠️  Service not found for slug: ${fullSlug}, skipping event ${event.id}`
        );
        continue;
      }

      await prisma.$executeRaw`
        UPDATE "Event" SET "serviceId" = ${service.id} WHERE id = ${event.id}
      `;
      console.log(
        `  ✓ Migrated event ${event.id} from ${event.category} to ${service.title}`
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
