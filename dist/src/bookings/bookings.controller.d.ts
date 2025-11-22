import { BookingsService } from "./bookings.service";
import { Country } from "@prisma/client";
import { CreateBookingDto, UpdateBookingDto, AssignUsersDto } from "./dto";
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(country: Country, body: CreateBookingDto): Promise<{
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
    findAll(country: Country): import(".prisma/client").Prisma.PrismaPromise<({
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
    findOne(country: Country, id: string): import(".prisma/client").Prisma.Prisma__BookingClient<{
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
    update(country: Country, id: string, body: UpdateBookingDto): Promise<{
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
    remove(country: Country, id: string): Promise<{
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
    assign(country: Country, id: string, body: AssignUsersDto): Promise<[import(".prisma/client").Prisma.BatchPayload, import(".prisma/client").Prisma.BatchPayload]>;
}
