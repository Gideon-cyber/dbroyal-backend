import { IsEnum, IsOptional, IsString, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { DeliveryStatus } from "./update-download-status.dto";

export class ListDownloadRequestsDto {
  @ApiProperty({
    enum: DeliveryStatus,
    description: "Filter by delivery status",
    required: false,
  })
  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;

  @ApiProperty({
    description: "Filter by event ID",
    required: false,
  })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiProperty({
    description: "Filter by start date (ISO format)",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: "Filter by end date (ISO format)",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
