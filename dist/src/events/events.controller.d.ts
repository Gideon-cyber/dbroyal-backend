import { Response } from "express";
import { EventsService } from "./events.service";
import { Country } from "@prisma/client";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { AddPhotosDto } from "./dto/add-photos.dto";
import { CreateShareableLinkDto } from "./dto/create-shareable-link.dto";
import { CreateDownloadSelectionDto } from "./dto/create-download-selection.dto";
import { TriggerSyncDto } from "./dto/trigger-sync.dto";
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(country: Country, body: CreateEventDto): Promise<{
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
    findAll(country: Country, serviceId?: string, page?: string, limit?: string): Promise<{
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
    findByService(country: Country, serviceId: string, page?: string, limit?: string, sortBy?: string, sortOrder?: string): Promise<{
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
    findOne(country: Country, id: string): Promise<{
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
    update(country: Country, id: string, body: UpdateEventDto): Promise<{
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
    remove(country: Country, id: string): Promise<{
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
    addPhotos(country: Country, id: string, body: AddPhotosDto): Promise<import(".prisma/client").Prisma.BatchPayload>;
    listPhotos(country: Country, id: string, page?: string, limit?: string): Promise<{
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
    syncPhotosFromGoogleDrive(country: Country, id: string): Promise<{
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
    triggerSync(country: Country, id: string, body?: TriggerSyncDto): Promise<{
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
    } | {
        synced: number;
        added: number;
        removed: number;
        isFullSync: boolean;
        syncedAt: Date;
    }>;
    getSyncStatus(country: Country, id: string): Promise<{
        eventId: string;
        eventName: string;
        syncStatus: import(".prisma/client").$Enums.SyncStatus;
        lastSyncedAt: Date;
        syncErrorMessage: string;
        hasGoogleDrive: boolean;
        photoCount: number;
    }>;
    createShareableLink(country: Country, id: string, body: CreateShareableLinkDto): Promise<string>;
    getGoogleDriveImages(country: Country, id: string): Promise<{
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
    createDownloadSelection(country: Country, id: string, body: CreateDownloadSelectionDto): Promise<{
        id: string;
        token: string;
        shareLink: string;
        expiresAt: Date;
        deliveryStatus: import(".prisma/client").$Enums.DeliveryStatus;
    }>;
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
    cleanupExpiredSelections(): Promise<{
        deleted: number;
    }>;
    getPendingSyncEvents(country: Country): Promise<{
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
    triggerBulkSync(country: Country): Promise<{
        triggered: number;
        message: string;
        events: {
            id: string;
            name: string;
        }[];
    }>;
    getSyncStatistics(country: Country): Promise<{
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
    proxyImage(driveFileId: string, size: string, res: Response): Promise<void>;
}
