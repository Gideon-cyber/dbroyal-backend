import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
} from "class-validator";
import { Country } from "@prisma/client";

export class CreateEventDto {
  @ApiProperty({ description: "Event name" })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description:
      "URL-friendly slug for the event (auto-generated from name if not provided)",
  })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({
    description: "Service ID for the event",
    example: "clx1234567890abcdefghijk",
  })
  @IsString()
  serviceId: string;

  @ApiPropertyOptional({ description: "Event description" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "Event date",
    type: String,
    format: "date-time",
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: "Event location" })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: "Cover image URL" })
  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @ApiPropertyOptional({ description: "Google Drive folder URL" })
  @IsOptional()
  @IsString()
  googleDriveUrl?: string;

  @ApiPropertyOptional({ description: "Client ID" })
  @IsOptional()
  @IsUUID()
  clientId?: string;

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
