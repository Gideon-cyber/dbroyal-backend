import { PrismaService } from "../prisma/prisma.service";
import { EventCategory, Country } from "@prisma/client";
import { GoogleDriveService } from "../google-drive/google-drive.service";
export declare class EventsService {
    private readonly prisma;
    private readonly googleDriveService;
    constructor(prisma: PrismaService, googleDriveService: GoogleDriveService);
    create(data: {
        name: string;
        slug: string;
        category: EventCategory;
        description?: string;
        date?: string | Date;
        location?: string;
        coverImageUrl?: string;
        googleDriveUrl?: string;
        clientId?: string;
        country?: Country;
    }): import(".prisma/client").Prisma.Prisma__EventClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findAll(country?: Country): import(".prisma/client").Prisma.PrismaPromise<({
        photos: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.UploadStatus;
            url: string;
            eventId: string;
            driveFileId: string | null;
            caption: string | null;
            uploadedById: string | null;
        }[];
    } & {
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
    })[]>;
    findOne(id: string, country?: Country): import(".prisma/client").Prisma.Prisma__EventClient<{
        photos: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.UploadStatus;
            url: string;
            eventId: string;
            driveFileId: string | null;
            caption: string | null;
            uploadedById: string | null;
        }[];
    } & {
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: any, country?: Country): Promise<{
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
    }>;
    remove(id: string, country?: Country): Promise<{
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
    }>;
    addPhotos(eventId: string, photos: {
        url: string;
        caption?: string;
        uploadedById?: string;
    }[], country?: Country): Promise<import(".prisma/client").Prisma.BatchPayload>;
    listPhotos(eventId: string, country?: Country): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.UploadStatus;
        url: string;
        eventId: string;
        driveFileId: string | null;
        caption: string | null;
        uploadedById: string | null;
    }[]>;
    syncPhotosFromGoogleDrive(eventId: string, country?: Country): Promise<{
        synced: number;
        photos: {
            id: string;
            name: string;
            webViewLink: string;
            thumbnailLink: string;
            downloadLink: string;
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
        }[];
    }>;
    createDownloadSelection(eventId: string, driveFileIds: string[], expirationHours?: number, country?: Country): Promise<{
        token: string;
        shareLink: string;
        expiresAt: Date;
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
    createDownloadSelectionFromPhotos(eventId: string, photoIds: string[], expirationHours?: number, country?: Country): Promise<{
        token: string;
        shareLink: string;
        expiresAt: Date;
    }>;
    private extractDriveFileIdFromUrl;
    cleanupExpiredSelections(): Promise<{
        deleted: number;
    }>;
}
