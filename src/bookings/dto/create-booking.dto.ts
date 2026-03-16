import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApprovalStatus, BookingStatus, Country } from "@prisma/client";

export class BookingAddOnDto {
  @ApiProperty({ description: "Add-on ID" })
  @IsString()
  addOnId: string;

  @ApiPropertyOptional({ description: "Quantity of this add-on", default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}

export class CreateBookingDto {
  @ApiPropertyOptional({ description: "Booking title" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: "Package ID" })
  @IsString()
  packageId: string;

  @ApiPropertyOptional({ description: "Related event ID" })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiProperty({ description: "Client ID" })
  @IsString()
  clientId: string;

  @ApiProperty({
    description: "Booking start date and time",
    type: String,
    format: "date-time",
    example: "2026-05-07T09:00:00.000Z",
  })
  @IsDateString()
  startDateTime: string;

  @ApiPropertyOptional({
    description:
      "Booking end date and time (required for multi-day/ranged bookings, optional for single-time bookings)",
    type: String,
    format: "date-time",
    example: "2026-05-12T18:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  endDateTime?: string;

  @ApiPropertyOptional({ description: "Booking location" })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: "Additional notes or requirements" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: "Approval status",
    enum: ApprovalStatus,
    enumName: "ApprovalStatus",
    default: ApprovalStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;

  @ApiPropertyOptional({
    description: "Booking status",
    enum: BookingStatus,
    enumName: "BookingStatus",
    default: BookingStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({
    description: "Array of user IDs to assign to this booking",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedUserIds?: string[];

  @ApiPropertyOptional({
    enum: Country,
    description: "Country code (NG for Nigeria, UK for United Kingdom)",
    example: "NG",
    default: "NG",
  })
  @IsOptional()
  @IsEnum(Country, { message: "Country must be either NG or UK" })
  country?: Country;

  @ApiPropertyOptional({
    description: "Array of add-ons to include with this booking",
    type: [BookingAddOnDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingAddOnDto)
  addOns?: BookingAddOnDto[];

  @ApiPropertyOptional({
    description:
      "Deposit amount (typically 50% of total price for deposit bookings)",
    example: 25000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;
}
