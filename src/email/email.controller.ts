import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { EmailService } from "./email.service";
import {
  BookingConfirmationEmailDto,
  BookingAcceptedEmailDto,
  DownloadReadyEmailDto,
} from "./dto/email.dto";

@ApiTags("email")
@Controller("email")
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post("booking-confirmation")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Send booking confirmation email",
    description:
      "Sends a booking confirmation email to the client with booking details",
  })
  @ApiResponse({
    status: 200,
    description: "Email sent successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid request data",
  })
  @ApiResponse({
    status: 500,
    description: "Failed to send email",
  })
  async sendBookingConfirmation(
    @Body() dto: BookingConfirmationEmailDto
  ): Promise<{ message: string }> {
    await this.emailService.sendBookingConfirmation(dto);
    return { message: "Booking confirmation email sent successfully" };
  }

  @Post("booking-accepted")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Send booking accepted email",
    description: "Sends a booking accepted notification email to the client",
  })
  @ApiResponse({
    status: 200,
    description: "Email sent successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid request data",
  })
  @ApiResponse({
    status: 500,
    description: "Failed to send email",
  })
  async sendBookingAccepted(
    @Body() dto: BookingAcceptedEmailDto
  ): Promise<{ message: string }> {
    await this.emailService.sendBookingAccepted(dto);
    return { message: "Booking accepted email sent successfully" };
  }

  @Post("download-ready")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Send download ready email",
    description:
      "Sends a download ready notification email to the client with download link",
  })
  @ApiResponse({
    status: 200,
    description: "Email sent successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid request data",
  })
  @ApiResponse({
    status: 500,
    description: "Failed to send email",
  })
  async sendDownloadReady(
    @Body() dto: DownloadReadyEmailDto
  ): Promise<{ message: string }> {
    await this.emailService.sendDownloadReady(dto);
    return { message: "Download ready email sent successfully" };
  }
}
