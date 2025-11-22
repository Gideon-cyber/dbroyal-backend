import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsString,
  IsOptional,
  IsUUID,
  ValidateNested,
} from "class-validator";

export class PhotoDto {
  @ApiProperty({ description: "Photo URL" })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: "Photo caption" })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({ description: "User ID who uploaded the photo" })
  @IsOptional()
  @IsUUID()
  uploadedById?: string;
}

export class AddPhotosDto {
  @ApiProperty({
    description: "Array of photos to add",
    type: [PhotoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PhotoDto)
  photos: PhotoDto[];
}
