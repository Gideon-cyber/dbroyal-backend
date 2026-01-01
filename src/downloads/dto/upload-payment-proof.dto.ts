import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsUrl } from "class-validator";

export class UploadPaymentProofDto {
  @ApiProperty({
    description: "URL of the payment proof screenshot (bank transfer receipt)",
  })
  @IsString()
  @IsUrl()
  paymentProofUrl: string;

  @ApiPropertyOptional({ description: "Bank name used for transfer" })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ description: "Transfer reference number" })
  @IsOptional()
  @IsString()
  transferReference?: string;

  @ApiPropertyOptional({ description: "Additional payment notes" })
  @IsOptional()
  @IsString()
  notes?: string;
}
