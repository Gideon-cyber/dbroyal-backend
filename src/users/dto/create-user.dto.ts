import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
} from "class-validator";
import { Role } from "@prisma/client";

export class CreateUserDto {
  @ApiProperty({ description: "User full name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "User email address" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "User password", minLength: 6 })
  @IsString()
  @MinLength(6)
  passwordHash: string;

  @ApiPropertyOptional({
    description: "User role",
    enum: Role,
    enumName: "Role",
    default: Role.PHOTOGRAPHER,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ description: "Phone number" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "Country code for phone number" })
  @IsOptional()
  @IsString()
  countryCode?: string;
}
