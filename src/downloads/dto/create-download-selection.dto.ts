import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsArray, IsOptional, IsDateString } from "class-validator";

export class CreateDownloadSelectionDto {
  @ApiProperty({ description: "Event ID for the download request" })
  @IsString()
  eventId: string;

  @ApiProperty({
    description: "Array of photo IDs to include in the download",
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  photoIds: string[];

  @ApiPropertyOptional({
    description: "Expiration date for the download link",
    type: String,
    format: "date-time",
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
