import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class CreateShareableLinkDto {
  @ApiProperty({
    description: "Array of photo IDs to include in the shareable link",
    type: [String],
  })
  @IsArray()
  @IsUUID("4", { each: true })
  photoIds: string[];
}
