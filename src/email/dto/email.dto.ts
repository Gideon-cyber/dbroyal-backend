import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class BookingAddOnEmailDto {
  @ApiProperty({ description: "Add-on name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Quantity" })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: "Unit price" })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ description: "Total price for this add-on" })
  @IsNumber()
  totalPrice: number;
}

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
    description: "Service name (e.g., Wedding Photography)",
    example: "Wedding Photography",
  })
  @IsString()
  serviceName: string;

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
    description: "Package price (base price)",
    example: 50000,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: "Add-ons included in the booking",
    type: [BookingAddOnEmailDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingAddOnEmailDto)
  addOns?: BookingAddOnEmailDto[];

  @ApiProperty({
    description: "Total price including add-ons",
    example: 55000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @ApiProperty({
    description: "Deposit amount (if deposit booking)",
    example: 27500,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  depositAmount?: number;

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
    description: "Service name (e.g., Wedding Photography)",
    example: "Wedding Photography",
  })
  @IsString()
  serviceName: string;

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
    description: "Package price (base price)",
    example: 50000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: "Add-ons included in the booking",
    type: [BookingAddOnEmailDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingAddOnEmailDto)
  addOns?: BookingAddOnEmailDto[];

  @ApiProperty({
    description: "Total price including add-ons",
    example: 55000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @ApiProperty({
    description: "Deposit amount (if deposit booking)",
    example: 27500,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  depositAmount?: number;

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
    description: "Service name (e.g., Wedding Photography)",
    example: "Wedding Photography",
  })
  @IsString()
  serviceName: string;

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
    description: "Package price (base price)",
    example: 50000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: "Add-ons included in the booking",
    type: [BookingAddOnEmailDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingAddOnEmailDto)
  addOns?: BookingAddOnEmailDto[];

  @ApiProperty({
    description: "Total price including add-ons",
    example: 55000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @ApiProperty({
    description: "Additional information",
    example: "Please arrive 30 minutes early",
    required: false,
  })
  @IsString()
  @IsOptional()
  additionalInfo?: string;

  @ApiProperty({
    description: "Deposit amount (if deposit booking)",
    example: 27500,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  depositAmount?: number;

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

export class AdminBookingNotificationDto {
  @ApiProperty({ description: "Client name" })
  @IsString()
  clientName: string;

  @ApiProperty({ description: "Client email" })
  @IsEmail()
  clientEmail: string;

  @ApiProperty({ description: "Service name" })
  @IsString()
  serviceName: string;

  @ApiProperty({ description: "Event date" })
  @IsString()
  eventDate: string;

  @ApiProperty({ description: "Package name" })
  @IsString()
  packageName: string;

  @ApiProperty({ description: "Package price" })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: "Currency code", required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: "Country code", required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: "Booking notes", required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: "Add-ons included in the booking",
    type: [BookingAddOnEmailDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  addOns?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;

  @ApiProperty({
    description: "Total amount including add-ons",
    required: false,
  })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @ApiProperty({ description: "Deposit amount", required: false })
  @IsNumber()
  @IsOptional()
  depositAmount?: number;
}
