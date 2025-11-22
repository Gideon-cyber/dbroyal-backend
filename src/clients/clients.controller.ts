import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { ClientsService } from "./clients.service";
import { CreateClientDto, UpdateClientDto } from "./dto";
import { Country } from "@prisma/client";
import { GetCountry } from "../common/decorators/country.decorator";
import { ApiCountryHeader } from "../common/decorators/api-country-header.decorator";

@ApiTags("clients")
@ApiCountryHeader()
@Controller("clients")
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new client" })
  @ApiResponse({ status: 201, description: "Client created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(@GetCountry() country: Country, @Body() body: CreateClientDto) {
    return this.clientsService.create({ ...body, country });
  }

  @Get()
  @ApiOperation({ summary: "Get all clients" })
  @ApiResponse({ status: 200, description: "Returns all clients" })
  findAll(@GetCountry() country: Country) {
    return this.clientsService.findAll(country);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get client by ID" })
  @ApiParam({ name: "id", description: "Client ID" })
  @ApiResponse({ status: 200, description: "Returns the client" })
  @ApiResponse({ status: 404, description: "Client not found" })
  findOne(@GetCountry() country: Country, @Param("id") id: string) {
    return this.clientsService.findOne(id, country);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a client" })
  @ApiParam({ name: "id", description: "Client ID" })
  @ApiResponse({ status: 200, description: "Client updated successfully" })
  @ApiResponse({ status: 404, description: "Client not found" })
  update(@GetCountry() country: Country, @Param("id") id: string, @Body() body: UpdateClientDto) {
    return this.clientsService.update(id, body, country);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a client" })
  @ApiParam({ name: "id", description: "Client ID" })
  @ApiResponse({ status: 200, description: "Client deleted successfully" })
  @ApiResponse({ status: 404, description: "Client not found" })
  remove(@GetCountry() country: Country, @Param("id") id: string) {
    return this.clientsService.remove(id, country);
  }
}
