import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, IsUrl, Min } from "class-validator";

export class CreateBankTransferPaymentDto {
  @ApiProperty({
    description: "Amount paid in Naira",
    example: 250000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: "URL to the payment proof screenshot",
    example: "https://example.com/payment-proof.jpg",
  })
  @IsUrl()
  paymentProofUrl: string;

  @ApiProperty({
    description: "Bank name used for transfer",
    example: "GTBank",
    required: false,
  })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({
    description: "Account number used (last 4 digits or full)",
    example: "1234",
    required: false,
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({
    description: "Transfer reference number from bank",
    example: "TRX123456789",
    required: false,
  })
  @IsOptional()
  @IsString()
  transferReference?: string;

  @ApiProperty({
    description: "Name of the person who made payment",
    example: "Chidi Okafor",
    required: false,
  })
  @IsOptional()
  @IsString()
  paidBy?: string;

  @ApiProperty({
    description: "Additional notes about the payment",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
