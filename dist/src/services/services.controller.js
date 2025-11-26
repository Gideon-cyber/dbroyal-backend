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
exports.ServicesController = void 0;
const common_1 = require("@nestjs/common");
const services_service_1 = require("./services.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const country_decorator_1 = require("../common/decorators/country.decorator");
const client_1 = require("@prisma/client");
const swagger_1 = require("@nestjs/swagger");
let ServicesController = class ServicesController {
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    create(createServiceDto) {
        return this.servicesService.create(createServiceDto);
    }
    findAll(country, isVisible) {
        const isVisibleBool = isVisible === "true" ? true : isVisible === "false" ? false : undefined;
        return this.servicesService.findAll(country, isVisibleBool);
    }
    findOne(id, country) {
        return this.servicesService.findOne(id, country);
    }
    update(id, updateServiceDto) {
        return this.servicesService.update(id, updateServiceDto);
    }
    remove(id) {
        return this.servicesService.remove(id);
    }
    toggleVisibility(id) {
        return this.servicesService.toggleVisibility(id);
    }
    createPackage(serviceId, createPackageDto) {
        return this.servicesService.createPackage(serviceId, createPackageDto);
    }
    findPackage(packageId, country) {
        return this.servicesService.findPackage(packageId, country);
    }
    updatePackage(packageId, updatePackageDto) {
        return this.servicesService.updatePackage(packageId, updatePackageDto);
    }
    removePackage(packageId) {
        return this.servicesService.removePackage(packageId);
    }
    togglePackageVisibility(packageId) {
        return this.servicesService.togglePackageVisibility(packageId);
    }
};
exports.ServicesController = ServicesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Create a new service" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Service created successfully" }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateServiceDto]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all services" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Services retrieved successfully" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Query)("isVisible")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get a service by ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Service retrieved successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Service not found" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, country_decorator_1.GetCountry)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Update a service" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Service updated successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Service not found" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateServiceDto]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Delete a service" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Service deleted successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Service not found" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(":id/toggle-visibility"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Toggle service visibility" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Service visibility toggled successfully",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Service not found" }),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "toggleVisibility", null);
__decorate([
    (0, common_1.Post)(":id/packages"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Create a package for a service" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Package created successfully" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "createPackage", null);
__decorate([
    (0, common_1.Get)("packages/:packageId"),
    (0, swagger_1.ApiOperation)({ summary: "Get a package by ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Package retrieved successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Package not found" }),
    __param(0, (0, common_1.Param)("packageId")),
    __param(1, (0, country_decorator_1.GetCountry)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "findPackage", null);
__decorate([
    (0, common_1.Patch)("packages/:packageId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Update a package" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Package updated successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Package not found" }),
    __param(0, (0, common_1.Param)("packageId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "updatePackage", null);
__decorate([
    (0, common_1.Delete)("packages/:packageId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Delete a package" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Package deleted successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Package not found" }),
    __param(0, (0, common_1.Param)("packageId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "removePackage", null);
__decorate([
    (0, common_1.Patch)("packages/:packageId/toggle-visibility"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: "Toggle package visibility" }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Package visibility toggled successfully",
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Package not found" }),
    __param(0, (0, common_1.Param)("packageId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ServicesController.prototype, "togglePackageVisibility", null);
exports.ServicesController = ServicesController = __decorate([
    (0, swagger_1.ApiTags)("services"),
    (0, common_1.Controller)("services"),
    __metadata("design:paramtypes", [services_service_1.ServicesService])
], ServicesController);
//# sourceMappingURL=services.controller.js.map