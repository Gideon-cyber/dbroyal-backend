import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RejectDownloadDto {
  @ApiProperty({ description: "Reason for rejecting the download request" })
  @IsString()
  rejectionReason: string;
}
