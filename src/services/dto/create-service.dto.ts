import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
} from "class-validator";
import { Country } from "@prisma/client";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateServiceDto {
  @ApiProperty({ description: "Service title", example: "Wedding Photography" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: "URL-friendly slug",
    example: "wedding-photography",
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ description: "Service description" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: "Service subtitle",
    example:
      "Capturing the magic of your special day with elegance and sophistication",
  })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiPropertyOptional({ description: "Service image URL" })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: "Service visibility", default: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
