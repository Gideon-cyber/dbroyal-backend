import { PrismaService } from '../prisma/prisma.service';
import { ApprovalStatus, BookingStatus, Country } from '@prisma/client';
export declare class BookingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        title?: string;
        eventId?: string;
        clientId: string;
        dateTime: string | Date;
        location?: string;
        approvalStatus?: ApprovalStatus;
        status?: BookingStatus;
        country?: Country;
        assignedUserIds?: string[];
    }): Promise<{
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
            description: string | null;
            slug: string;
            category: import(".prisma/client").$Enums.EventCategory;
            date: Date | null;
            location: string | null;
            coverImageUrl: string | null;
            googleDriveUrl: string | null;
            driveFolderId: string | null;
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
        status: import(".prisma/client").$Enums.BookingStatus;
        location: string | null;
        clientId: string;
        eventId: string | null;
        dateTime: Date;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
    }>;
    findAll(country?: Country): import(".prisma/client").Prisma.PrismaPromise<({
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
            description: string | null;
            slug: string;
            category: import(".prisma/client").$Enums.EventCategory;
            date: Date | null;
            location: string | null;
            coverImageUrl: string | null;
            googleDriveUrl: string | null;
            driveFolderId: string | null;
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
        status: import(".prisma/client").$Enums.BookingStatus;
        location: string | null;
        clientId: string;
        eventId: string | null;
        dateTime: Date;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
    })[]>;
    findOne(id: string, country?: Country): import(".prisma/client").Prisma.Prisma__BookingClient<{
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
            description: string | null;
            slug: string;
            category: import(".prisma/client").$Enums.EventCategory;
            date: Date | null;
            location: string | null;
            coverImageUrl: string | null;
            googleDriveUrl: string | null;
            driveFolderId: string | null;
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
        status: import(".prisma/client").$Enums.BookingStatus;
        location: string | null;
        clientId: string;
        eventId: string | null;
        dateTime: Date;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: any, country?: Country): Promise<{
        id: string;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        location: string | null;
        clientId: string;
        eventId: string | null;
        dateTime: Date;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
    }>;
    remove(id: string, country?: Country): Promise<{
        id: string;
        country: import(".prisma/client").$Enums.Country;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        status: import(".prisma/client").$Enums.BookingStatus;
        location: string | null;
        clientId: string;
        eventId: string | null;
        dateTime: Date;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
    }>;
    assignUsers(id: string, userIds: string[], country?: Country): Promise<[import(".prisma/client").Prisma.BatchPayload, import(".prisma/client").Prisma.BatchPayload]>;
}
