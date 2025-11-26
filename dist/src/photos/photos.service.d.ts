import { PrismaService } from '../prisma/prisma.service';
export declare class PhotosService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
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
        fileSize: bigint | null;
        width: number | null;
        height: number | null;
        uploadedById: string | null;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__PhotoClient<{
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
        fileSize: bigint | null;
        width: number | null;
        height: number | null;
        uploadedById: string | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, data: any): import(".prisma/client").Prisma.Prisma__PhotoClient<{
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
        fileSize: bigint | null;
        width: number | null;
        height: number | null;
        uploadedById: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__PhotoClient<{
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
        fileSize: bigint | null;
        width: number | null;
        height: number | null;
        uploadedById: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
