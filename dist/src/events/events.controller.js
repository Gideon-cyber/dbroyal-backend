"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const events_service_1 = require("./events.service");
const client_1 = require("@prisma/client");
const country_decorator_1 = require("../common/decorators/country.decorator");
const api_country_header_decorator_1 = require("../common/decorators/api-country-header.decorator");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const add_photos_dto_1 = require("./dto/add-photos.dto");
const create_shareable_link_dto_1 = require("./dto/create-shareable-link.dto");
const create_download_selection_dto_1 = require("./dto/create-download-selection.dto");
const trigger_sync_dto_1 = require("./dto/trigger-sync.dto");
let EventsController = class EventsController {
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    create(country, body) {
        return this.eventsService.create({ ...body, country });
    }
    findAll(country, serviceId, page, limit) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.eventsService.findAll(country, serviceId, pageNum, limitNum);
    }
    findByService(country, serviceId, page, limit, sortBy, sortOrder) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.eventsService.findByService(serviceId, country, pageNum, limitNum, sortBy, sortOrder);
    }
    findOne(country, id) {
        return this.eventsService.findOne(id, country);
    }
    update(country, id, body) {
        return this.eventsService.update(id, body, country);
    }
    remove(country, id) {
        return this.eventsService.remove(id, country);
    }
    addPhotos(country, id, body) {
        return this.eventsService.addPhotos(id, body.photos || [], country);
    }
    listPhotos(country, id, page, limit) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return this.eventsService.listPhotos(id, country, pageNum, limitNum);
    }
    syncPhotosFromGoogleDrive(country, id) {
        return this.eventsService.syncPhotosFromGoogleDrive(id, country);
    }
    async triggerSync(country, id, body) {
        if (body?.fullSync) {
            return this.eventsService.syncPhotosFromGoogleDrive(id, country);
        }
        return this.eventsService.syncPhotosIncremental(id, country);
    }
    async getSyncStatus(country, id) {
        return this.eventsService.getSyncStatus(id, country);
    }
    createShareableLink(country, id, body) {
        return this.eventsService.createShareableLink(body.photoIds, country);
    }
    async getGoogleDriveImages(country, id) {
        return this.eventsService.getGoogleDriveImages(id, country);
    }
    async createDownloadSelection(country, id, body) {
        if (body.photoIds && body.photoIds.length > 0) {
            return this.eventsService.createDownloadSelectionFromPhotos(id, body.photoIds, body.expirationHours, country, body.deliverables);
        }
        else if (body.driveFileIds && body.driveFileIds.length > 0) {
            return this.eventsService.createDownloadSelection(id, body.driveFileIds, body.expirationHours, country, body.deliverables);
        }
        else {
            throw new common_1.BadRequestException("Either photoIds or driveFileIds must be provided");
        }
    }
    async getDownloadSelection(country, token) {
        return this.eventsService.getDownloadSelection(token, country);
    }
    async cleanupExpiredSelections() {
        return this.eventsService.cleanupExpiredSelections();
    }
    async getPendingSyncEvents(country) {
        return this.eventsService.getPendingSyncEvents(country);
    }
    async triggerBulkSync(country) {
        return this.eventsService.triggerBulkSync(country);
    }
    async getSyncStatistics(country) {
        return this.eventsService.getSyncStatistics(country);
    }
    async proxyImage(driveFileId, size, res) {
        const sizeNum = size ? parseInt(size, 10) : undefined;
        const imageStream = await this.eventsService.streamPhotoFromDrive(driveFileId, sizeNum);
        res.setHeader("Content-Type", imageStream.mimeType);
        res.setHeader("Content-Length", imageStream.size);
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.setHeader("Accept-Ranges", "bytes");
        imageStream.stream.pipe(res);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create a new event" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Event created successfully" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Bad request" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all events" }),
    (0, swagger_1.ApiQuery)({
        name: "serviceId",
        required: false,
        type: String,
        description: "Filter by service ID",
    }),
    (0, swagger_1.ApiQuery)({
        name: "page",
        required: false,
        type: Number,
        description: "Page number (default: 1)",
    }),
    (0, swagger_1.ApiQuery)({
        name: "limit",
        required: false,
        type: Number,
        description: "Items per page (default: 10)",
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Query)("serviceId")),
    __param(2, (0, common_1.Query)("page")),
    __param(3, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("service/:serviceId"),
    (0, swagger_1.ApiOperation)({ summary: "Get events by service" }),
    (0, swagger_1.ApiParam)({
        name: "serviceId",
        description: "Service ID",
    }),
    (0, swagger_1.ApiQuery)({
        name: "page",
        required: false,
        type: Number,
        description: "Page number (default: 1)",
    }),
    (0, swagger_1.ApiQuery)({
        name: "limit",
        required: false,
        type: Number,
        description: "Items per page (default: 10)",
    }),
    (0, swagger_1.ApiQuery)({
        name: "sortBy",
        required: false,
        type: String,
        description: "Field to sort by (default: createdAt). Options: name, date, createdAt",
    }),
    (0, swagger_1.ApiQuery)({
        name: "sortOrder",
        required: false,
        type: String,
        description: "Sort order (default: desc). Options: asc, desc",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Returns events for the specified service",
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Invalid service ID" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("serviceId")),
    __param(2, (0, common_1.Query)("page")),
    __param(3, (0, common_1.Query)("limit")),
    __param(4, (0, common_1.Query)("sortBy")),
    __param(5, (0, common_1.Query)("sortOrder")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findByService", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get event by ID" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Event ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Returns the event" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Event not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update an event" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Event ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Event updated successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Event not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete an event" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Event ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Event deleted successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Event not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(":id/photos"),
    (0, swagger_1.ApiOperation)({ summary: "Add photos to an event" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Event ID" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Photos added successfully" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, add_photos_dto_1.AddPhotosDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "addPhotos", null);
__decorate([
    (0, common_1.Get)(":id/photos"),
    (0, swagger_1.ApiOperation)({ summary: "Get all photos for an event" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Event ID" }),
    (0, swagger_1.ApiQuery)({
        name: "page",
        required: false,
        type: Number,
        description: "Page number (default: 1)",
    }),
    (0, swagger_1.ApiQuery)({
        name: "limit",
        required: false,
        type: Number,
        description: "Items per page (default: 20)",
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Query)("page")),
    __param(3, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "listPhotos", null);
__decorate([
    (0, common_1.Post)(":id/sync-google-drive"),
    (0, swagger_1.ApiOperation)({ summary: "Sync photos from Google Drive (full sync)" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Event ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Photos synced successfully" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "syncPhotosFromGoogleDrive", null);
__decorate([
    (0, common_1.Post)(":id/sync"),
    (0, swagger_1.ApiOperation)({ summary: "Trigger photo sync (incremental or full)" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Event ID" }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Event not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, trigger_sync_dto_1.TriggerSyncDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "triggerSync", null);
__decorate([
    (0, common_1.Get)(":id/sync-status"),
    (0, swagger_1.ApiOperation)({ summary: "Get sync status for an event" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Event ID" }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Event not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getSyncStatus", null);
__decorate([
    (0, common_1.Post)(":id/create-shareable-link"),
    (0, swagger_1.ApiOperation)({ summary: "Create a shareable link for selected photos" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Event ID" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Shareable link created" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_shareable_link_dto_1.CreateShareableLinkDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "createShareableLink", null);
__decorate([
    (0, common_1.Get)(":id/google-drive-images"),
    (0, swagger_1.ApiOperation)({ summary: "Get images from Google Drive folder" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Event ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Returns Google Drive images" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getGoogleDriveImages", null);
__decorate([
    (0, common_1.Post)(":id/download-selection"),
    (0, swagger_1.ApiOperation)({ summary: "Create a download selection with shareable token" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Event ID" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Download selection created" }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Either photoIds or driveFileIds must be provided",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_download_selection_dto_1.CreateDownloadSelectionDto]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "createDownloadSelection", null);
__decorate([
    (0, common_1.Get)("download/:token"),
    (0, swagger_1.ApiOperation)({ summary: "Get download selection by token" }),
    (0, swagger_1.ApiParam)({ name: "token", description: "Download selection token" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Returns download selection" }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Download selection not found or expired",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getDownloadSelection", null);
__decorate([
    (0, common_1.Delete)("download/cleanup"),
    (0, swagger_1.ApiOperation)({ summary: "Cleanup expired download selections" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Cleanup completed" }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "cleanupExpiredSelections", null);
__decorate([
    (0, common_1.Get)("sync/pending"),
    (0, swagger_1.ApiOperation)({ summary: "Get all events that need syncing" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Returns events that require syncing",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getPendingSyncEvents", null);
__decorate([
    (0, common_1.Post)("sync/bulk"),
    (0, swagger_1.ApiOperation)({ summary: "Trigger sync for all events that need it" }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "triggerBulkSync", null);
__decorate([
    (0, common_1.Get)("sync/statistics"),
    (0, swagger_1.ApiOperation)({ summary: "Get sync statistics across all events" }),
    (0, swagger_1.ApiResponse)({
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
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getSyncStatistics", null);
__decorate([
    (0, common_1.Get)("photos/proxy/:driveFileId"),
    (0, swagger_1.ApiOperation)({
        summary: "Proxy endpoint to serve Google Drive images",
        description: "Serves images from Google Drive through the backend to avoid 403 errors. Use this endpoint for displaying photos in the frontend.",
    }),
    (0, swagger_1.ApiParam)({
        name: "driveFileId",
        description: "Google Drive file ID",
    }),
    (0, swagger_1.ApiQuery)({
        name: "size",
        required: false,
        type: Number,
        description: "Thumbnail size (e.g., 400, 800). Omit for full-size image.",
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Returns the image file",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Image not found" }),
    __param(0, (0, common_1.Param)("driveFileId")),
    __param(1, (0, common_1.Query)("size")),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "proxyImage", null);
exports.EventsController = EventsController = __decorate([
    (0, swagger_1.ApiTags)("events"),
    (0, api_country_header_decorator_1.ApiCountryHeader)(),
    (0, common_1.Controller)("events"),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map