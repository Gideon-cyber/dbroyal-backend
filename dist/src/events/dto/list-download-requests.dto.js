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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListDownloadRequestsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const update_download_status_dto_1 = require("./update-download-status.dto");
class ListDownloadRequestsDto {
}
exports.ListDownloadRequestsDto = ListDownloadRequestsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: update_download_status_dto_1.DeliveryStatus,
        description: "Filter by delivery status",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(update_download_status_dto_1.DeliveryStatus),
    __metadata("design:type", String)
], ListDownloadRequestsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Filter by event ID",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListDownloadRequestsDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Filter by start date (ISO format)",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ListDownloadRequestsDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Filter by end date (ISO format)",
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ListDownloadRequestsDto.prototype, "endDate", void 0);
//# sourceMappingURL=list-download-requests.dto.js.map