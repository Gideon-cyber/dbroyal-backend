import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { BookingsService } from "./bookings.service";
import { Country } from "@prisma/client";
import { GetCountry } from "../common/decorators/country.decorator";
import { ApiCountryHeader } from "../common/decorators/api-country-header.decorator";
import { CreateBookingDto, UpdateBookingDto, AssignUsersDto } from "./dto";

@ApiTags("bookings")
@ApiCountryHeader()
@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new booking" })
  @ApiResponse({ status: 201, description: "Booking created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(@GetCountry() country: Country, @Body() body: CreateBookingDto) {
    return this.bookingsService.create({ ...body, country });
  }

  @Get()
  @ApiOperation({ summary: "Get all bookings" })
  @ApiResponse({ status: 200, description: "Returns all bookings" })
  findAll(
    @GetCountry() country: Country,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    return this.bookingsService.findAll(country, startDate, endDate);
  }

  @Get("metrics")
  @ApiOperation({ summary: "Get booking dashboard metrics" })
  @ApiResponse({
    status: 200,
    description:
      "Returns booking metrics including pending, approved, and rejected counts",
  })
  getMetrics(@GetCountry() country: Country) {
    return this.bookingsService.getBookingMetrics(country);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get booking by ID" })
  @ApiParam({ name: "id", description: "Booking ID" })
  @ApiResponse({ status: 200, description: "Returns the booking" })
  @ApiResponse({ status: 404, description: "Booking not found" })
  findOne(@GetCountry() country: Country, @Param("id") id: string) {
    return this.bookingsService.findOne(id, country);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a booking" })
  @ApiParam({ name: "id", description: "Booking ID" })
  @ApiResponse({ status: 200, description: "Booking updated successfully" })
  @ApiResponse({ status: 404, description: "Booking not found" })
  update(
    @GetCountry() country: Country,
    @Param("id") id: string,
    @Body() body: UpdateBookingDto
  ) {
    return this.bookingsService.update(id, body, country);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a booking" })
  @ApiParam({ name: "id", description: "Booking ID" })
  @ApiResponse({ status: 200, description: "Booking deleted successfully" })
  @ApiResponse({ status: 404, description: "Booking not found" })
  remove(@GetCountry() country: Country, @Param("id") id: string) {
    return this.bookingsService.remove(id, country);
  }

  @Post(":id/assign")
  @ApiOperation({ summary: "Assign users to a booking" })
  @ApiParam({ name: "id", description: "Booking ID" })
  @ApiResponse({ status: 200, description: "Users assigned successfully" })
  @ApiResponse({ status: 404, description: "Booking not found" })
  assign(
    @GetCountry() country: Country,
    @Param("id") id: string,
    @Body() body: AssignUsersDto
  ) {
    return this.bookingsService.assignUsers(id, body.userIds || [], country);
  }
}
