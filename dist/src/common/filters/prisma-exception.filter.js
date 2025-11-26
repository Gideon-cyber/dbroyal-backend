"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PrismaExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaExceptionFilter = PrismaExceptionFilter_1 = class PrismaExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(PrismaExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const isPrismaError = exception instanceof client_1.Prisma.PrismaClientKnownRequestError ||
            exception instanceof client_1.Prisma.PrismaClientValidationError;
        if (!isPrismaError) {
            throw exception;
        }
        this.logger.error('Prisma Error:', exception);
        if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            return this.handleKnownRequestError(exception, response);
        }
        if (exception instanceof client_1.Prisma.PrismaClientValidationError) {
            return this.handleValidationError(exception, response);
        }
        return response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'An unexpected database error occurred',
            error: 'Internal Server Error',
        });
    }
    handleKnownRequestError(exception, response) {
        switch (exception.code) {
            case 'P2002': {
                const target = exception.meta?.target || [];
                const field = target.join(', ');
                return response.status(common_1.HttpStatus.CONFLICT).json({
                    statusCode: common_1.HttpStatus.CONFLICT,
                    message: `A record with this ${field} already exists`,
                    error: 'Conflict',
                });
            }
            case 'P2025': {
                return response.status(common_1.HttpStatus.NOT_FOUND).json({
                    statusCode: common_1.HttpStatus.NOT_FOUND,
                    message: 'Record not found',
                    error: 'Not Found',
                });
            }
            case 'P2003': {
                return response.status(common_1.HttpStatus.BAD_REQUEST).json({
                    statusCode: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Invalid reference to related record',
                    error: 'Bad Request',
                });
            }
            case 'P1001': {
                return response.status(common_1.HttpStatus.SERVICE_UNAVAILABLE).json({
                    statusCode: common_1.HttpStatus.SERVICE_UNAVAILABLE,
                    message: 'Database connection failed',
                    error: 'Service Unavailable',
                });
            }
            case 'P1008': {
                return response.status(common_1.HttpStatus.REQUEST_TIMEOUT).json({
                    statusCode: common_1.HttpStatus.REQUEST_TIMEOUT,
                    message: 'Database operation timed out',
                    error: 'Request Timeout',
                });
            }
            default: {
                this.logger.error(`Unhandled Prisma error code: ${exception.code}`);
                return response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'A database error occurred',
                    error: 'Internal Server Error',
                });
            }
        }
    }
    handleValidationError(exception, response) {
        return response.status(common_1.HttpStatus.BAD_REQUEST).json({
            statusCode: common_1.HttpStatus.BAD_REQUEST,
            message: 'Invalid data provided',
            error: 'Bad Request',
        });
    }
};
exports.PrismaExceptionFilter = PrismaExceptionFilter;
exports.PrismaExceptionFilter = PrismaExceptionFilter = PrismaExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], PrismaExceptionFilter);
//# sourceMappingURL=prisma-exception.filter.js.map