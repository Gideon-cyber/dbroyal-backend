import { Controller, Get, UseGuards, Query } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetCountry } from "../common/decorators/country.decorator";
import { Country } from "@prisma/client";
import { ApiCountryHeader } from "../common/decorators/api-country-header.decorator";

@ApiTags("Dashboard")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("metrics")
  @ApiCountryHeader()
  @ApiOperation({
    summary: "Get dashboard metrics",
    description:
      "Returns key metrics including total earnings, bookings, pending approvals, and team members with month-over-month comparison",
  })
  async getMetrics(@GetCountry() country?: Country) {
    return this.dashboardService.getDashboardMetrics(country);
  }

  @Get("recent-bookings")
  @ApiCountryHeader()
  @ApiOperation({
    summary: "Get recent bookings",
    description:
      "Returns the most recent bookings with client, event, and assigned team member details",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of bookings to return (default: 10)",
  })
  async getRecentBookings(
    @GetCountry() country?: Country,
    @Query("limit") limit?: string
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getRecentBookings(country, parsedLimit);
  }

  @Get("bookings-by-status")
  @ApiCountryHeader()
  @ApiOperation({
    summary: "Get bookings grouped by status",
    description:
      "Returns count of bookings by status (scheduled, completed, canceled)",
  })
  async getBookingsByStatus(@GetCountry() country?: Country) {
    return this.dashboardService.getBookingsByStatus(country);
  }

  @Get("monthly-trend")
  @ApiCountryHeader()
  @ApiOperation({
    summary: "Get monthly earnings and bookings trend",
    description: "Returns earnings and booking counts for the last N months",
  })
  @ApiQuery({
    name: "months",
    required: false,
    type: Number,
    description: "Number of months to return (default: 6)",
  })
  async getMonthlyTrend(
    @GetCountry() country?: Country,
    @Query("months") months?: string
  ) {
    const parsedMonths = months ? parseInt(months, 10) : 6;
    return this.dashboardService.getMonthlyEarningsTrend(country, parsedMonths);
  }

  @Get("pending-approvals")
  @ApiCountryHeader()
  @ApiOperation({
    summary: "Get pending approval bookings",
    description:
      "Returns bookings awaiting approval with client and event details. Filter by date range using startDate and endDate.",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of bookings to return (default: 10)",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    description:
      "Filter bookings from this date (ISO 8601 format, e.g., 2025-11-01)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    description:
      "Filter bookings until this date (ISO 8601 format, e.g., 2025-11-30)",
  })
  async getPendingApprovals(
    @GetCountry() country?: Country,
    @Query("limit") limit?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.dashboardService.getPendingApprovals(
      country,
      parsedLimit,
      startDate,
      endDate
    );
  }

  @Get("recent-uploads")
  @ApiCountryHeader()
  @ApiOperation({
    summary: "Get recent photo uploads",
    description:
      "Returns events with photos uploaded today, including upload status and photo counts",
  })
  async getRecentUploads(@GetCountry() country?: Country) {
    return this.dashboardService.getRecentUploads(country);
  }

  @Get("upcoming-bookings")
  @ApiCountryHeader()
  @ApiOperation({
    summary: "Get upcoming confirmed bookings",
    description:
      "Returns next confirmed booking sessions with client, location, and assigned team members",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of bookings to return (default: 10)",
  })
  async getUpcomingBookings(
    @GetCountry() country?: Country,
    @Query("limit") limit?: string
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 3;
    return this.dashboardService.getUpcomingBookings(country, parsedLimit);
  }
}
