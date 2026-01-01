import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class VerifyPaymentDto {
  @ApiProperty({ description: "Admin user ID who is verifying the payment" })
  @IsString()
  verifiedBy: string;
}
