import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum DeliveryStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  PROCESSING_DELIVERY = "PROCESSING_DELIVERY",
  SHIPPED = "SHIPPED",
  REJECTED = "REJECTED",
}

export class UpdateDownloadStatusDto {
  @ApiProperty({
    enum: DeliveryStatus,
    description: "New delivery status for the download request",
  })
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @ApiProperty({
    description: "Reason for rejection (required if status is REJECTED)",
    required: false,
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiProperty({
    description: "User ID who is approving/updating the status",
    required: false,
  })
  @IsOptional()
  @IsString()
  approvedBy?: string;
}
