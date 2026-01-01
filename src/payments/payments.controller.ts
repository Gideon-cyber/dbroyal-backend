import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { Country } from "@prisma/client";
import { GetCountry } from "../common/decorators/country.decorator";
import { ApiCountryHeader } from "../common/decorators/api-country-header.decorator";
import {
  CreateStripePaymentDto,
  CreateBankTransferPaymentDto,
  VerifyPaymentDto,
  ConfirmStripePaymentDto,
} from "./dto";
import { Request } from "express";

@ApiTags("payments")
@ApiCountryHeader()
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get("bank-account")
  @ApiOperation({ summary: "Get bank account details for Nigeria payments" })
  @ApiResponse({
    status: 200,
    description: "Returns bank account details for manual transfers",
  })
  getBankAccountDetails(@GetCountry() country: Country) {
    return this.paymentsService.getBankAccountDetails(country);
  }

  @Post("downloads/:downloadId/stripe")
  @ApiOperation({ summary: "Create a Stripe payment intent for download" })
  @ApiParam({ name: "downloadId", description: "Download Selection ID" })
  @ApiResponse({
    status: 201,
    description: "Payment intent created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Download not found" })
  createDownloadPayment(
    @Param("downloadId") downloadId: string,
    @Body() dto: CreateStripePaymentDto
  ) {
    return this.paymentsService.createDownloadPayment(
      downloadId,
      dto.amount,
      dto.currency,
      dto.description,
      dto.paidBy
    );
  }

  @Post("bookings/:bookingId/stripe")
  @ApiOperation({ summary: "Create a Stripe payment intent for UK booking" })
  @ApiParam({ name: "bookingId", description: "Booking ID" })
  @ApiResponse({
    status: 201,
    description: "Payment intent created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Booking not found" })
  createStripePayment(
    @Param("bookingId") bookingId: string,
    @Body() dto: CreateStripePaymentDto
  ) {
    return this.paymentsService.createStripePayment(
      bookingId,
      dto.amount,
      dto.currency,
      dto.description,
      dto.paidBy
    );
  }

  @Post("bookings/:bookingId/bank-transfer")
  @ApiOperation({
    summary: "Submit bank transfer payment proof for Nigeria booking",
  })
  @ApiParam({ name: "bookingId", description: "Booking ID" })
  @ApiResponse({ status: 201, description: "Payment proof submitted" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Booking not found" })
  createBankTransferPayment(
    @Param("bookingId") bookingId: string,
    @Body() dto: CreateBankTransferPaymentDto
  ) {
    return this.paymentsService.createBankTransferPayment(bookingId, {
      amount: dto.amount,
      paymentProofUrl: dto.paymentProofUrl,
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      transferReference: dto.transferReference,
      paidBy: dto.paidBy,
      notes: dto.notes,
    });
  }

  @Post("stripe/confirm")
  @ApiOperation({ summary: "Confirm Stripe payment after client completes it" })
  @ApiResponse({ status: 200, description: "Payment confirmed" })
  @ApiResponse({ status: 400, description: "Payment failed or pending" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  confirmStripePayment(@Body() dto: ConfirmStripePaymentDto) {
    return this.paymentsService.confirmStripePayment(dto.paymentIntentId);
  }

  @Post("downloads/stripe/confirm")
  @ApiOperation({
    summary: "Confirm Stripe payment for download after client completes it",
  })
  @ApiResponse({ status: 200, description: "Download payment confirmed" })
  @ApiResponse({ status: 400, description: "Payment failed or pending" })
  @ApiResponse({ status: 404, description: "Download not found" })
  confirmDownloadPayment(@Body() dto: ConfirmStripePaymentDto) {
    return this.paymentsService.confirmDownloadPayment(dto.paymentIntentId);
  }

  @Post("verify")
  @ApiOperation({ summary: "Admin verifies a bank transfer payment" })
  @ApiResponse({ status: 200, description: "Payment verified" })
  @ApiResponse({ status: 400, description: "Invalid payment status" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  verifyPayment(
    @Body() dto: VerifyPaymentDto,
    @Query("adminUserId") adminUserId?: string
  ) {
    if (!adminUserId) {
      throw new BadRequestException("Admin user ID is required");
    }
    return this.paymentsService.verifyBankTransferPayment(
      dto.paymentId,
      dto.approved,
      adminUserId,
      dto.notes
    );
  }

  @Get("pending")
  @ApiOperation({ summary: "Get all pending payments awaiting verification" })
  @ApiQuery({
    name: "country",
    required: false,
    enum: Country,
    description: "Filter by country",
  })
  @ApiResponse({ status: 200, description: "Returns pending payments" })
  getPendingPayments(@Query("country") country?: Country) {
    return this.paymentsService.getPendingPayments(country);
  }

  @Get("bookings/:bookingId")
  @ApiOperation({ summary: "Get all payments for a booking" })
  @ApiParam({ name: "bookingId", description: "Booking ID" })
  @ApiResponse({ status: 200, description: "Returns booking payments" })
  getBookingPayments(@Param("bookingId") bookingId: string) {
    return this.paymentsService.getBookingPayments(bookingId);
  }

  @Get("bookings/:bookingId/balance")
  @ApiOperation({ summary: "Get booking payment balance" })
  @ApiParam({ name: "bookingId", description: "Booking ID" })
  @ApiResponse({ status: 200, description: "Returns payment balance details" })
  @ApiResponse({ status: 404, description: "Booking not found" })
  getBookingBalance(@Param("bookingId") bookingId: string) {
    return this.paymentsService.calculateBookingBalance(bookingId);
  }

  @Get("downloads/:downloadId")
  @ApiOperation({ summary: "Get download payment details" })
  @ApiParam({ name: "downloadId", description: "Download Selection ID" })
  @ApiResponse({ status: 200, description: "Returns download payment details" })
  @ApiResponse({ status: 404, description: "Download not found" })
  getDownloadPayment(@Param("downloadId") downloadId: string) {
    return this.paymentsService.getDownloadPayment(downloadId);
  }

  @Get(":paymentId")
  @ApiOperation({ summary: "Get payment details" })
  @ApiParam({ name: "paymentId", description: "Payment ID" })
  @ApiResponse({ status: 200, description: "Returns payment details" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  getPayment(@Param("paymentId") paymentId: string) {
    return this.paymentsService.getPayment(paymentId);
  }

  @Post(":paymentId/refund")
  @ApiOperation({ summary: "Create a refund for a payment" })
  @ApiParam({ name: "paymentId", description: "Payment ID" })
  @ApiResponse({ status: 200, description: "Refund initiated" })
  @ApiResponse({ status: 400, description: "Cannot refund this payment" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  refundPayment(
    @Param("paymentId") paymentId: string,
    @Body() body: { amount?: number; reason?: string },
    @Query("adminUserId") adminUserId?: string
  ) {
    return this.paymentsService.refundPayment(
      paymentId,
      body.amount,
      body.reason,
      adminUserId
    );
  }

  @Post("stripe/webhook")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Stripe webhook endpoint" })
  @ApiResponse({ status: 200, description: "Webhook processed" })
  @ApiResponse({ status: 400, description: "Webhook verification failed" })
  async handleStripeWebhook(
    @Headers("stripe-signature") signature: string,
    @Req() req: RawBodyRequest<Request>
  ) {
    if (!signature) {
      throw new BadRequestException("Missing stripe-signature header");
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException("Missing request body");
    }

    // Note: You'll need to configure NestJS to preserve raw body for this endpoint
    // Add this to main.ts for the webhook route:
    // app.use('/payments/stripe/webhook', express.raw({ type: 'application/json' }));

    const event = this.paymentsService["stripeProvider"].constructWebhookEvent(
      rawBody,
      signature
    );

    return this.paymentsService.handleStripeWebhook(event);
  }
}
