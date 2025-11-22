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
let EventsController = class EventsController {
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    create(country, body) {
        return this.eventsService.create({ ...body, country });
    }
    findAll(country) {
        return this.eventsService.findAll(country);
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
    listPhotos(country, id) {
        return this.eventsService.listPhotos(id, country);
    }
    syncPhotosFromGoogleDrive(country, id) {
        return this.eventsService.syncPhotosFromGoogleDrive(id, country);
    }
    createShareableLink(country, id, body) {
        return this.eventsService.createShareableLink(body.photoIds, country);
    }
    async getGoogleDriveImages(country, id) {
        return this.eventsService.getGoogleDriveImages(id, country);
    }
    async createDownloadSelection(country, id, body) {
        if (body.photoIds && body.photoIds.length > 0) {
            return this.eventsService.createDownloadSelectionFromPhotos(id, body.photoIds, body.expirationHours, country);
        }
        else if (body.driveFileIds && body.driveFileIds.length > 0) {
            return this.eventsService.createDownloadSelection(id, body.driveFileIds, body.expirationHours, country);
        }
        else {
            throw new Error("Either photoIds or driveFileIds must be provided");
        }
    }
    async getDownloadSelection(country, token) {
        return this.eventsService.getDownloadSelection(token, country);
    }
    async cleanupExpiredSelections() {
        return this.eventsService.cleanupExpiredSelections();
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
    (0, swagger_1.ApiResponse)({ status: 200, description: "Returns all events" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findAll", null);
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
    (0, swagger_1.ApiResponse)({ status: 200, description: "Returns event photos" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "listPhotos", null);
__decorate([
    (0, common_1.Post)(":id/sync-google-drive"),
    (0, swagger_1.ApiOperation)({ summary: "Sync photos from Google Drive" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Event ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Photos synced successfully" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "syncPhotosFromGoogleDrive", null);
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
exports.EventsController = EventsController = __decorate([
    (0, swagger_1.ApiTags)("events"),
    (0, api_country_header_decorator_1.ApiCountryHeader)(),
    (0, common_1.Controller)("events"),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map