import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { EventsService } from "./events.service";
import { Country } from "@prisma/client";
import { GetCountry } from "../common/decorators/country.decorator";
import { ApiCountryHeader } from "../common/decorators/api-country-header.decorator";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { AddPhotosDto } from "./dto/add-photos.dto";
import { CreateShareableLinkDto } from "./dto/create-shareable-link.dto";
import { CreateDownloadSelectionDto } from "./dto/create-download-selection.dto";

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
  @ApiResponse({ status: 200, description: "Returns all events" })
  findAll(@GetCountry() country: Country) {
    return this.eventsService.findAll(country);
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
  update(@GetCountry() country: Country, @Param("id") id: string, @Body() body: UpdateEventDto) {
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
  addPhotos(@GetCountry() country: Country, @Param("id") id: string, @Body() body: AddPhotosDto) {
    return this.eventsService.addPhotos(id, body.photos || [], country);
  }

  @Get(":id/photos")
  @ApiOperation({ summary: "Get all photos for an event" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Returns event photos" })
  listPhotos(@GetCountry() country: Country, @Param("id") id: string) {
    return this.eventsService.listPhotos(id, country);
  }

  @Post(":id/sync-google-drive")
  @ApiOperation({ summary: "Sync photos from Google Drive" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Photos synced successfully" })
  syncPhotosFromGoogleDrive(@GetCountry() country: Country, @Param("id") id: string) {
    return this.eventsService.syncPhotosFromGoogleDrive(id, country);
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
  async getGoogleDriveImages(@GetCountry() country: Country, @Param("id") id: string) {
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
        country
      );
    } else if (body.driveFileIds && body.driveFileIds.length > 0) {
      return this.eventsService.createDownloadSelection(
        id,
        body.driveFileIds,
        body.expirationHours,
        country
      );
    } else {
      throw new Error("Either photoIds or driveFileIds must be provided");
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
  async getDownloadSelection(@GetCountry() country: Country, @Param("token") token: string) {
    return this.eventsService.getDownloadSelection(token, country);
  }

  @Delete("download/cleanup")
  @ApiOperation({ summary: "Cleanup expired download selections" })
  @ApiResponse({ status: 200, description: "Cleanup completed" })
  async cleanupExpiredSelections() {
    return this.eventsService.cleanupExpiredSelections();
  }
}
