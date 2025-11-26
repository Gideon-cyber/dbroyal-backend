import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ServicesService } from "./services.service";
import { CreateServiceDto, UpdateServiceDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { GetCountry } from "../common/decorators/country.decorator";
import { Country } from "@prisma/client";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";

@ApiTags("services")
@Controller("services")
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a new service" })
  @ApiResponse({ status: 201, description: "Service created successfully" })
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all services" })
  @ApiResponse({ status: 200, description: "Services retrieved successfully" })
  findAll(
    @GetCountry() country: Country,
    @Query("isVisible") isVisible?: string
  ) {
    const isVisibleBool =
      isVisible === "true" ? true : isVisible === "false" ? false : undefined;
    return this.servicesService.findAll(country, isVisibleBool);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a service by ID" })
  @ApiResponse({ status: 200, description: "Service retrieved successfully" })
  @ApiResponse({ status: 404, description: "Service not found" })
  findOne(@Param("id") id: string, @GetCountry() country: Country) {
    return this.servicesService.findOne(id, country);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a service" })
  @ApiResponse({ status: 200, description: "Service updated successfully" })
  @ApiResponse({ status: 404, description: "Service not found" })
  update(@Param("id") id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a service" })
  @ApiResponse({ status: 200, description: "Service deleted successfully" })
  @ApiResponse({ status: 404, description: "Service not found" })
  remove(@Param("id") id: string) {
    return this.servicesService.remove(id);
  }

  @Patch(":id/toggle-visibility")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Toggle service visibility" })
  @ApiResponse({
    status: 200,
    description: "Service visibility toggled successfully",
  })
  @ApiResponse({ status: 404, description: "Service not found" })
  toggleVisibility(@Param("id") id: string) {
    return this.servicesService.toggleVisibility(id);
  }

  // Package Endpoints
  @Post(":id/packages")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a package for a service" })
  @ApiResponse({ status: 201, description: "Package created successfully" })
  createPackage(@Param("id") serviceId: string, @Body() createPackageDto: any) {
    return this.servicesService.createPackage(serviceId, createPackageDto);
  }

  @Get("packages/:packageId")
  @ApiOperation({ summary: "Get a package by ID" })
  @ApiResponse({ status: 200, description: "Package retrieved successfully" })
  @ApiResponse({ status: 404, description: "Package not found" })
  findPackage(
    @Param("packageId") packageId: string,
    @GetCountry() country: Country
  ) {
    return this.servicesService.findPackage(packageId, country);
  }

  @Patch("packages/:packageId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a package" })
  @ApiResponse({ status: 200, description: "Package updated successfully" })
  @ApiResponse({ status: 404, description: "Package not found" })
  updatePackage(
    @Param("packageId") packageId: string,
    @Body() updatePackageDto: any
  ) {
    return this.servicesService.updatePackage(packageId, updatePackageDto);
  }

  @Delete("packages/:packageId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a package" })
  @ApiResponse({ status: 200, description: "Package deleted successfully" })
  @ApiResponse({ status: 404, description: "Package not found" })
  removePackage(@Param("packageId") packageId: string) {
    return this.servicesService.removePackage(packageId);
  }

  @Patch("packages/:packageId/toggle-visibility")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Toggle package visibility" })
  @ApiResponse({
    status: 200,
    description: "Package visibility toggled successfully",
  })
  @ApiResponse({ status: 404, description: "Package not found" })
  togglePackageVisibility(@Param("packageId") packageId: string) {
    return this.servicesService.togglePackageVisibility(packageId);
  }
}
