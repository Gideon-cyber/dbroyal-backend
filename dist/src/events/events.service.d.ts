import { PrismaService } from "../prisma/prisma.service";
import { Country } from "@prisma/client";
import { GoogleDriveService } from "../google-drive/google-drive.service";
export declare class EventsService {
    private readonly prisma;
    private readonly googleDriveService;
    constructor(prisma: PrismaService, googleDriveService: GoogleDriveService);
    create(data: {
        name: string;
        slug?: string;
        serviceId: string;
        description?: string;
        date?: string | Date;
        location?: string;
        coverImageUrl?: string;
        googleDriveUrl?: string;
        clientId?: string;
        country?: Country;
    }): Promise<{
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
    } & {
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
        googleDriveUrl: string | null;
        driveFolderId: string | null;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        lastSyncedAt: Date | null;
        syncErrorMessage: string | null;
        driveChangeToken: string | null;
        clientId: string | null;
    }>;
    findAll(country?: Country, serviceId?: string, page?: number, limit?: number): Promise<{
        data: ({
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
        } & {
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
            googleDriveUrl: string | null;
            driveFolderId: string | null;
            syncStatus: import(".prisma/client").$Enums.SyncStatus;
            lastSyncedAt: Date | null;
            syncErrorMessage: string | null;
            driveChangeToken: string | null;
            clientId: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findByService(serviceId: string, country?: Country, page?: number, limit?: number, sortBy?: string, sortOrder?: "asc" | "desc"): Promise<{
        data: ({
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
        } & {
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
            googleDriveUrl: string | null;
            driveFolderId: string | null;
            syncStatus: import(".prisma/client").$Enums.SyncStatus;
            lastSyncedAt: Date | null;
            syncErrorMessage: string | null;
            driveChangeToken: string | null;
            clientId: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, country?: Country): Promise<{
        photos: {
            fileSize: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.UploadStatus;
            url: string;
            mimeType: string | null;
            googleDriveUrl: string | null;
            eventId: string;
            driveFileId: string | null;
            caption: string | null;
            width: number | null;
            height: number | null;
            uploadedById: string | null;
        }[];
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
        googleDriveUrl: string | null;
        driveFolderId: string | null;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        lastSyncedAt: Date | null;
        syncErrorMessage: string | null;
        driveChangeToken: string | null;
        clientId: string | null;
    }>;
    update(id: string, data: any, country?: Country): Promise<{
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
        googleDriveUrl: string | null;
        driveFolderId: string | null;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        lastSyncedAt: Date | null;
        syncErrorMessage: string | null;
        driveChangeToken: string | null;
        clientId: string | null;
    }>;
    remove(id: string, country?: Country): Promise<{
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
        googleDriveUrl: string | null;
        driveFolderId: string | null;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        lastSyncedAt: Date | null;
        syncErrorMessage: string | null;
        driveChangeToken: string | null;
        clientId: string | null;
    }>;
    addPhotos(eventId: string, photos: {
        url: string;
        caption?: string;
        uploadedById?: string;
    }[], country?: Country): Promise<import(".prisma/client").Prisma.BatchPayload>;
    listPhotos(eventId: string, country?: Country, page?: number, limit?: number): Promise<{
        data: {
            fileSize: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.UploadStatus;
            url: string;
            mimeType: string | null;
            googleDriveUrl: string | null;
            eventId: string;
            driveFileId: string | null;
            caption: string | null;
            width: number | null;
            height: number | null;
            uploadedById: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    syncPhotosFromGoogleDrive(eventId: string, country?: Country): Promise<{
        synced: number;
        syncedAt: Date;
        photos: {
            id: string;
            name: string;
            webViewLink: string;
            thumbnailLink: string;
            downloadLink: string;
            mimeType: string;
            size: string;
            imageMediaMetadata?: {
                width: number;
                height: number;
            };
        }[];
    }>;
    createShareableLink(photoIds: string[], country?: Country): Promise<string>;
    getGoogleDriveImages(eventId: string, country?: Country): Promise<{
        eventId: string;
        eventName: string;
        googleDriveUrl: string;
        totalImages: number;
        images: {
            id: string;
            name: string;
            webViewLink: string;
            thumbnailLink: string;
            downloadLink: string;
            mimeType: string;
            size: string;
            imageMediaMetadata?: {
                width: number;
                height: number;
            };
        }[];
    }>;
    createDownloadSelection(eventId: string, driveFileIds: string[], expirationHours?: number, country?: Country, deliverables?: string): Promise<{
        id: string;
        token: string;
        shareLink: string;
        expiresAt: Date;
        deliveryStatus: import(".prisma/client").$Enums.DeliveryStatus;
    }>;
    getDownloadSelection(token: string, country?: Country): Promise<{
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
    createDownloadSelectionFromPhotos(eventId: string, photoIds: string[], expirationHours?: number, country?: Country, deliverables?: string): Promise<{
        id: string;
        token: string;
        shareLink: string;
        expiresAt: Date;
        deliveryStatus: import(".prisma/client").$Enums.DeliveryStatus;
    }>;
    private extractDriveFileIdFromUrl;
    syncPhotosIncremental(eventId: string, country?: Country): Promise<{
        synced: number;
        added: number;
        removed: number;
        isFullSync: boolean;
        syncedAt: Date;
    }>;
    getSyncStatus(eventId: string, country?: Country): Promise<{
        eventId: string;
        eventName: string;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        lastSyncedAt: Date;
        syncErrorMessage: string;
        hasGoogleDrive: boolean;
        photoCount: number;
    }>;
    private generateSlug;
    cleanupExpiredSelections(): Promise<{
        deleted: number;
    }>;
    getPendingSyncEvents(country?: Country): Promise<{
        total: number;
        events: {
            id: string;
            name: string;
            syncStatus: import(".prisma/client").$Enums.SyncStatus;
            lastSyncedAt: Date;
            syncErrorMessage: string;
            photoCount: number;
        }[];
    }>;
    triggerBulkSync(country?: Country): Promise<{
        triggered: number;
        message: string;
        events: {
            id: string;
            name: string;
        }[];
    }>;
    getSyncStatistics(country?: Country): Promise<{
        total: number;
        byStatus: {
            neverSynced: number;
            upToDate: number;
            syncRequired: number;
            syncing: number;
            error: number;
        };
        totalPhotos: number;
        lastSyncedEvent: {
            id: string;
            name: string;
            lastSyncedAt: Date;
            syncStatus: import(".prisma/client").$Enums.SyncStatus;
            photoCount: number;
        };
    }>;
    listDownloadRequests(filters?: {
        status?: string;
        eventId?: string;
        startDate?: string;
        endDate?: string;
        country?: Country;
    }): Promise<{
        id: string;
        token: string;
        event: {
            id: string;
            name: string;
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
    updateDownloadStatus(requestId: string, status: string, options?: {
        rejectionReason?: string;
        approvedBy?: string;
        country?: Country;
    }): Promise<{
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
    approveDownloadRequest(requestId: string, approvedBy?: string, country?: Country): Promise<{
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
    rejectDownloadRequest(requestId: string, rejectionReason: string, country?: Country): Promise<{
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
    getDownloadRequestStats(country?: Country): Promise<{
        total: number;
        byStatus: {
            pendingPayment: number;
            pendingApproval: number;
            processing: number;
            shipped: number;
            rejected: number;
        };
    }>;
    streamPhotoFromDrive(driveFileId: string, size?: number): Promise<{
        stream: any;
        mimeType: string;
        size: string;
    }>;
}
