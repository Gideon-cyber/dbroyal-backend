import { PrismaService } from "../prisma/prisma.service";
import { CreateServiceDto, UpdateServiceDto } from "./dto";
import { Country } from "@prisma/client";
export declare class ServicesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createServiceDto: CreateServiceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        subtitle: string | null;
        description: string;
        imageUrl: string | null;
        isVisible: boolean;
    }>;
    findAll(country?: Country, isVisible?: boolean): Promise<({
        packages: ({
            features: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                feature: string;
                packageId: string;
            }[];
            pricing: {
                id: string;
                country: import(".prisma/client").$Enums.Country;
                createdAt: Date;
                updatedAt: Date;
                packageId: string;
                price: import("@prisma/client/runtime/library").Decimal;
                currency: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            isVisible: boolean;
            sortOrder: number;
            serviceId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        subtitle: string | null;
        description: string;
        imageUrl: string | null;
        isVisible: boolean;
    })[]>;
    findOne(id: string, country?: Country): Promise<{
        packages: ({
            features: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sortOrder: number;
                feature: string;
                packageId: string;
            }[];
            pricing: {
                id: string;
                country: import(".prisma/client").$Enums.Country;
                createdAt: Date;
                updatedAt: Date;
                packageId: string;
                price: import("@prisma/client/runtime/library").Decimal;
                currency: string;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            isVisible: boolean;
            sortOrder: number;
            serviceId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        subtitle: string | null;
        description: string;
        imageUrl: string | null;
        isVisible: boolean;
    }>;
    update(id: string, updateServiceDto: UpdateServiceDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        subtitle: string | null;
        description: string;
        imageUrl: string | null;
        isVisible: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        subtitle: string | null;
        description: string;
        imageUrl: string | null;
        isVisible: boolean;
    }>;
    toggleVisibility(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        slug: string;
        subtitle: string | null;
        description: string;
        imageUrl: string | null;
        isVisible: boolean;
    }>;
    createPackage(serviceId: string, createPackageDto: any): Promise<{
        features: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            feature: string;
            packageId: string;
        }[];
        pricing: {
            id: string;
            country: import(".prisma/client").$Enums.Country;
            createdAt: Date;
            updatedAt: Date;
            packageId: string;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        isVisible: boolean;
        sortOrder: number;
        serviceId: string;
    }>;
    findPackage(packageId: string, country?: Country): Promise<{
        service: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            slug: string;
            subtitle: string | null;
            description: string;
            imageUrl: string | null;
            isVisible: boolean;
        };
        features: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            feature: string;
            packageId: string;
        }[];
        pricing: {
            id: string;
            country: import(".prisma/client").$Enums.Country;
            createdAt: Date;
            updatedAt: Date;
            packageId: string;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        isVisible: boolean;
        sortOrder: number;
        serviceId: string;
    }>;
    updatePackage(packageId: string, updatePackageDto: any): Promise<{
        features: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sortOrder: number;
            feature: string;
            packageId: string;
        }[];
        pricing: {
            id: string;
            country: import(".prisma/client").$Enums.Country;
            createdAt: Date;
            updatedAt: Date;
            packageId: string;
            price: import("@prisma/client/runtime/library").Decimal;
            currency: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        isVisible: boolean;
        sortOrder: number;
        serviceId: string;
    }>;
    removePackage(packageId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        isVisible: boolean;
        sortOrder: number;
        serviceId: string;
    }>;
    togglePackageVisibility(packageId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        isVisible: boolean;
        sortOrder: number;
        serviceId: string;
    }>;
}
