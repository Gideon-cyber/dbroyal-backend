import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsOptional,
  IsUUID,
  IsString,
  IsNumber,
  Min,
} from "class-validator";

export class CreateDownloadSelectionDto {
  @ApiPropertyOptional({
    description: "Array of photo IDs from database",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  photoIds?: string[];

  @ApiPropertyOptional({
    description: "Array of Google Drive file IDs",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  driveFileIds?: string[];

  @ApiPropertyOptional({
    description: "Number of hours until the download link expires",
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  expirationHours?: number;
}
