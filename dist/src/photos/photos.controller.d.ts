import { PhotosService } from "./photos.service";
import { UpdatePhotoDto } from "./dto";
export declare class PhotosController {
    private readonly photosService;
    constructor(photosService: PhotosService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.UploadStatus;
        url: string;
        eventId: string;
        driveFileId: string | null;
        caption: string | null;
        uploadedById: string | null;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__PhotoClient<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.UploadStatus;
        url: string;
        eventId: string;
        driveFileId: string | null;
        caption: string | null;
        uploadedById: string | null;
    }, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: string, body: UpdatePhotoDto): import(".prisma/client").Prisma.Prisma__PhotoClient<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.UploadStatus;
        url: string;
        eventId: string;
        driveFileId: string | null;
        caption: string | null;
        uploadedById: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__PhotoClient<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.UploadStatus;
        url: string;
        eventId: string;
        driveFileId: string | null;
        caption: string | null;
        uploadedById: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
