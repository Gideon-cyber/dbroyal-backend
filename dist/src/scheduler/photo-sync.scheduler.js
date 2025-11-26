"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PhotoSyncScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhotoSyncScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const events_service_1 = require("../events/events.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PhotoSyncScheduler = PhotoSyncScheduler_1 = class PhotoSyncScheduler {
    constructor(eventsService, prisma) {
        this.eventsService = eventsService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(PhotoSyncScheduler_1.name);
    }
    async handlePhotoSync() {
        this.logger.log("Starting scheduled photo sync...");
        try {
            const events = await this.prisma.event.findMany({
                where: {
                    googleDriveUrl: { not: null },
                    OR: [
                        { syncStatus: "SYNC_REQUIRED" },
                        { syncStatus: "ERROR" },
                        {
                            AND: [
                                { syncStatus: "UP_TO_DATE" },
                                {
                                    OR: [
                                        { lastSyncedAt: null },
                                        {
                                            lastSyncedAt: {
                                                lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    country: true,
                    syncStatus: true,
                    lastSyncedAt: true,
                },
            });
            this.logger.log(`Found ${events.length} events to sync`);
            let successCount = 0;
            let errorCount = 0;
            for (const event of events) {
                try {
                    this.logger.debug(`Syncing event: ${event.name} (${event.id})`);
                    await this.eventsService.syncPhotosIncremental(event.id, event.country);
                    successCount++;
                    this.logger.debug(`Successfully synced event: ${event.name}`);
                }
                catch (error) {
                    errorCount++;
                    this.logger.error(`Failed to sync event ${event.id} (${event.name}): ${error.message}`);
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            this.logger.log(`Scheduled sync completed: ${successCount} successful, ${errorCount} failed`);
        }
        catch (error) {
            this.logger.error(`Scheduled sync failed: ${error.message}`);
        }
    }
    async handleCleanupExpiredSelections() {
        this.logger.log("Starting cleanup of expired download selections...");
        try {
            const result = await this.eventsService.cleanupExpiredSelections();
            this.logger.log(`Cleanup completed: ${result.deleted} selections deleted`);
        }
        catch (error) {
            this.logger.error(`Cleanup failed: ${error.message}`);
        }
    }
    async handleMarkEventsForSync() {
        this.logger.log("Marking events for sync check...");
        try {
            const result = await this.prisma.event.updateMany({
                where: {
                    googleDriveUrl: { not: null },
                    syncStatus: "UP_TO_DATE",
                    lastSyncedAt: {
                        lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    },
                },
                data: {
                    syncStatus: "SYNC_REQUIRED",
                },
            });
            this.logger.log(`Marked ${result.count} events for sync`);
        }
        catch (error) {
            this.logger.error(`Failed to mark events for sync: ${error.message}`);
        }
    }
};
exports.PhotoSyncScheduler = PhotoSyncScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_6_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PhotoSyncScheduler.prototype, "handlePhotoSync", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PhotoSyncScheduler.prototype, "handleCleanupExpiredSelections", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_12_HOURS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PhotoSyncScheduler.prototype, "handleMarkEventsForSync", null);
exports.PhotoSyncScheduler = PhotoSyncScheduler = PhotoSyncScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        prisma_service_1.PrismaService])
], PhotoSyncScheduler);
//# sourceMappingURL=photo-sync.scheduler.js.map