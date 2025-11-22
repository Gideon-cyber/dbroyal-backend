import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error('Prisma Error:', exception);

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handleKnownRequestError(exception, response);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return this.handleValidationError(exception, response);
    }

    // Fallback for unknown Prisma errors
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected database error occurred',
      error: 'Internal Server Error',
    });
  }

  private handleKnownRequestError(
    exception: Prisma.PrismaClientKnownRequestError,
    response: Response,
  ) {
    switch (exception.code) {
      case 'P2002': {
        // Unique constraint violation
        const target = (exception.meta?.target as string[]) || [];
        const field = target.join(', ');
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: `A record with this ${field} already exists`,
          error: 'Conflict',
        });
      }

      case 'P2025': {
        // Record not found
        return response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          error: 'Not Found',
        });
      }

      case 'P2003': {
        // Foreign key constraint violation
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid reference to related record',
          error: 'Bad Request',
        });
      }

      case 'P1001': {
        // Can't reach database server
        return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Database connection failed',
          error: 'Service Unavailable',
        });
      }

      case 'P1008': {
        // Operations timed out
        return response.status(HttpStatus.REQUEST_TIMEOUT).json({
          statusCode: HttpStatus.REQUEST_TIMEOUT,
          message: 'Database operation timed out',
          error: 'Request Timeout',
        });
      }

      default: {
        this.logger.error(`Unhandled Prisma error code: ${exception.code}`);
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A database error occurred',
          error: 'Internal Server Error',
        });
      }
    }
  }

  private handleValidationError(
    exception: Prisma.PrismaClientValidationError,
    response: Response,
  ) {
    return response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid data provided',
      error: 'Bad Request',
    });
  }
}
