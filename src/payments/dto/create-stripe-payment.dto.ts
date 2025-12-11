import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateStripePaymentDto {
  @ApiProperty({
    description:
      "Amount to charge in the smallest currency unit (e.g., pence for GBP)",
    example: 50000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: "Currency code (e.g., GBP)",
    example: "GBP",
    default: "GBP",
  })
  @IsString()
  currency: string = "GBP";

  @ApiProperty({
    description: "Description of the payment",
    example: "Payment for Essential Wedding Photography Package",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Name of the person making payment",
    example: "John Doe",
    required: false,
  })
  @IsOptional()
  @IsString()
  paidBy?: string;
}
