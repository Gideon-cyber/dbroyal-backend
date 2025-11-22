import { EventsService } from "./events.service";
import { Country } from "@prisma/client";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { AddPhotosDto } from "./dto/add-photos.dto";
import { CreateShareableLinkDto } from "./dto/create-shareable-link.dto";
import { CreateDownloadSelectionDto } from "./dto/create-download-selection.dto";
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(country: Country, body: CreateEventDto): import(".prisma/client").Prisma.Prisma__EventClient<{
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
    findAll(country: Country): import(".prisma/client").Prisma.PrismaPromise<({
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
    findOne(country: Country, id: string): import(".prisma/client").Prisma.Prisma__EventClient<{
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
    update(country: Country, id: string, body: UpdateEventDto): Promise<{
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
    remove(country: Country, id: string): Promise<{
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
    addPhotos(country: Country, id: string, body: AddPhotosDto): Promise<import(".prisma/client").Prisma.BatchPayload>;
    listPhotos(country: Country, id: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.UploadStatus;
        url: string;
        eventId: string;
        driveFileId: string | null;
        caption: string | null;
        uploadedById: string | null;
    }[]>;
    syncPhotosFromGoogleDrive(country: Country, id: string): Promise<{
        synced: number;
        photos: {
            id: string;
            name: string;
            webViewLink: string;
            thumbnailLink: string;
            downloadLink: string;
        }[];
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
        }[];
    }>;
    createDownloadSelection(country: Country, id: string, body: CreateDownloadSelectionDto): Promise<{
        token: string;
        shareLink: string;
        expiresAt: Date;
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
}
