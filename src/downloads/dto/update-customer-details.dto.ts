import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEmail, MinLength, IsOptional } from "class-validator";

export class UpdateCustomerDetailsDto {
  @ApiProperty({ description: "Customer's full name", minLength: 2 })
  @IsString()
  @MinLength(2, { message: "Full name must be at least 2 characters" })
  customerName: string;

  @ApiProperty({ description: "Customer's email address" })
  @IsEmail({}, { message: "Please enter a valid email address" })
  customerEmail: string;

  @ApiProperty({ description: "Customer's phone number", minLength: 10 })
  @IsString()
  @MinLength(10, { message: "Please enter a valid phone number" })
  customerPhone: string;

  @ApiPropertyOptional({
    description: "Delivery address (required if ordering framed photos)",
  })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiPropertyOptional({ description: "Additional notes or requests" })
  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
