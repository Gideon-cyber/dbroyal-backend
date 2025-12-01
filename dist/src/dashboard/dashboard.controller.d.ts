import { DashboardService } from "./dashboard.service";
import { Country } from "@prisma/client";
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getMetrics(country?: Country): Promise<{
        totalEarnings: {
            value: number;
            percentageChange: number;
            trend: string;
        };
        totalBookings: {
            value: number;
            percentageChange: number;
            trend: string;
        };
        pendingApprovals: {
            value: number;
            status: string;
        };
        teamMembers: {
            value: number;
            status: string;
        };
    }>;
    getRecentBookings(country?: Country, limit?: string): Promise<({
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
        assigned: ({
            user: {
                id: string;
                email: string;
                name: string;
                role: import(".prisma/client").$Enums.Role;
            };
        } & {
            bookingId: string;
            userId: string;
            assignedAt: Date;
        })[];
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
    getBookingsByStatus(country?: Country): Promise<{
        scheduled: number;
        completed: number;
        canceled: number;
    }>;
    getMonthlyTrend(country?: Country, months?: string): Promise<any[]>;
    getPendingApprovals(country?: Country, limit?: string, startDate?: string, endDate?: string): Promise<{
        id: string;
        title: string;
        service: string;
        serviceSlug: string;
        clientName: string;
        location: string;
        dateTime: Date;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
        createdAt: Date;
    }[]>;
    getRecentUploads(country?: Country): Promise<{
        totalUploadsToday: number;
        uploads: {
            id: string;
            service: string;
            eventName: string;
            clientName: string;
            uploadedBy: string;
            uploadDate: Date;
            totalPhotos: number;
            completedPhotos: number;
            pendingPhotos: number;
            status: string;
        }[];
    }>;
    getUpcomingBookings(country?: Country, limit?: string): Promise<{
        id: string;
        title: string;
        service: string;
        serviceSlug: string;
        clientName: string;
        dateTime: Date;
        location: string;
        assignedTo: string[];
        status: import(".prisma/client").$Enums.BookingStatus;
    }[]>;
}
