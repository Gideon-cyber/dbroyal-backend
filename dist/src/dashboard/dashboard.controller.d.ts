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
        event: {
            country: import(".prisma/client").$Enums.Country;
            description: string | null;
            id: string;
            clientId: string | null;
            location: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            slug: string;
            category: import(".prisma/client").$Enums.EventCategory;
            date: Date | null;
            coverImageUrl: string | null;
            googleDriveUrl: string | null;
            driveFolderId: string | null;
        };
        client: {
            country: import(".prisma/client").$Enums.Country;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            name: string;
            phone: string | null;
            avatarUrl: string | null;
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
        country: import(".prisma/client").$Enums.Country;
        id: string;
        title: string | null;
        eventId: string | null;
        clientId: string;
        dateTime: Date;
        location: string | null;
        approvalStatus: import(".prisma/client").$Enums.ApprovalStatus;
        status: import(".prisma/client").$Enums.BookingStatus;
        createdAt: Date;
        updatedAt: Date;
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
        category: import(".prisma/client").$Enums.EventCategory;
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
            service: import(".prisma/client").$Enums.EventCategory;
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
        category: import(".prisma/client").$Enums.EventCategory;
        clientName: string;
        location: string;
        dateTime: Date;
        assignedTo: string[];
        status: import(".prisma/client").$Enums.BookingStatus;
    }[]>;
}
