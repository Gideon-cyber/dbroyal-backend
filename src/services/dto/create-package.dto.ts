import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsEnum,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { Country } from "@prisma/client";

export class PackagePricingDto {
  @ApiProperty({ enum: Country, example: "NG" })
  @IsEnum(Country)
  country: Country;

  @ApiProperty({ example: 475000 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: "NGN" })
  @IsString()
  currency: string;
}

export class CreatePackageDto {
  @ApiProperty({ example: "Essential Package" })
  @IsString()
  name: string;

  @ApiProperty({ example: "essential-package" })
  @IsString()
  slug: string;

  @ApiProperty({ example: "Perfect for smaller events", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: [
      "3-hours coverage",
      "50 edited photos",
      "Online gallery delivery",
    ],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiProperty({ type: [PackagePricingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackagePricingDto)
  pricing: PackagePricingDto[];

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
