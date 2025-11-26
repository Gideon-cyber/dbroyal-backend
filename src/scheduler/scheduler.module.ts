import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PhotoSyncScheduler } from "./photo-sync.scheduler";
import { EventsModule } from "../events/events.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [ScheduleModule.forRoot(), EventsModule, PrismaModule],
  providers: [PhotoSyncScheduler],
})
export class SchedulerModule {}
