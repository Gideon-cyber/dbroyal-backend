import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class ApproveDownloadDto {
  @ApiProperty({ description: "User ID or name who approved the request" })
  @IsString()
  approvedBy: string;

  @ApiPropertyOptional({
    description: "Details about deliverables or delivery method",
  })
  @IsOptional()
  @IsString()
  deliverables?: string;
}
