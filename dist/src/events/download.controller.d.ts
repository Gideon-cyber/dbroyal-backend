import { Response } from "express";
import { EventsService } from "./events.service";
import { GoogleDriveService } from "../google-drive/google-drive.service";
import { Country } from "@prisma/client";
import { UpdateDownloadStatusDto, ListDownloadRequestsDto } from "./dto";
export declare class DownloadController {
    private readonly eventsService;
    private readonly googleDriveService;
    constructor(eventsService: EventsService, googleDriveService: GoogleDriveService);
    getDownloadSelection(country: Country, token: string): Promise<{
        event: {
            id: string;
            name: string;
        };
        images: {
            id: string;
            downloadLink: string;
            viewLink: string;
        }[];
        createdAt: Date;
        expiresAt: Date;
    }>;
    downloadAsZip(country: Country, token: string, res: Response): Promise<void>;
    listDownloadRequests(country: Country, filters: ListDownloadRequestsDto): Promise<{
        id: string;
        token: string;
        event: {
            id: string;
            name: string;
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
            date: Date;
        };
        client: {
            id: string;
            name: string;
            email: string;
        };
        photoCount: number;
        deliverables: string;
        deliveryStatus: import(".prisma/client").$Enums.DeliveryStatus;
        createdAt: Date;
        expiresAt: Date;
        approvedAt: Date;
        completedAt: Date;
        rejectionReason: string;
    }[]>;
    getDownloadRequestStats(country: Country): Promise<{
        total: number;
        byStatus: {
            pendingPayment: number;
            pendingApproval: number;
            processing: number;
            shipped: number;
            rejected: number;
        };
    }>;
    updateDownloadStatus(country: Country, id: string, updateDto: UpdateDownloadStatusDto): Promise<{
        id: string;
        token: string;
        deliveryStatus: import(".prisma/client").$Enums.DeliveryStatus;
        event: {
            id: string;
            name: string;
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
        approvedAt: Date;
        completedAt: Date;
        rejectionReason: string;
    }>;
    approveDownloadRequest(country: Country, id: string, approvedBy?: string): Promise<{
        id: string;
        token: string;
        deliveryStatus: import(".prisma/client").$Enums.DeliveryStatus;
        event: {
            id: string;
            name: string;
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
        approvedAt: Date;
        completedAt: Date;
        rejectionReason: string;
    }>;
    rejectDownloadRequest(country: Country, id: string, rejectionReason: string): Promise<{
        id: string;
        token: string;
        deliveryStatus: import(".prisma/client").$Enums.DeliveryStatus;
        event: {
            id: string;
            name: string;
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
        approvedAt: Date;
        completedAt: Date;
        rejectionReason: string;
    }>;
}
