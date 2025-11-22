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
exports.BookingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const bookings_service_1 = require("./bookings.service");
const client_1 = require("@prisma/client");
const country_decorator_1 = require("../common/decorators/country.decorator");
const api_country_header_decorator_1 = require("../common/decorators/api-country-header.decorator");
const dto_1 = require("./dto");
let BookingsController = class BookingsController {
    constructor(bookingsService) {
        this.bookingsService = bookingsService;
    }
    create(country, body) {
        return this.bookingsService.create({ ...body, country });
    }
    findAll(country) {
        return this.bookingsService.findAll(country);
    }
    findOne(country, id) {
        return this.bookingsService.findOne(id, country);
    }
    update(country, id, body) {
        return this.bookingsService.update(id, body, country);
    }
    remove(country, id) {
        return this.bookingsService.remove(id, country);
    }
    assign(country, id, body) {
        return this.bookingsService.assignUsers(id, body.userIds || [], country);
    }
};
exports.BookingsController = BookingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create a new booking" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Booking created successfully" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Bad request" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateBookingDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all bookings" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Returns all bookings" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get booking by ID" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Booking ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Returns the booking" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Booking not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update a booking" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Booking ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Booking updated successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Booking not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateBookingDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete a booking" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Booking ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Booking deleted successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Booking not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(":id/assign"),
    (0, swagger_1.ApiOperation)({ summary: "Assign users to a booking" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Booking ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Users assigned successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Booking not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.AssignUsersDto]),
    __metadata("design:returntype", void 0)
], BookingsController.prototype, "assign", null);
exports.BookingsController = BookingsController = __decorate([
    (0, swagger_1.ApiTags)("bookings"),
    (0, api_country_header_decorator_1.ApiCountryHeader)(),
    (0, common_1.Controller)("bookings"),
    __metadata("design:paramtypes", [bookings_service_1.BookingsService])
], BookingsController);
//# sourceMappingURL=bookings.controller.js.map