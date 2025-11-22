import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsEnum } from "class-validator";
import { UploadStatus } from "@prisma/client";

export class UpdatePhotoDto {
  @ApiPropertyOptional({ description: "Photo caption" })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiPropertyOptional({
    description: "Upload status",
    enum: UploadStatus,
    enumName: "UploadStatus",
  })
  @IsOptional()
  @IsEnum(UploadStatus)
  status?: UploadStatus;
}
