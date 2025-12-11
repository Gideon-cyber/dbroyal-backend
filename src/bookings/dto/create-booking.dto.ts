import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
} from "class-validator";
import { ApprovalStatus, BookingStatus, Country } from "@prisma/client";

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
    description: "Booking date and time",
    type: String,
    format: "date-time",
  })
  @IsDateString()
  dateTime: string;

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
}
