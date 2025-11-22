import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { DownloadController } from "./download.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { GoogleDriveModule } from "../google-drive/google-drive.module";

@Module({
  imports: [PrismaModule, GoogleDriveModule],
  controllers: [EventsController, DownloadController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
