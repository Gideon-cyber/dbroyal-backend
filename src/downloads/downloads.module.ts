import { Module } from "@nestjs/common";
import { DownloadsService } from "./downloads.service";
import { DownloadsController } from "./downloads.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { EmailModule } from "../email/email.module";
import { GoogleDriveModule } from "../google-drive/google-drive.module";

@Module({
  imports: [PrismaModule, EmailModule, GoogleDriveModule],
  controllers: [DownloadsController],
  providers: [DownloadsService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
