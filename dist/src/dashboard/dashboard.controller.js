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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dashboard_service_1 = require("./dashboard.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const country_decorator_1 = require("../common/decorators/country.decorator");
const client_1 = require("@prisma/client");
const api_country_header_decorator_1 = require("../common/decorators/api-country-header.decorator");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getMetrics(country) {
        return this.dashboardService.getDashboardMetrics(country);
    }
    async getRecentBookings(country, limit) {
        const parsedLimit = limit ? parseInt(limit, 10) : 10;
        return this.dashboardService.getRecentBookings(country, parsedLimit);
    }
    async getBookingsByStatus(country) {
        return this.dashboardService.getBookingsByStatus(country);
    }
    async getMonthlyTrend(country, months) {
        const parsedMonths = months ? parseInt(months, 10) : 6;
        return this.dashboardService.getMonthlyEarningsTrend(country, parsedMonths);
    }
    async getPendingApprovals(country, limit, startDate, endDate) {
        const parsedLimit = limit ? parseInt(limit, 10) : 10;
        return this.dashboardService.getPendingApprovals(country, parsedLimit, startDate, endDate);
    }
    async getRecentUploads(country) {
        return this.dashboardService.getRecentUploads(country);
    }
    async getUpcomingBookings(country, limit) {
        const parsedLimit = limit ? parseInt(limit, 10) : 3;
        return this.dashboardService.getUpcomingBookings(country, parsedLimit);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)("metrics"),
    (0, api_country_header_decorator_1.ApiCountryHeader)(),
    (0, swagger_1.ApiOperation)({
        summary: "Get dashboard metrics",
        description: "Returns key metrics including total earnings, bookings, pending approvals, and team members with month-over-month comparison",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)("recent-bookings"),
    (0, api_country_header_decorator_1.ApiCountryHeader)(),
    (0, swagger_1.ApiOperation)({
        summary: "Get recent bookings",
        description: "Returns the most recent bookings with client, event, and assigned team member details",
    }),
    (0, swagger_1.ApiQuery)({
        name: "limit",
        required: false,
        type: Number,
        description: "Number of bookings to return (default: 10)",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRecentBookings", null);
__decorate([
    (0, common_1.Get)("bookings-by-status"),
    (0, api_country_header_decorator_1.ApiCountryHeader)(),
    (0, swagger_1.ApiOperation)({
        summary: "Get bookings grouped by status",
        description: "Returns count of bookings by status (scheduled, completed, canceled)",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getBookingsByStatus", null);
__decorate([
    (0, common_1.Get)("monthly-trend"),
    (0, api_country_header_decorator_1.ApiCountryHeader)(),
    (0, swagger_1.ApiOperation)({
        summary: "Get monthly earnings and bookings trend",
        description: "Returns earnings and booking counts for the last N months",
    }),
    (0, swagger_1.ApiQuery)({
        name: "months",
        required: false,
        type: Number,
        description: "Number of months to return (default: 6)",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Query)("months")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getMonthlyTrend", null);
__decorate([
    (0, common_1.Get)("pending-approvals"),
    (0, api_country_header_decorator_1.ApiCountryHeader)(),
    (0, swagger_1.ApiOperation)({
        summary: "Get pending approval bookings",
        description: "Returns bookings awaiting approval with client and event details. Filter by date range using startDate and endDate.",
    }),
    (0, swagger_1.ApiQuery)({
        name: "limit",
        required: false,
        type: Number,
        description: "Number of bookings to return (default: 10)",
    }),
    (0, swagger_1.ApiQuery)({
        name: "startDate",
        required: false,
        type: String,
        description: "Filter bookings from this date (ISO 8601 format, e.g., 2025-11-01)",
    }),
    (0, swagger_1.ApiQuery)({
        name: "endDate",
        required: false,
        type: String,
        description: "Filter bookings until this date (ISO 8601 format, e.g., 2025-11-30)",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Query)("limit")),
    __param(2, (0, common_1.Query)("startDate")),
    __param(3, (0, common_1.Query)("endDate")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getPendingApprovals", null);
__decorate([
    (0, common_1.Get)("recent-uploads"),
    (0, api_country_header_decorator_1.ApiCountryHeader)(),
    (0, swagger_1.ApiOperation)({
        summary: "Get recent photo uploads",
        description: "Returns events with photos uploaded today, including upload status and photo counts",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getRecentUploads", null);
__decorate([
    (0, common_1.Get)("upcoming-bookings"),
    (0, api_country_header_decorator_1.ApiCountryHeader)(),
    (0, swagger_1.ApiOperation)({
        summary: "Get upcoming confirmed bookings",
        description: "Returns next confirmed booking sessions with client, location, and assigned team members",
    }),
    (0, swagger_1.ApiQuery)({
        name: "limit",
        required: false,
        type: Number,
        description: "Number of bookings to return (default: 10)",
    }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Query)("limit")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getUpcomingBookings", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)("Dashboard"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("dashboard"),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map