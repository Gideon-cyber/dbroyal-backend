import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Res,
  Query,
  Patch,
  Body,
  Post,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { Response } from "express";
import { EventsService } from "./events.service";
import { GoogleDriveService } from "../google-drive/google-drive.service";
import archiver from "archiver";
import { Country } from "@prisma/client";
import { GetCountry } from "../common/decorators/country.decorator";
import { ApiCountryHeader } from "../common/decorators/api-country-header.decorator";
import { UpdateDownloadStatusDto, ListDownloadRequestsDto } from "./dto";

@ApiTags("download")
@ApiCountryHeader()
@Controller("download")
export class DownloadController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly googleDriveService: GoogleDriveService
  ) {}

  @Get(":token")
  @ApiOperation({ summary: "View download selection details" })
  @ApiParam({ name: "token", description: "Download selection token" })
  @ApiResponse({
    status: 200,
    description: "Returns download selection details",
  })
  @ApiResponse({
    status: 404,
    description: "Download selection not found or expired",
  })
  async getDownloadSelection(
    @GetCountry() country: Country,
    @Param("token") token: string
  ) {
    return this.eventsService.getDownloadSelection(token, country);
  }

  @Get(":token/zip")
  @ApiOperation({ summary: "Download selected photos as ZIP file" })
  @ApiParam({ name: "token", description: "Download selection token" })
  @ApiResponse({
    status: 200,
    description: "Returns ZIP file containing selected photos",
  })
  @ApiResponse({
    status: 404,
    description: "Download selection not found or expired",
  })
  async downloadAsZip(
    @GetCountry() country: Country,
    @Param("token") token: string,
    @Res() res: Response
  ) {
    const selection = await this.eventsService.getDownloadSelection(
      token,
      country
    );

    // Set response headers for ZIP download
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${selection.event.name}-photos.zip"`
    );

    // Create ZIP archive
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add each file to the archive
    for (const image of selection.images) {
      try {
        const { buffer, filename } =
          await this.googleDriveService.downloadFileAsBuffer(image.id);
        archive.append(buffer, { name: filename });
      } catch (error) {
        console.error(`Failed to download file ${image.id}:`, error.message);
        // Continue with other files even if one fails
      }
    }

    // Finalize the archive
    await archive.finalize();
  }

  @Get("requests/list")
  @ApiOperation({ summary: "List all download requests with filters" })
  @ApiQuery({
    name: "status",
    required: false,
    enum: [
      "PENDING_PAYMENT",
      "PENDING_APPROVAL",
      "PROCESSING_DELIVERY",
      "SHIPPED",
      "REJECTED",
    ],
  })
  @ApiQuery({ name: "eventId", required: false })
  @ApiQuery({ name: "startDate", required: false })
  @ApiQuery({ name: "endDate", required: false })
  @ApiResponse({
    status: 200,
    description: "Returns list of download requests",
  })
  async listDownloadRequests(
    @GetCountry() country: Country,
    @Query() filters: ListDownloadRequestsDto
  ) {
    return this.eventsService.listDownloadRequests({ ...filters, country });
  }

  @Get("requests/stats")
  @ApiOperation({ summary: "Get download request statistics" })
  @ApiResponse({
    status: 200,
    description: "Returns statistics about download requests",
  })
  async getDownloadRequestStats(@GetCountry() country: Country) {
    return this.eventsService.getDownloadRequestStats(country);
  }

  @Patch("requests/:id/status")
  @ApiOperation({ summary: "Update download request status" })
  @ApiParam({ name: "id", description: "Download request ID" })
  @ApiBody({ type: UpdateDownloadStatusDto })
  @ApiResponse({
    status: 200,
    description: "Download request status updated successfully",
  })
  @ApiResponse({ status: 404, description: "Download request not found" })
  async updateDownloadStatus(
    @GetCountry() country: Country,
    @Param("id") id: string,
    @Body() updateDto: UpdateDownloadStatusDto
  ) {
    return this.eventsService.updateDownloadStatus(id, updateDto.status, {
      rejectionReason: updateDto.rejectionReason,
      approvedBy: updateDto.approvedBy,
      country,
    });
  }

  @Post("requests/:id/approve")
  @ApiOperation({ summary: "Approve a download request" })
  @ApiParam({ name: "id", description: "Download request ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        approvedBy: { type: "string", description: "User ID who approved" },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Download request approved successfully",
  })
  @ApiResponse({ status: 404, description: "Download request not found" })
  async approveDownloadRequest(
    @GetCountry() country: Country,
    @Param("id") id: string,
    @Body("approvedBy") approvedBy?: string
  ) {
    return this.eventsService.approveDownloadRequest(id, approvedBy, country);
  }

  @Post("requests/:id/reject")
  @ApiOperation({ summary: "Reject a download request" })
  @ApiParam({ name: "id", description: "Download request ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        rejectionReason: {
          type: "string",
          description: "Reason for rejection",
        },
      },
      required: ["rejectionReason"],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Download request rejected successfully",
  })
  @ApiResponse({ status: 404, description: "Download request not found" })
  @ApiResponse({
    status: 400,
    description: "Rejection reason is required",
  })
  async rejectDownloadRequest(
    @GetCountry() country: Country,
    @Param("id") id: string,
    @Body("rejectionReason") rejectionReason: string
  ) {
    if (!rejectionReason) {
      throw new BadRequestException("Rejection reason is required");
    }
    return this.eventsService.rejectDownloadRequest(
      id,
      rejectionReason,
      country
    );
  }
}
