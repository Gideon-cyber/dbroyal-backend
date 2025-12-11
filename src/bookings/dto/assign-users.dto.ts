import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class AssignUsersDto {
  @ApiProperty({
    description: "Array of user IDs to assign to the booking",
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
