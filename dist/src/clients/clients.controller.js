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
exports.ClientsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const clients_service_1 = require("./clients.service");
const dto_1 = require("./dto");
const client_1 = require("@prisma/client");
const country_decorator_1 = require("../common/decorators/country.decorator");
const api_country_header_decorator_1 = require("../common/decorators/api-country-header.decorator");
let ClientsController = class ClientsController {
    constructor(clientsService) {
        this.clientsService = clientsService;
    }
    create(country, body) {
        return this.clientsService.create({ ...body, country });
    }
    findAll(country) {
        return this.clientsService.findAll(country);
    }
    findOne(country, id) {
        return this.clientsService.findOne(id, country);
    }
    update(country, id, body) {
        return this.clientsService.update(id, body, country);
    }
    remove(country, id) {
        return this.clientsService.remove(id, country);
    }
};
exports.ClientsController = ClientsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create a new client" }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Client created successfully" }),
    (0, swagger_1.ApiResponse)({ status: 400, description: "Bad request" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateClientDto]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get all clients" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Returns all clients" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Get client by ID" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Client ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Returns the client" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Client not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Update a client" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Client ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Client updated successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Client not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateClientDto]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Delete a client" }),
    (0, swagger_1.ApiParam)({ name: "id", description: "Client ID" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Client deleted successfully" }),
    (0, swagger_1.ApiResponse)({ status: 404, description: "Client not found" }),
    __param(0, (0, country_decorator_1.GetCountry)()),
    __param(1, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ClientsController.prototype, "remove", null);
exports.ClientsController = ClientsController = __decorate([
    (0, swagger_1.ApiTags)("clients"),
    (0, api_country_header_decorator_1.ApiCountryHeader)(),
    (0, common_1.Controller)("clients"),
    __metadata("design:paramtypes", [clients_service_1.ClientsService])
], ClientsController);
//# sourceMappingURL=clients.controller.js.map