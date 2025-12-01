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
exports.DownloadController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const events_service_1 = require("./events.service");
const google_drive_service_1 = require("../google-drive/google-drive.service");
const archiver_1 = require("archiver");
const client_1 = require("@prisma/client");
const country_decorator_1 = require("../common/decorators/country.decorator");
const api_country_header_decorator_1 = require("../common/decorators/api-country-header.decorator");
const dto_1 = require("./dto");
let DownloadController = class DownloadController {
    constructor(eventsService, googleDriveService) {
        this.eventsService = eventsService;
        this.googleDriveService = googleDriveService;
    }
    async getDownloadSelection(country, token) {
        return this.eventsService.getDownloadSelection(token, country);
    }
    async downloadAsZip(country, token, res) {
        const selection = await this.eventsService.getDownloadSelection(token, country);
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="${selection.event.name}-photos.zip"`);
        const archive = (0, archiver_1.default)("zip", {
            zlib: { level: 9 },
        });
        archive.pipe(res);
        for (const image of selection.images) {
            try {
                const { buffer, filename } = await this.googleDriveService.downloadFileAsBuffer(image.id);
                archive.append(buffer, { name: filename });
            }
            catch (error) {
                console.error(`Failed to download file ${image.id}:`, error.message);
            }
        }
        await archive.finalize();
    }
    async listDownloadRequests(country, filters) {
        return this.eventsService.listDownloadRequests({ ...filters, country });
    }
    async getDownloadRequestStats(country) {
        return this.eventsService.getDownloadRequestStats(country);
    }
    async updateDownloadStatus(country, id, updateDto) {
        return this.eventsService.updateDownloadStatus(id, updateDto.status, {
            rejectionReason: updateDto.rejectionReason,
            approvedBy: updateDto.approvedBy,
            country,
        });
    }
    async approveDownloadRequest(country, id, approvedBy) {
        return this.eventsService.approveDownloadRequest(id, approvedBy, country);
    }
    async rejectDownloadRequest(country, id, rejectionReason) {
        if (!rejectionReason) {
            throw new common_1.BadRequestException("Rejection reason is required");
        }
        return this.eventsService.rejectDownloadRequest(id, rejectionReason, country);
    }
};
exports.DownloadController = DownloadController;
__decorate([
    (0, common_1.Get)(":token"),
    (0, swagger_1.ApiOperation)({ summary: "View download selection details" }),
    (0, swagger_1.ApiParam)({ name: "token", description: "Download selection token" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Returns download selection details",
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Download selection not found or expired",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DownloadController.prototype, "getDownloadSelection", null);
__decorate([
    (0, common_1.Get)(":token/zip"),
    (0, swagger_1.ApiOperation)({ summary: "Download selected photos as ZIP file" }),
    (0, swagger_1.ApiParam)({ name: "token", description: "Download selection token" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Returns ZIP file containing selected photos",
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Download selection not found or expired",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("token")),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], DownloadController.prototype, "downloadAsZip", null);
__decorate([
    (0, common_1.Get)("requests/list"),
    (0, swagger_1.ApiOperation)({ summary: "List all download requests with filters" }),
    (0, swagger_1.ApiQuery)({
        name: "status",
        required: false,
        enum: [
            "PENDING_PAYMENT",
            "PENDING_APPROVAL",
            "PROCESSING_DELIVERY",
            "SHIPPED",
            "REJECTED",
        ],
    }),
    (0, swagger_1.ApiQuery)({ name: "eventId", required: false }),
    (0, swagger_1.ApiQuery)({ name: "startDate", required: false }),
    (0, swagger_1.ApiQuery)({ name: "endDate", required: false }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Returns list of download requests",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ListDownloadRequestsDto]),
    __metadata("design:returntype", Promise)
], DownloadController.prototype, "listDownloadRequests", null);
__decorate([
    (0, common_1.Get)("requests/stats"),
    (0, swagger_1.ApiOperation)({ summary: "Get download request statistics" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Returns statistics about download requests",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DownloadController.prototype, "getDownloadRequestStats", null);
__decorate([
    (0, common_1.Patch)("requests/:id/status"),
    (0, swagger_1.ApiOperation)({ summary: "Update download request status" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Download request ID" }),
    (0, swagger_1.ApiBody)({ type: dto_1.UpdateDownloadStatusDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Download request status updated successfully",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Download request not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateDownloadStatusDto]),
    __metadata("design:returntype", Promise)
], DownloadController.prototype, "updateDownloadStatus", null);
__decorate([
    (0, common_1.Post)("requests/:id/approve"),
    (0, swagger_1.ApiOperation)({ summary: "Approve a download request" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Download request ID" }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                approvedBy: { type: "string", description: "User ID who approved" },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Download request approved successfully",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Download request not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)("approvedBy")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DownloadController.prototype, "approveDownloadRequest", null);
__decorate([
    (0, common_1.Post)("requests/:id/reject"),
    (0, swagger_1.ApiOperation)({ summary: "Reject a download request" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Download request ID" }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Download request rejected successfully",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Download request not found" }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: "Rejection reason is required",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)("rejectionReason")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DownloadController.prototype, "rejectDownloadRequest", null);
exports.DownloadController = DownloadController = __decorate([
    (0, swagger_1.ApiTags)("download"),
    (0, api_country_header_decorator_1.ApiCountryHeader)(),
    (0, common_1.Controller)("download"),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        google_drive_service_1.GoogleDriveService])
], DownloadController);
//# sourceMappingURL=download.controller.js.map