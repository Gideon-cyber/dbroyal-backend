import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { DownloadsService } from "./downloads.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";
import {
  CreateDownloadSelectionDto,
  ApproveDownloadDto,
  RejectDownloadDto,
  UpdateDeliveryFormatDto,
  UpdateCustomerDetailsDto,
  UploadPaymentProofDto,
  VerifyPaymentDto,
} from "./dto";

@ApiTags("downloads")
@Controller("downloads")
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new download selection",
    description:
      "Creates a new download request for selected photos from an event. Generates a unique token for the download link.",
  })
  @ApiResponse({
    status: 201,
    description: "Download selection created successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid event ID or photo IDs",
  })
  @ApiResponse({
    status: 404,
    description: "Event not found",
  })
  async create(@Body() body: CreateDownloadSelectionDto) {
    return this.downloadsService.createDownloadSelection({
      eventId: body.eventId,
      photoIds: body.photoIds,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
  }

  @Patch(":id/approve")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Approve a download request",
    description:
      "Approves a download request and sends an email notification to the client with the download link.",
  })
  @ApiParam({
    name: "id",
    description: "Download selection ID",
  })
  @ApiResponse({
    status: 200,
    description: "Download request approved successfully and email sent",
  })
  @ApiResponse({
    status: 404,
    description: "Download selection not found",
  })
  async approve(@Param("id") id: string, @Body() body: ApproveDownloadDto) {
    return this.downloadsService.approveDownloadRequest(
      id,
      body.approvedBy,
      body.deliverables
    );
  }

  @Patch(":id/complete")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Mark download as completed",
    description:
      "Marks a download as completed/shipped, updating its delivery status to SHIPPED.",
  })
  @ApiParam({
    name: "id",
    description: "Download selection ID",
  })
  @ApiResponse({
    status: 200,
    description: "Download marked as completed successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Download selection not found",
  })
  async complete(@Param("id") id: string) {
    return this.downloadsService.completeDownload(id);
  }

  @Patch(":id/reject")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Reject a download request",
    description:
      "Rejects a download request with a reason, updating its delivery status to REJECTED.",
  })
  @ApiParam({
    name: "id",
    description: "Download selection ID",
  })
  @ApiResponse({
    status: 200,
    description: "Download request rejected successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Download selection not found",
  })
  async reject(@Param("id") id: string, @Body() body: RejectDownloadDto) {
    return this.downloadsService.rejectDownloadRequest(
      id,
      body.rejectionReason
    );
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get download selection by ID",
    description:
      "Retrieves a specific download selection by its ID with related event and client information.",
  })
  @ApiParam({
    name: "id",
    description: "Download selection ID",
  })
  @ApiResponse({
    status: 200,
    description: "Download selection retrieved successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Download selection not found",
  })
  async getById(@Param("id") id: string) {
    return this.downloadsService.getById(id);
  }

  @Get("token/:token")
  @ApiOperation({
    summary: "Get download selection by token",
    description:
      "Public endpoint to retrieve download selection details using a unique token. Used by clients to access their downloads.",
  })
  @ApiParam({
    name: "token",
    description: "Unique download token",
  })
  @ApiResponse({
    status: 200,
    description: "Download selection retrieved successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Download not found",
  })
  @ApiResponse({
    status: 400,
    description: "Download link has expired",
  })
  async getByToken(@Param("token") token: string) {
    return this.downloadsService.getByToken(token);
  }

  @Get("event/:eventId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get all download selections for an event",
    description:
      "Retrieves all download requests associated with a specific event, ordered by creation date (newest first).",
  })
  @ApiParam({
    name: "eventId",
    description: "Event ID",
  })
  @ApiResponse({
    status: 200,
    description: "List of download selections retrieved successfully",
  })
  async getEventDownloads(@Param("eventId") eventId: string) {
    return this.downloadsService.getEventDownloads(eventId);
  }

  @Patch(":id/delivery-format")
  @ApiOperation({
    summary: "Update delivery format for selected photos",
    description:
      "Specify which photos should be delivered digitally or in framed format.",
  })
  @ApiParam({
    name: "id",
    description: "Download selection ID",
  })
  @ApiResponse({
    status: 200,
    description: "Delivery format updated successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Download selection not found",
  })
  async updateDeliveryFormat(
    @Param("id") id: string,
    @Body() body: UpdateDeliveryFormatDto
  ) {
    return this.downloadsService.updateDeliveryFormat(
      id,
      body.photoDeliveryFormats
    );
  }

  @Patch(":id/customer-details")
  @ApiOperation({
    summary: "Update customer details",
    description:
      "Update customer information including name, email, phone, and delivery address.",
  })
  @ApiParam({
    name: "id",
    description: "Download selection ID",
  })
  @ApiResponse({
    status: 200,
    description: "Customer details updated successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Download selection not found",
  })
  async updateCustomerDetails(
    @Param("id") id: string,
    @Body() body: UpdateCustomerDetailsDto
  ) {
    return this.downloadsService.updateCustomerDetails(id, {
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      deliveryAddress: body.deliveryAddress,
      additionalNotes: body.additionalNotes,
    });
  }

  @Patch(":id/payment-proof")
  @ApiOperation({
    summary: "Upload payment proof",
    description:
      "Upload bank transfer receipt/proof for Nigerian users. Payment will be pending admin verification.",
  })
  @ApiParam({
    name: "id",
    description: "Download selection ID",
  })
  @ApiResponse({
    status: 200,
    description: "Payment proof uploaded successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Download selection not found",
  })
  async uploadPaymentProof(
    @Param("id") id: string,
    @Body() body: UploadPaymentProofDto
  ) {
    return this.downloadsService.uploadPaymentProof(id, {
      paymentProofUrl: body.paymentProofUrl,
      bankName: body.bankName,
      transferReference: body.transferReference,
      notes: body.notes,
    });
  }

  @Patch(":id/verify-payment")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Verify payment",
    description:
      "Admin endpoint to verify payment proof and mark payment as confirmed.",
  })
  @ApiParam({
    name: "id",
    description: "Download selection ID",
  })
  @ApiResponse({
    status: 200,
    description: "Payment verified successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Download selection not found",
  })
  async verifyPayment(@Param("id") id: string, @Body() body: VerifyPaymentDto) {
    return this.downloadsService.verifyPayment(id, body.verifiedBy);
  }
}
