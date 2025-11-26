import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateServiceDto, UpdateServiceDto } from "./dto";
import { Country } from "@prisma/client";

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({
      data: createServiceDto,
    });
  }

  async findAll(country?: Country, isVisible?: boolean) {
    const where: any = {};

    if (country) {
      where.country = country;
    }

    if (isVisible !== undefined) {
      where.isVisible = isVisible;
    }

    return this.prisma.service.findMany({
      where,
      include: {
        packages: {
          where: { isVisible: true },
          include: {
            features: {
              orderBy: { sortOrder: "asc" },
            },
            pricing: {
              where: country ? { country } : undefined,
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string, country?: Country) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        packages: {
          where: { isVisible: true },
          include: {
            features: {
              orderBy: { sortOrder: "asc" },
            },
            pricing: {
              where: country ? { country } : undefined,
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    await this.findOne(id); // Verify service exists

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verify service exists

    return this.prisma.service.delete({
      where: { id },
    });
  }

  async toggleVisibility(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return this.prisma.service.update({
      where: { id },
      data: {
        isVisible: !service.isVisible,
      },
    });
  }

  // Package Management
  async createPackage(serviceId: string, createPackageDto: any) {
    // Verify service exists
    await this.prisma.service.findUniqueOrThrow({
      where: { id: serviceId },
    });

    const { features, pricing, ...packageData } = createPackageDto;

    return this.prisma.package.create({
      data: {
        ...packageData,
        serviceId,
        features: {
          create: features?.map((feature: string, index: number) => ({
            feature,
            sortOrder: index,
          })),
        },
        pricing: {
          create: pricing,
        },
      },
      include: {
        features: {
          orderBy: { sortOrder: "asc" },
        },
        pricing: true,
      },
    });
  }

  async findPackage(packageId: string, country?: Country) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
      include: {
        service: true,
        features: {
          orderBy: { sortOrder: "asc" },
        },
        pricing: {
          where: country ? { country } : undefined,
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException(`Package with ID ${packageId} not found`);
    }

    return pkg;
  }

  async updatePackage(packageId: string, updatePackageDto: any) {
    const { features, pricing, ...packageData } = updatePackageDto;

    // If features are provided, replace all features
    if (features) {
      await this.prisma.packageFeature.deleteMany({
        where: { packageId },
      });
    }

    return this.prisma.package.update({
      where: { id: packageId },
      data: {
        ...packageData,
        ...(features && {
          features: {
            create: features.map((feature: string, index: number) => ({
              feature,
              sortOrder: index,
            })),
          },
        }),
        ...(pricing && {
          pricing: {
            deleteMany: {},
            create: pricing,
          },
        }),
      },
      include: {
        features: {
          orderBy: { sortOrder: "asc" },
        },
        pricing: true,
      },
    });
  }

  async removePackage(packageId: string) {
    await this.findPackage(packageId);

    return this.prisma.package.delete({
      where: { id: packageId },
    });
  }

  async togglePackageVisibility(packageId: string) {
    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      throw new NotFoundException(`Package with ID ${packageId} not found`);
    }

    return this.prisma.package.update({
      where: { id: packageId },
      data: {
        isVisible: !pkg.isVisible,
      },
    });
  }
}
