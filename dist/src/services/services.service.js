"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ServicesService = class ServicesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createServiceDto) {
        return this.prisma.service.create({
            data: createServiceDto,
        });
    }
    async findAll(country, isVisible) {
        const where = {};
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
    async findOne(id, country) {
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
            throw new common_1.NotFoundException(`Service with ID ${id} not found`);
        }
        return service;
    }
    async update(id, updateServiceDto) {
        await this.findOne(id);
        return this.prisma.service.update({
            where: { id },
            data: updateServiceDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.service.delete({
            where: { id },
        });
    }
    async toggleVisibility(id) {
        const service = await this.prisma.service.findUnique({
            where: { id },
        });
        if (!service) {
            throw new common_1.NotFoundException(`Service with ID ${id} not found`);
        }
        return this.prisma.service.update({
            where: { id },
            data: {
                isVisible: !service.isVisible,
            },
        });
    }
    async createPackage(serviceId, createPackageDto) {
        await this.prisma.service.findUniqueOrThrow({
            where: { id: serviceId },
        });
        const { features, pricing, ...packageData } = createPackageDto;
        return this.prisma.package.create({
            data: {
                ...packageData,
                serviceId,
                features: {
                    create: features?.map((feature, index) => ({
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
    async findPackage(packageId, country) {
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
            throw new common_1.NotFoundException(`Package with ID ${packageId} not found`);
        }
        return pkg;
    }
    async updatePackage(packageId, updatePackageDto) {
        const { features, pricing, ...packageData } = updatePackageDto;
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
                        create: features.map((feature, index) => ({
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
    async removePackage(packageId) {
        await this.findPackage(packageId);
        return this.prisma.package.delete({
            where: { id: packageId },
        });
    }
    async togglePackageVisibility(packageId) {
        const pkg = await this.prisma.package.findUnique({
            where: { id: packageId },
        });
        if (!pkg) {
            throw new common_1.NotFoundException(`Package with ID ${packageId} not found`);
        }
        return this.prisma.package.update({
            where: { id: packageId },
            data: {
                isVisible: !pkg.isVisible,
            },
        });
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServicesService);
//# sourceMappingURL=services.service.js.map