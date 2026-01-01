import { Module } from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { BookingsController } from "./bookings.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { PaymentsModule } from "../payments/payments.module";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [PrismaModule, PaymentsModule, EmailModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
