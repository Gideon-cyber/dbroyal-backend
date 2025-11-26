import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EventsService } from "../events/events.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PhotoSyncScheduler {
  private readonly logger = new Logger(PhotoSyncScheduler.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Sync photos for all events that require syncing
   * Runs every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async handlePhotoSync() {
    this.logger.log("Starting scheduled photo sync...");

    try {
      // Find events that need syncing:
      // 1. Events with SYNC_REQUIRED status
      // 2. Events that haven't been synced in the last 24 hours
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
                        lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
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

      // Sync events in batches to avoid overwhelming the system
      for (const event of events) {
        try {
          this.logger.debug(`Syncing event: ${event.name} (${event.id})`);

          // Use incremental sync for better performance
          await this.eventsService.syncPhotosIncremental(
            event.id,
            event.country
          );

          successCount++;
          this.logger.debug(`Successfully synced event: ${event.name}`);
        } catch (error) {
          errorCount++;
          this.logger.error(
            `Failed to sync event ${event.id} (${event.name}): ${error.message}`
          );
        }

        // Add a small delay between syncs to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      this.logger.log(
        `Scheduled sync completed: ${successCount} successful, ${errorCount} failed`
      );
    } catch (error) {
      this.logger.error(`Scheduled sync failed: ${error.message}`);
    }
  }

  /**
   * Cleanup expired download selections
   * Runs every day at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleCleanupExpiredSelections() {
    this.logger.log("Starting cleanup of expired download selections...");

    try {
      const result = await this.eventsService.cleanupExpiredSelections();
      this.logger.log(
        `Cleanup completed: ${result.deleted} selections deleted`
      );
    } catch (error) {
      this.logger.error(`Cleanup failed: ${error.message}`);
    }
  }

  /**
   * Mark events that need re-syncing
   * Runs every 12 hours
   * This ensures events with Google Drive URLs are regularly checked
   */
  @Cron(CronExpression.EVERY_12_HOURS)
  async handleMarkEventsForSync() {
    this.logger.log("Marking events for sync check...");

    try {
      // Mark events with UP_TO_DATE status that haven't been synced in 24 hours
      const result = await this.prisma.event.updateMany({
        where: {
          googleDriveUrl: { not: null },
          syncStatus: "UP_TO_DATE",
          lastSyncedAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          },
        },
        data: {
          syncStatus: "SYNC_REQUIRED",
        },
      });

      this.logger.log(`Marked ${result.count} events for sync`);
    } catch (error) {
      this.logger.error(`Failed to mark events for sync: ${error.message}`);
    }
  }
}
