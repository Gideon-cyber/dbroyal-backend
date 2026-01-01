import { Module } from "@nestjs/common";
import { DownloadsService } from "./downloads.service";
import { DownloadsController } from "./downloads.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [DownloadsController],
  providers: [DownloadsService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
