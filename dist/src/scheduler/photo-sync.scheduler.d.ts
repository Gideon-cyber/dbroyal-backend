import { EventsService } from "../events/events.service";
import { PrismaService } from "../prisma/prisma.service";
export declare class PhotoSyncScheduler {
    private readonly eventsService;
    private readonly prisma;
    private readonly logger;
    constructor(eventsService: EventsService, prisma: PrismaService);
    handlePhotoSync(): Promise<void>;
    handleCleanupExpiredSelections(): Promise<void>;
    handleMarkEventsForSync(): Promise<void>;
}
