import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class TriggerSyncDto {
  @ApiProperty({
    description:
      "Whether to force a full sync (default: false, uses incremental sync)",
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  fullSync?: boolean;
}
