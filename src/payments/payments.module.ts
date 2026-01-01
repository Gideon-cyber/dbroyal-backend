import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { EmailModule } from "../email/email.module";
import { StripeProvider } from "./providers/stripe.provider";

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
