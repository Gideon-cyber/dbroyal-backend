import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
} from "class-validator";

export class BookingConfirmationEmailDto {
  @ApiProperty({
    description: "Recipient email address",
    example: "client@example.com",
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: "Client name",
    example: "John Doe",
  })
  @IsString()
  clientName: string;

  @ApiProperty({
    description: "Event name",
    example: "Wedding Photography",
  })
  @IsString()
  eventName: string;

  @ApiProperty({
    description: "Event date",
    example: "December 25, 2025",
  })
  @IsString()
  eventDate: string;

  @ApiProperty({
    description: "Package name",
    example: "Premium Wedding Package",
  })
  @IsString()
  packageName: string;

  @ApiProperty({
    description: "Booking amount",
    example: 50000,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: "Currency code (ISO 4217)",
    example: "NGN",
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: "Country code",
    example: "NG",
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;
}

export class BookingPendingApprovalEmailDto {
  @ApiProperty({
    description: "Recipient email address",
    example: "client@example.com",
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: "Client name",
    example: "John Doe",
  })
  @IsString()
  clientName: string;

  @ApiProperty({
    description: "Event name",
    example: "Wedding Photography",
  })
  @IsString()
  eventName: string;

  @ApiProperty({
    description: "Event date",
    example: "December 25, 2025",
  })
  @IsString()
  eventDate: string;

  @ApiProperty({
    description: "Package name",
    example: "Premium Wedding Package",
  })
  @IsString()
  packageName: string;

  @ApiProperty({
    description: "Currency code (ISO 4217)",
    example: "NGN",
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: "Country code",
    example: "NG",
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;
}

export class BookingAcceptedEmailDto {
  @ApiProperty({
    description: "Recipient email address",
    example: "client@example.com",
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: "Client name",
    example: "John Doe",
  })
  @IsString()
  clientName: string;

  @ApiProperty({
    description: "Event name",
    example: "Wedding Photography",
  })
  @IsString()
  eventName: string;

  @ApiProperty({
    description: "Event date",
    example: "December 25, 2025",
  })
  @IsString()
  eventDate: string;

  @ApiProperty({
    description: "Additional information",
    example: "Please arrive 30 minutes early",
    required: false,
  })
  @IsString()
  @IsOptional()
  additionalInfo?: string;

  @ApiProperty({
    description: "Currency code (ISO 4217)",
    example: "NGN",
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: "Country code",
    example: "NG",
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;
}

export class DownloadReadyEmailDto {
  @ApiProperty({
    description: "Recipient email address",
    example: "client@example.com",
  })
  @IsEmail()
  to: string;

  @ApiProperty({
    description: "Client name",
    example: "John Doe",
  })
  @IsString()
  clientName: string;

  @ApiProperty({
    description: "Event name",
    example: "Wedding Photography",
  })
  @IsString()
  eventName: string;

  @ApiProperty({
    description: "Download URL for photos",
    example: "https://example.com/download/abc123",
  })
  @IsString()
  downloadUrl: string;

  @ApiProperty({
    description: "Download link expiration date",
    example: "2025-12-31T23:59:59Z",
    required: false,
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: Date;

  @ApiProperty({
    description: "Currency code (ISO 4217)",
    example: "NGN",
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: "Country code",
    example: "NG",
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;
}
