import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEmail, IsOptional, IsUrl, IsEnum } from "class-validator";
import { Country } from "@prisma/client";

export class CreateClientDto {
  @ApiProperty({ description: "Client name" })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: "Client email address" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: "Client phone number" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "Client avatar URL" })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({
    enum: Country,
    description: "Country code (NG for Nigeria, UK for United Kingdom)",
    example: "NG",
    default: "NG",
  })
  @IsOptional()
  @IsEnum(Country, { message: "Country must be either NG or UK" })
  country?: Country;
}
