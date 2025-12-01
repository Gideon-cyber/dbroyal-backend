import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { Response } from "express";
import { EventsService } from "./events.service";
import { Country } from "@prisma/client";
import { GetCountry } from "../common/decorators/country.decorator";
import { ApiCountryHeader } from "../common/decorators/api-country-header.decorator";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { AddPhotosDto } from "./dto/add-photos.dto";
import { CreateShareableLinkDto } from "./dto/create-shareable-link.dto";
import { CreateDownloadSelectionDto } from "./dto/create-download-selection.dto";
import { TriggerSyncDto } from "./dto/trigger-sync.dto";

@ApiTags("events")
@ApiCountryHeader()
@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new event" })
  @ApiResponse({ status: 201, description: "Event created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(@GetCountry() country: Country, @Body() body: CreateEventDto) {
    return this.eventsService.create({ ...body, country });
  }

  @Get()
  @ApiOperation({ summary: "Get all events" })
  @ApiQuery({
    name: "serviceId",
    required: false,
    type: String,
    description: "Filter by service ID",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 10)",
  })
  @ApiResponse({
    status: 200,
    description: "Returns all events with pagination",
    schema: {
      properties: {
        data: {
          type: "array",
          items: { type: "object" },
        },
        pagination: {
          type: "object",
          properties: {
            page: { type: "number" },
            limit: { type: "number" },
            total: { type: "number" },
            totalPages: { type: "number" },
          },
        },
      },
    },
  })
  findAll(
    @GetCountry() country: Country,
    @Query("serviceId") serviceId?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.eventsService.findAll(country, serviceId, pageNum, limitNum);
  }

  @Get("service/:serviceId")
  @ApiOperation({ summary: "Get events by service" })
  @ApiParam({
    name: "serviceId",
    description: "Service ID",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 10)",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    type: String,
    description:
      "Field to sort by (default: createdAt). Options: name, date, createdAt",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    type: String,
    description: "Sort order (default: desc). Options: asc, desc",
  })
  @ApiResponse({
    status: 200,
    description: "Returns events for the specified service",
  })
  @ApiResponse({ status: 400, description: "Invalid service ID" })
  findByService(
    @GetCountry() country: Country,
    @Param("serviceId") serviceId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.eventsService.findByService(
      serviceId,
      country,
      pageNum,
      limitNum,
      sortBy,
      sortOrder as "asc" | "desc"
    );
  }

  @Get("slug/:slug")
  @ApiOperation({ summary: "Get event by slug" })
  @ApiParam({
    name: "slug",
    description: "Event slug (URL-friendly identifier)",
  })
  @ApiResponse({ status: 200, description: "Returns the event" })
  @ApiResponse({ status: 404, description: "Event not found" })
  findBySlug(@GetCountry() country: Country, @Param("slug") slug: string) {
    return this.eventsService.findBySlug(slug, country);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get event by ID" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Returns the event" })
  @ApiResponse({ status: 404, description: "Event not found" })
  findOne(@GetCountry() country: Country, @Param("id") id: string) {
    return this.eventsService.findOne(id, country);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an event" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Event updated successfully" })
  @ApiResponse({ status: 404, description: "Event not found" })
  update(
    @GetCountry() country: Country,
    @Param("id") id: string,
    @Body() body: UpdateEventDto
  ) {
    return this.eventsService.update(id, body, country);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an event" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Event deleted successfully" })
  @ApiResponse({ status: 404, description: "Event not found" })
  remove(@GetCountry() country: Country, @Param("id") id: string) {
    return this.eventsService.remove(id, country);
  }

  @Post(":id/photos")
  @ApiOperation({ summary: "Add photos to an event" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 201, description: "Photos added successfully" })
  addPhotos(
    @GetCountry() country: Country,
    @Param("id") id: string,
    @Body() body: AddPhotosDto
  ) {
    return this.eventsService.addPhotos(id, body.photos || [], country);
  }

  @Get(":id/photos")
  @ApiOperation({ summary: "Get all photos for an event" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page (default: 20)",
  })
  @ApiResponse({
    status: 200,
    description: "Returns event photos with pagination",
    schema: {
      properties: {
        data: {
          type: "array",
          items: { type: "object" },
        },
        pagination: {
          type: "object",
          properties: {
            page: { type: "number" },
            limit: { type: "number" },
            total: { type: "number" },
            totalPages: { type: "number" },
          },
        },
      },
    },
  })
  listPhotos(
    @GetCountry() country: Country,
    @Param("id") id: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.eventsService.listPhotos(id, country, pageNum, limitNum);
  }

  @Post(":id/sync-google-drive")
  @ApiOperation({ summary: "Sync photos from Google Drive (full sync)" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Photos synced successfully" })
  syncPhotosFromGoogleDrive(
    @GetCountry() country: Country,
    @Param("id") id: string
  ) {
    return this.eventsService.syncPhotosFromGoogleDrive(id, country);
  }

  @Post(":id/sync")
  @ApiOperation({ summary: "Trigger photo sync (incremental or full)" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({
    status: 200,
    description: "Sync triggered successfully",
    schema: {
      properties: {
        synced: { type: "number", description: "Total photos processed" },
        added: { type: "number", description: "Photos added" },
        removed: { type: "number", description: "Photos removed" },
        isFullSync: {
          type: "boolean",
          description: "Whether this was a full sync",
        },
        syncedAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Event not found" })
  async triggerSync(
    @GetCountry() country: Country,
    @Param("id") id: string,
    @Body() body?: TriggerSyncDto
  ) {
    if (body?.fullSync) {
      return this.eventsService.syncPhotosFromGoogleDrive(id, country);
    }
    return this.eventsService.syncPhotosIncremental(id, country);
  }

  @Get(":id/sync-status")
  @ApiOperation({ summary: "Get sync status for an event" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({
    status: 200,
    description: "Returns sync status",
    schema: {
      properties: {
        eventId: { type: "string" },
        eventName: { type: "string" },
        syncStatus: {
          type: "string",
          enum: [
            "NEVER_SYNCED",
            "SYNCING",
            "UP_TO_DATE",
            "ERROR",
            "SYNC_REQUIRED",
          ],
        },
        lastSyncedAt: { type: "string", format: "date-time", nullable: true },
        syncErrorMessage: { type: "string", nullable: true },
        hasGoogleDrive: { type: "boolean" },
        photoCount: { type: "number" },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Event not found" })
  async getSyncStatus(@GetCountry() country: Country, @Param("id") id: string) {
    return this.eventsService.getSyncStatus(id, country);
  }

  @Post(":id/create-shareable-link")
  @ApiOperation({ summary: "Create a shareable link for selected photos" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 201, description: "Shareable link created" })
  createShareableLink(
    @GetCountry() country: Country,
    @Param("id") id: string,
    @Body() body: CreateShareableLinkDto
  ) {
    return this.eventsService.createShareableLink(body.photoIds, country);
  }

  @Get(":id/google-drive-images")
  @ApiOperation({ summary: "Get images from Google Drive folder" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Returns Google Drive images" })
  async getGoogleDriveImages(
    @GetCountry() country: Country,
    @Param("id") id: string
  ) {
    return this.eventsService.getGoogleDriveImages(id, country);
  }

  @Post(":id/download-selection")
  @ApiOperation({ summary: "Create a download selection with shareable token" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 201, description: "Download selection created" })
  @ApiResponse({
    status: 400,
    description: "Either photoIds or driveFileIds must be provided",
  })
  async createDownloadSelection(
    @GetCountry() country: Country,
    @Param("id") id: string,
    @Body() body: CreateDownloadSelectionDto
  ) {
    // Support both photo IDs (from database) and direct drive file IDs
    if (body.photoIds && body.photoIds.length > 0) {
      return this.eventsService.createDownloadSelectionFromPhotos(
        id,
        body.photoIds,
        body.expirationHours,
        country,
        body.deliverables
      );
    } else if (body.driveFileIds && body.driveFileIds.length > 0) {
      return this.eventsService.createDownloadSelection(
        id,
        body.driveFileIds,
        body.expirationHours,
        country,
        body.deliverables
      );
    } else {
      throw new BadRequestException(
        "Either photoIds or driveFileIds must be provided"
      );
    }
  }

  @Get("download/:token")
  @ApiOperation({ summary: "Get download selection by token" })
  @ApiParam({ name: "token", description: "Download selection token" })
  @ApiResponse({ status: 200, description: "Returns download selection" })
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

  @Delete("download/cleanup")
  @ApiOperation({ summary: "Cleanup expired download selections" })
  @ApiResponse({ status: 200, description: "Cleanup completed" })
  async cleanupExpiredSelections() {
    return this.eventsService.cleanupExpiredSelections();
  }

  @Get("sync/pending")
  @ApiOperation({ summary: "Get all events that need syncing" })
  @ApiResponse({
    status: 200,
    description: "Returns events that require syncing",
  })
  async getPendingSyncEvents(@GetCountry() country: Country) {
    return this.eventsService.getPendingSyncEvents(country);
  }

  @Post("sync/bulk")
  @ApiOperation({ summary: "Trigger sync for all events that need it" })
  @ApiResponse({
    status: 200,
    description: "Bulk sync triggered",
    schema: {
      properties: {
        triggered: {
          type: "number",
          description: "Number of events triggered for sync",
        },
        message: { type: "string" },
      },
    },
  })
  async triggerBulkSync(@GetCountry() country: Country) {
    return this.eventsService.triggerBulkSync(country);
  }

  @Get("sync/statistics")
  @ApiOperation({ summary: "Get sync statistics across all events" })
  @ApiResponse({
    status: 200,
    description: "Returns sync statistics",
    schema: {
      properties: {
        total: { type: "number" },
        byStatus: {
          type: "object",
          properties: {
            neverSynced: { type: "number" },
            upToDate: { type: "number" },
            syncRequired: { type: "number" },
            syncing: { type: "number" },
            error: { type: "number" },
          },
        },
        totalPhotos: { type: "number" },
        lastSyncedEvent: {
          type: "object",
          nullable: true,
        },
      },
    },
  })
  async getSyncStatistics(@GetCountry() country: Country) {
    return this.eventsService.getSyncStatistics(country);
  }

  @Post(":id/regenerate-cover")
  @ApiOperation({
    summary: "Regenerate cover image for an event",
    description:
      "Manually regenerate the cover image using the first photo from the event's photo collection. Returns both Google Drive direct URL and backend proxy URL.",
  })
  @ApiParam({
    name: "id",
    description: "Event ID",
  })
  @ApiResponse({
    status: 200,
    description: "Cover image regenerated successfully",
    schema: {
      properties: {
        eventId: { type: "string" },
        generatedCoverImageUrl: {
          type: "string",
          description: "Google Drive direct URL",
        },
        generatedCoverImageProxyUrl: {
          type: "string",
          description: "Backend proxy URL",
        },
        message: { type: "string" },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Event not found" })
  @ApiResponse({
    status: 400,
    description: "No photos available to generate cover image",
  })
  async regenerateCoverImage(
    @GetCountry() country: Country,
    @Param("id") id: string
  ) {
    return this.eventsService.regenerateCoverImage(id, country);
  }

  @Get("photos/proxy/:driveFileId")
  @ApiOperation({
    summary: "Proxy endpoint to serve Google Drive images",
    description:
      "Serves images from Google Drive through the backend to avoid 403 errors. Use this endpoint for displaying photos in the frontend.",
  })
  @ApiParam({
    name: "driveFileId",
    description: "Google Drive file ID",
  })
  @ApiQuery({
    name: "size",
    required: false,
    type: Number,
    description: "Thumbnail size (e.g., 400, 800). Omit for full-size image.",
  })
  @ApiResponse({
    status: 200,
    description: "Returns the image file",
  })
  @ApiResponse({ status: 404, description: "Image not found" })
  async proxyImage(
    @Param("driveFileId") driveFileId: string,
    @Query("size") size: string,
    @Res() res: Response
  ) {
    // Parse size parameter (e.g., ?size=400, ?size=800)
    const sizeNum = size ? parseInt(size, 10) : undefined;

    const imageStream = await this.eventsService.streamPhotoFromDrive(
      driveFileId,
      sizeNum
    );

    res.setHeader("Content-Type", imageStream.mimeType);
    res.setHeader("Content-Length", imageStream.size);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    res.setHeader("Accept-Ranges", "bytes");

    imageStream.stream.pipe(res);
  }
}
