import { BookingsService } from "./bookings.service";
import { Country } from "@prisma/client";
import { CreateBookingDto, UpdateBookingDto, AssignUsersDto } from "./dto";
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(country: Country, body: CreateBookingDto): Promise<{
        package: {
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
            date: Date | null;
            location: string | null;
            coverImageUrl: string | null;
            generatedCoverImageUrl: string | null;
            generatedCoverImageProxyUrl: string | null;
            googleDriveUrl: string | null;
            driveFolderId: string | null;
            syncStatus: import(".prisma/client").$Enums.SyncStatus;
            lastSyncedAt: Date | null;
            syncErrorMessage: string | null;
            driveChangeToken: string | null;
            clientId: string | null;
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
        status: import(".prisma/client").$Enums.BookingStatus;
        location: string | null;
        clientId: string;
        eventId: string | null;
        dateTime: Date;
        notes: string | null;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
    }>;
    findAll(country: Country, startDate?: string, endDate?: string): import(".prisma/client").Prisma.PrismaPromise<({
        package: {
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
            date: Date | null;
            location: string | null;
            coverImageUrl: string | null;
            generatedCoverImageUrl: string | null;
            generatedCoverImageProxyUrl: string | null;
            googleDriveUrl: string | null;
            driveFolderId: string | null;
            syncStatus: import(".prisma/client").$Enums.SyncStatus;
            lastSyncedAt: Date | null;
            syncErrorMessage: string | null;
            driveChangeToken: string | null;
            clientId: string | null;
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
        status: import(".prisma/client").$Enums.BookingStatus;
        location: string | null;
        clientId: string;
        eventId: string | null;
        dateTime: Date;
        notes: string | null;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
    })[]>;
    getMetrics(country: Country): Promise<{
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
    findOne(country: Country, id: string): import(".prisma/client").Prisma.Prisma__BookingClient<{
        package: {
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
            date: Date | null;
            location: string | null;
            coverImageUrl: string | null;
            generatedCoverImageUrl: string | null;
            generatedCoverImageProxyUrl: string | null;
            googleDriveUrl: string | null;
            driveFolderId: string | null;
            syncStatus: import(".prisma/client").$Enums.SyncStatus;
            lastSyncedAt: Date | null;
            syncErrorMessage: string | null;
            driveChangeToken: string | null;
            clientId: string | null;
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
        status: import(".prisma/client").$Enums.BookingStatus;
        location: string | null;
        clientId: string;
        eventId: string | null;
        dateTime: Date;
        notes: string | null;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(country: Country, id: string, body: UpdateBookingDto): Promise<{
        id: string;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        packageId: string;
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        location: string | null;
        clientId: string;
        eventId: string | null;
        dateTime: Date;
        notes: string | null;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
    }>;
    remove(country: Country, id: string): Promise<{
        id: string;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        packageId: string;
        price: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        location: string | null;
        clientId: string;
        eventId: string | null;
        dateTime: Date;
        notes: string | null;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
    }>;
    assign(country: Country, id: string, body: AssignUsersDto): Promise<[import(".prisma/client").Prisma.BatchPayload, import(".prisma/client").Prisma.BatchPayload]>;
}
