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
exports.CreateDownloadSelectionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateDownloadSelectionDto {
}
exports.CreateDownloadSelectionDto = CreateDownloadSelectionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Array of photo IDs from database",
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)("4", { each: true }),
    __metadata("design:type", Array)
], CreateDownloadSelectionDto.prototype, "photoIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Array of Google Drive file IDs",
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateDownloadSelectionDto.prototype, "driveFileIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Number of hours until the download link expires",
        minimum: 1,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateDownloadSelectionDto.prototype, "expirationHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: "Description of deliverables (e.g., 'Digital Downloads', 'Printed Photos')",
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDownloadSelectionDto.prototype, "deliverables", void 0);
//# sourceMappingURL=create-download-selection.dto.js.map