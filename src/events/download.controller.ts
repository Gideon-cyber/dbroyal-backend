import { Controller, Get, Param, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { Response } from "express";
import { EventsService } from "./events.service";
import { GoogleDriveService } from "../google-drive/google-drive.service";
import archiver from "archiver";
import { Country } from "@prisma/client";
import { GetCountry } from "../common/decorators/country.decorator";
import { ApiCountryHeader } from "../common/decorators/api-country-header.decorator";

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
  async getDownloadSelection(@GetCountry() country: Country, @Param("token") token: string) {
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
  async downloadAsZip(@GetCountry() country: Country, @Param("token") token: string, @Res() res: Response) {
    const selection = await this.eventsService.getDownloadSelection(token, country);

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
}
