import { ApiProperty } from "@nestjs/swagger";
import { IsObject } from "class-validator";

export class UpdateDeliveryFormatDto {
  @ApiProperty({
    description:
      'JSON object mapping photo IDs to delivery format ("digital" or "framed")',
    example: {
      photo1: "digital",
      photo2: "framed",
      photo3: "digital",
    },
  })
  @IsObject()
  photoDeliveryFormats: Record<string, "digital" | "framed">;
}
