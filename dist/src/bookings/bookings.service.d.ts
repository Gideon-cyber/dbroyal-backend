import { PrismaService } from "../prisma/prisma.service";
import { ApprovalStatus, BookingStatus, Country } from "@prisma/client";
export declare class BookingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        title?: string;
        packageId: string;
        eventId?: string;
        clientId: string;
        dateTime: string | Date;
        location?: string;
        notes?: string;
        approvalStatus?: ApprovalStatus;
        status?: BookingStatus;
        country?: Country;
        assignedUserIds?: string[];
    }): Promise<{
        package: {
            service: {
                id: string;
                country: import(".prisma/client").$Enums.Country;
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
        };
        client: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            country: import(".prisma/client").$Enums.Country;
            createdAt: Date;
            updatedAt: Date;
            avatarUrl: string | null;
        };
        event: {
            id: string;
            name: string;
            country: import(".prisma/client").$Enums.Country;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            serviceId: string;
            clientId: string | null;
            location: string | null;
            date: Date | null;
            coverImageUrl: string | null;
            googleDriveUrl: string | null;
            driveFolderId: string | null;
            syncStatus: import(".prisma/client").$Enums.SyncStatus;
            lastSyncedAt: Date | null;
            syncErrorMessage: string | null;
            driveChangeToken: string | null;
        };
        assigned: {
            bookingId: string;
            userId: string;
            assignedAt: Date;
        }[];
    } & {
        id: string;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        packageId: string;
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        eventId: string | null;
        clientId: string;
        dateTime: Date;
        location: string | null;
        notes: string | null;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
        status: import(".prisma/client").$Enums.BookingStatus;
    }>;
    findAll(country?: Country, startDate?: string, endDate?: string): import(".prisma/client").Prisma.PrismaPromise<({
        package: {
            service: {
                id: string;
                country: import(".prisma/client").$Enums.Country;
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
        };
        client: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            country: import(".prisma/client").$Enums.Country;
            createdAt: Date;
            updatedAt: Date;
            avatarUrl: string | null;
        };
        event: {
            id: string;
            name: string;
            country: import(".prisma/client").$Enums.Country;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            serviceId: string;
            clientId: string | null;
            location: string | null;
            date: Date | null;
            coverImageUrl: string | null;
            googleDriveUrl: string | null;
            driveFolderId: string | null;
            syncStatus: import(".prisma/client").$Enums.SyncStatus;
            lastSyncedAt: Date | null;
            syncErrorMessage: string | null;
            driveChangeToken: string | null;
        };
        assigned: {
            bookingId: string;
            userId: string;
            assignedAt: Date;
        }[];
    } & {
        id: string;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        packageId: string;
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        eventId: string | null;
        clientId: string;
        dateTime: Date;
        location: string | null;
        notes: string | null;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
        status: import(".prisma/client").$Enums.BookingStatus;
    })[]>;
    findOne(id: string, country?: Country): import(".prisma/client").Prisma.Prisma__BookingClient<{
        package: {
            service: {
                id: string;
                country: import(".prisma/client").$Enums.Country;
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
        };
        client: {
            id: string;
            email: string | null;
            name: string;
            phone: string | null;
            country: import(".prisma/client").$Enums.Country;
            createdAt: Date;
            updatedAt: Date;
            avatarUrl: string | null;
        };
        event: {
            id: string;
            name: string;
            country: import(".prisma/client").$Enums.Country;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            serviceId: string;
            clientId: string | null;
            location: string | null;
            date: Date | null;
            coverImageUrl: string | null;
            googleDriveUrl: string | null;
            driveFolderId: string | null;
            syncStatus: import(".prisma/client").$Enums.SyncStatus;
            lastSyncedAt: Date | null;
            syncErrorMessage: string | null;
            driveChangeToken: string | null;
        };
        assigned: {
            bookingId: string;
            userId: string;
            assignedAt: Date;
        }[];
    } & {
        id: string;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        packageId: string;
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        eventId: string | null;
        clientId: string;
        dateTime: Date;
        location: string | null;
        notes: string | null;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
        status: import(".prisma/client").$Enums.BookingStatus;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: any, country?: Country): Promise<{
        id: string;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        packageId: string;
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        eventId: string | null;
        clientId: string;
        dateTime: Date;
        location: string | null;
        notes: string | null;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
        status: import(".prisma/client").$Enums.BookingStatus;
    }>;
    remove(id: string, country?: Country): Promise<{
        id: string;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        packageId: string;
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        eventId: string | null;
        clientId: string;
        dateTime: Date;
        location: string | null;
        notes: string | null;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
        status: import(".prisma/client").$Enums.BookingStatus;
    }>;
    assignUsers(id: string, userIds: string[], country?: Country): Promise<[import(".prisma/client").Prisma.BatchPayload, import(".prisma/client").Prisma.BatchPayload]>;
    getBookingMetrics(country?: Country): Promise<{
        byApprovalStatus: {
            pending: number;
            approved: number;
            rejected: number;
        };
        totals: {
            total: number;
            upcoming: number;
        };
    }>;
}
